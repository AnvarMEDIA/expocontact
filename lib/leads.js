/**
 * Leads storage layer.
 *
 * Uses Vercel KV when KV_REST_API_URL is set (production), otherwise falls
 * back to a JSON file at content/data/leads.json (dev + early deployments).
 *
 * Lead shape:
 *   { id, createdAt, status, name, company, phone, expo, message,
 *     source, locale, notes: [{ts,text}], history: [{ts,status}] }
 *
 * Statuses: 'new' | 'in_progress' | 'closed' | 'spam'
 */
import { promises as fs } from 'fs';
import path from 'path';

const FILE = path.join(process.cwd(), 'content', 'data', 'leads.json');
const KV_KEY = 'leads:all';

const useKV = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

let _kv = null;
async function getKV() {
  if (!useKV) return null;
  if (_kv) return _kv;
  const { kv } = await import('@vercel/kv');
  _kv = kv;
  return kv;
}

function newId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function listLeads() {
  const kv = await getKV();
  if (kv) {
    const data = await kv.get(KV_KEY);
    return Array.isArray(data) ? data : [];
  }
  try {
    return JSON.parse(await fs.readFile(FILE, 'utf8'));
  } catch {
    return [];
  }
}

async function saveAll(leads) {
  const kv = await getKV();
  if (kv) {
    await kv.set(KV_KEY, leads);
    return;
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
