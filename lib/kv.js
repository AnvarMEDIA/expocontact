/**
 * The project's one connection to the key-value store.
 *
 * Everything that holds personal or operational data — leads and now the CRM —
 * goes through here. Vercel Blob is not an option for any of it: blobs are
 * served publicly to anyone who knows the URL.
 *
 *   - Upstash Redis     → any <prefix>KV_REST_API_URL + _TOKEN pair
 *   - local development → JSON files under content/data/
 *
 * The credential discovery below is deliberately not a pair of hardcoded
 * variable names. The Vercel Upstash integration prefixes the standard names
 * with the store label, so this project has UPSTASH_REDIS_REST_KV_REST_API_URL
 * rather than the documented UPSTASH_REDIS_REST_URL, and the retired Vercel KV
 * store left bare KV_REST_API_* variables behind that no longer resolve. So:
 * collect every pair present, try prefixed ones first, and probe each with a
 * real read before using it.
 */
import { promises as fs } from 'fs';
import path from 'path';

export const ON_VERCEL = process.env.VERCEL === '1';

const DATA_DIR = path.join(process.cwd(), 'content', 'data');

/**
 * Local-development file for a key. The leads collection keeps its historical
 * path so an existing dev database is not orphaned by this refactor.
 */
function fileFor(key) {
  if (key === 'leads:all') return path.join(DATA_DIR, 'leads.json');
  return path.join(DATA_DIR, 'kv', `${key.replace(/[^a-zA-Z0-9_-]+/g, '_')}.json`);
}

const URL_SUFFIXES = ['KV_REST_API_URL', 'UPSTASH_REDIS_REST_URL'];

export function credentialCandidates() {
  const env = process.env;
  const out = [];

  for (const suffix of URL_SUFFIXES) {
    const tokenSuffix = suffix.replace(/_URL$/, '_TOKEN');
    for (const key of Object.keys(env)) {
      if (!key.endsWith(suffix)) continue;
      const prefix   = key.slice(0, key.length - suffix.length);
      const tokenKey = `${prefix}${tokenSuffix}`;
      const url = env[key];
      const token = env[tokenKey];
      if (!url || !token || !/^https?:\/\//.test(url)) continue;
      const isUpstash = url.includes('upstash.io') || key.includes('UPSTASH');
      out.push({
        url, token, urlVar: key, tokenVar: tokenKey,
        provider: isUpstash ? 'Upstash Redis' : 'Vercel KV',
        prefixed: prefix.length > 0,
      });
    }
  }

  // Prefixed pairs first: they come from the integration installed most
  // recently, while a bare pair is usually a leftover from a retired store.
  return out.sort((a, b) => Number(b.prefixed) - Number(a.prefixed));
}

/** A cheap read that proves the credentials are accepted by the store. */
async function probe(client) {
  await client.get('kv:__healthcheck');
  return true;
}

let _resolved;       // { client, creds } once a candidate answered
let _resolveError;   // last failure, surfaced on the dashboard

/** The shared client, or null when no credentials are configured at all. */
export async function kvClient() {
  if (_resolved) return _resolved.client;

  const candidates = credentialCandidates();
  if (!candidates.length) return null;

  const { createClient } = await import('@vercel/kv');
  const errors = [];

  for (const creds of candidates) {
    try {
      const client = createClient({ url: creds.url, token: creds.token });
      await probe(client);
      _resolved = { client, creds };
      _resolveError = null;
      return client;
    } catch (err) {
      errors.push(`${creds.urlVar}: ${err.message}`);
    }
  }

  _resolveError = errors.join('; ');
  throw new Error(`Ни одна пара переменных Redis не отвечает. ${_resolveError}`);
}

/**
 * Reported on the admin dashboard. Actually talks to the database instead of
 * only checking that an env var exists, so a stale credential shows as red.
 */
export async function kvStatus() {
  const candidates = credentialCandidates();

  if (candidates.length) {
    try {
      await kvClient();
      const { creds } = _resolved;
      return {
        backend:    'kv',
        provider:   creds.provider,
        persistent: true,
        note:       `Подключено через ${creds.urlVar}.`,
      };
    } catch (err) {
      return {
        backend:    'kv',
        provider:   candidates[0].provider,
        persistent: false,
        note:       `База найдена (${candidates.map(c => c.urlVar).join(', ')}), но не отвечает. ${err.message}`,
      };
    }
  }

  if (ON_VERCEL) {
    return {
      backend:    'none',
      provider:   null,
      persistent: false,
      note: 'Нет базы. Подключите Upstash Redis в Vercel → Storage. '
          + 'Подойдут любые переменные, оканчивающиеся на KV_REST_API_URL и KV_REST_API_TOKEN. '
          + 'Без неё заявки приходят только в Telegram, а проекты не сохраняются.',
    };
  }

  return { backend: 'file', provider: 'content/data/', persistent: true };
}

/** Read one document. Returns null when absent — never throws on a miss. */
export async function kvGet(key) {
  const kv = await kvClient();
  if (kv) return (await kv.get(key)) ?? null;
  if (ON_VERCEL) return null;
  try {
    return JSON.parse(await fs.readFile(fileFor(key), 'utf8'));
  } catch {
    return null;
  }
}

/**
 * Read many documents in one round trip. Missing keys come back as null in
 * the same order, so the caller can zip them with the ids it asked for.
 */
export async function kvMGet(keys) {
  if (!keys.length) return [];
  const kv = await kvClient();
  if (kv) {
    const values = await kv.mget(...keys);
    return keys.map((_, i) => values?.[i] ?? null);
  }
  return Promise.all(keys.map(k => kvGet(k)));
}

export async function kvSet(key, value) {
  const kv = await kvClient();
  if (kv) { await kv.set(key, value); return; }
  if (ON_VERCEL) {
    throw new Error(
      'Хранилище не настроено: на Vercel файловая система только для чтения. '
      + 'Подключите Upstash Redis в Vercel → Storage.',
    );
  }
  const file = fileFor(key);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(value, null, 2), 'utf8');
}

