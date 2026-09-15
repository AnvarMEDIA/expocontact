/**
 * Leads storage.
 *
 * The connection, credential discovery and local-file fallback live in
 * lib/kv.js, which the CRM uses too. This file is only the leads collection
 * on top of it.
 *
 * Leads carry personal data (names, phone numbers), so unlike site content
 * they must NOT go into Vercel Blob — blobs are served publicly to anyone who
 * knows the URL. With no database configured on Vercel, writes throw instead
 * of pretending to succeed; the contact form treats that as non-fatal, the
 * visitor still gets a confirmation and Telegram stays the channel of record.
 *
 * Lead shape:
 *   { id, createdAt, status, name, company, phone, expo, message,
 *     source, locale, marketing?, details?, projectId?, notes: [{ts,text}],
 *     history: [{ts,status}] }
 *
 * `marketing` carries the campaign the lead came from (see lib/marketing.js)
 * and is absent for organic traffic. `details` holds the answers to the ad
 * landing's qualifying questions (see lib/leadFields.js). `projectId` is set
 * once the lead has been turned into a CRM project (see lib/crm/store.js).
 *
 * Statuses: 'new' | 'in_progress' | 'closed' | 'spam'
 */
import { kvGet, kvSet, kvStatus } from '@/lib/kv';

const KV_KEY = 'leads:all';

/** Same shape as before: the dashboard renders backend/provider/persistent/note. */
export async function leadsStatus() {
  const status = await kvStatus();
  if (status.backend === 'none') {
    return { ...status, note: `${status.note} Сейчас заявки приходят только в Telegram и не сохраняются здесь.` };
  }
  if (status.backend === 'file') {
    return { ...status, provider: 'content/data/leads.json' };
  }
  return status;
}

function newId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function listLeads() {
  const data = await kvGet(KV_KEY);
  return Array.isArray(data) ? data : [];
}

// kvSet writes to Redis, or to the local file in development, and throws with
// an actionable message when neither is available.
const saveAll = (leads) => kvSet(KV_KEY, leads);

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
    ...(payload.marketing ? { marketing: payload.marketing } : {}),
    ...(payload.details   ? { details:   payload.details   } : {}),
    notes: [],
    history: [{ ts: now, status: 'new' }],
  };
  leads.unshift(lead);
  await saveAll(leads);
  return lead;
}

export async function getLead(id) {
  const leads = await listLeads();
  return leads.find(l => l.id === id) || null;
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

/** Merge arbitrary fields into a lead. Used to link it to a CRM project. */
export async function patchLead(id, patch) {
  const leads = await listLeads();
  const idx = leads.findIndex(l => l.id === id);
  if (idx === -1) return null;
  leads[idx] = { ...leads[idx], ...patch };
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
