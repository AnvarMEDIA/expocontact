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

function redisCredentials() {
  const { KV_REST_API_URL, KV_REST_API_TOKEN,
          UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN } = process.env;

  if (KV_REST_API_URL && KV_REST_API_TOKEN) {
    return { url: KV_REST_API_URL, token: KV_REST_API_TOKEN, provider: 'Vercel KV' };
  }
  if (UPSTASH_REDIS_REST_URL && UPSTASH_REDIS_REST_TOKEN) {
    return { url: UPSTASH_REDIS_REST_URL, token: UPSTASH_REDIS_REST_TOKEN, provider: 'Upstash Redis' };
  }
  return null;
}

let _client = null;
async function getClient() {
  const creds = redisCredentials();
  if (!creds) return null;
  if (_client) return _client;
  const { createClient } = await import('@vercel/kv');
  _client = createClient({ url: creds.url, token: creds.token });
  return _client;
}

/** Reported on the admin dashboard so the state of lead storage is visible. */
export function leadsStatus() {
  const creds = redisCredentials();
  if (creds) {
    return { backend: 'kv', provider: creds.provider, persistent: true };
  }
  if (ON_VERCEL) {
    return {
      backend:    'none',
      provider:   null,
      persistent: false,
      note: 'Нет базы для заявок. Подключите Upstash Redis (Vercel → Storage) '
          + 'и задайте UPSTASH_REDIS_REST_URL и UPSTASH_REDIS_REST_TOKEN. '
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