/* ── Counters and sets ───────────────────────────────────────────────────────
 * Analytics needs these: two visits arriving at the same moment must both be
 * counted, and a read-modify-write of a JSON blob would lose one of them.
 * Redis does the arithmetic atomically. In development they fall back to the
 * same JSON files, where concurrency is not a concern.
 */

/** Add `by` to one field of a hash. Returns the new value. */
export async function kvHIncr(key, field, by = 1) {
  const kv = await kvClient();
  if (kv) return kv.hincrby(key, field, by);
  const doc = (await kvGet(key)) || {};
  doc[field] = (Number(doc[field]) || 0) + by;
  await kvSet(key, doc);
  return doc[field];
}

/** The whole hash as a plain object; {} when absent. */
export async function kvHGetAll(key) {
  const kv = await kvClient();
  if (kv) return (await kv.hgetall(key)) || {};
  return (await kvGet(key)) || {};
}

/** Add a member to a set; returns 1 when it was new, 0 when already there. */
export async function kvSAdd(key, member) {
  const kv = await kvClient();
  if (kv) return kv.sadd(key, member);
  const doc = (await kvGet(key)) || [];
  if (doc.includes(member)) return 0;
  doc.push(member);
  await kvSet(key, doc);
  return 1;
}

/** How many members a set holds. */
export async function kvSCard(key) {
  const kv = await kvClient();
  if (kv) return (await kv.scard(key)) || 0;
  return ((await kvGet(key)) || []).length;
}

export async function kvSMembers(key) {
  const kv = await kvClient();
  if (kv) return (await kv.smembers(key)) || [];
  return (await kvGet(key)) || [];
}

/** Let a key expire, so analytics does not grow without bound. */
export async function kvExpire(key, seconds) {
  const kv = await kvClient();
  if (kv) await kv.expire(key, seconds);
  // Development files are cleaned by hand; nothing to do.
}

export async function kvDel(key) {
  const kv = await kvClient();
  if (kv) { await kv.del(key); return; }
  if (ON_VERCEL) return;
  try { await fs.unlink(fileFor(key)); } catch { /* already gone */ }
}
