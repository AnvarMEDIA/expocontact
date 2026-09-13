/**
 * Leads storage layer.
 *
 * Leads carry personal data (names, phone numbers), so unlike site content
 * they must NOT go into Vercel Blob — blobs are served publicly to anyone who
 * knows the URL. They need a real key-value database:
 *
 *   - Vercel KV            → KV_REST_API_URL + KV_REST_API_TOKEN
 *   - Upstash Redis        → UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
 *     (Vercel KV was retired in favour of Upstash via the Marketplace; both
 *      env pairs are accepted so either integration works.)
 *   - local development    → content/data/leads.json
 *
 * With none of these configured on Vercel, writes throw instead of pretending
 * to succeed. The contact form treats that as non-fatal: the visitor still
 * gets a confirmation and the lead still reaches Telegram, which stays the
 * delivery channel of record.
 *
 * Lead shape:
 *   { id, createdAt, status, name, company, phone, expo, message,
 *     source, locale, notes: [{ts,text}], history: [{ts,status}] }
 *
 * Statuses: 'new' | 'in_progress' | 'closed' | 'spam'
 */
import { promises as fs } from 'fs';
import path from 'path';

const FILE   = path.join(process.cwd(), 'content', 'data', 'leads.json');
const KV_KEY = 'leads:all';

const ON_VERCEL = process.env.VERCEL === '1';

/**
 * Find every REST credential pair present in the environment.
 *
 * The Vercel Upstash integration prefixes the standard names with whatever
 * label the store was created under, so this project has
 * UPSTASH_REDIS_REST_KV_REST_API_URL / ..._TOKEN rather than the documented
 * UPSTASH_REDIS_REST_URL. The retired Vercel KV store also left bare
 * KV_REST_API_URL / KV_REST_API_TOKEN behind, which now point at nothing.
 *
 * So instead of hardcoding names: collect any `<prefix>KV_REST_API_URL` or
 * `<prefix>UPSTASH_REDIS_REST_URL` that has a matching token, and try them in
 * order until one answers. A prefixed pair is tried before a bare one, because
 * the bare pair is the leftover from the old store.
 */
const URL_SUFFIXES = ['KV_REST_API_URL', 'UPSTASH_REDIS_REST_URL'];

function credentialCandidates() {
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
  await client.get('leads:__healthcheck');
  return true;
}

let _resolved;       // { client, creds } once a candidate answered
let _resolveError;   // last failure, surfaced on the dashboard

async function getClient() {
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
export async function leadsStatus() {
  const candidates = credentialCandidates();

  if (candidates.length) {
    try {
      await getClient();
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
      note: 'Нет базы для заявок. Подключите Upstash Redis в Vercel → Storage. '
          + 'Подойдут любые переменные, оканчивающиеся на KV_REST_API_URL и KV_REST_API_TOKEN. '
          + 'Сейчас заявки приходят только в Telegram и не сохраняются здесь.',
    };
  }

  return { backend: 'file', provider: 'content/data/leads.json', persistent: true };
}

function newId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function listLeads() {
  const kv = await getClient();
  if (kv) {
    const data = await kv.get(KV_KEY);
    return Array.isArray(data) ? data : [];
  }
  if (ON_VERCEL) return [];
  try {
    return JSON.parse(await fs.readFile(FILE, 'utf8'));
  } catch {
    return [];
  }
}

async function saveAll(leads) {
  const kv = await getClient();
  if (kv) {
    await kv.set(KV_KEY, leads);
    return;
  }
  if (ON_VERCEL) {
    throw new Error(
      'Хранилище заявок не настроено: на Vercel файловая система только для чтения. '
      + 'Подключите Upstash Redis и задайте UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN.',
    );
  }
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(leads, null, 2), 'utf8');
}

export async function createLead(payload) {
  const leads = await listLeads();
  const now = Date.now();
  const lead = {
    id: newId(),
    createdAt: now,
    status: 'new',
    name: payload.name || '',
    company: payload.company || '',
    phone: payload.phone || '',
    expo: payload.expo || payload.event || '',
    message: payload.message || '',
    source: payload.source || 'contact',
    locale: payload.locale || 'ru',
    notes: [],
    history: [{ ts: now, status: 'new' }],
  };
  leads.unshift(lead);
  await saveAll(leads);
  return lead;
}

export async function updateLeadStatus(id, status) {
  const VALID = ['new', 'in_progress', 'closed', 'spam'];
  if (!VALID.includes(status)) return null;
  const leads = await listLeads();
  const idx = leads.findIndex(l => l.id === id);
  if (idx === -1) return null;
  if (leads[idx].status === status) return leads[idx];
  leads[idx] = {
    ...leads[idx],
    status,
    history: [...(leads[idx].history || []), { ts: Date.now(), status }],
  };
  await saveAll(leads);
  return leads[idx];
}

export async function addLeadNote(id, text) {
  if (!text || !text.trim()) return null;
  const leads = await listLeads();
  const idx = leads.findIndex(l => l.id === id);
  if (idx === -1) return null;
  leads[idx] = {
    ...leads[idx],
    notes: [...(leads[idx].notes || []), { ts: Date.now(), text: text.trim() }],
  };
  await saveAll(leads);
  return leads[idx];
}

export async function deleteLead(id) {
  const leads = await listLeads();
  const filtered = leads.filter(l => l.id !== id);
  if (filtered.length === leads.length) return false;
  await saveAll(filtered);
  return true;
}

export async function countNewLeads() {
  const leads = await listLeads();
  return leads.filter(l => l.status === 'new').length;
}

// Used by backup/restore: replaces the whole leads collection with the provided list.
export async function restoreLeads(leads) {
  if (!Array.isArray(leads)) return false;
  await saveAll(leads);
  return true;
}
