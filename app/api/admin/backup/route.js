/**
 * Admin backup / restore
 *   GET    /api/admin/backup  — download a JSON snapshot of every collection
 *   POST   /api/admin/backup  — restore from an uploaded JSON snapshot
 *
 * Backup shape:
 *   {
 *     version:   1,
 *     timestamp: ISO string,
 *     site:      'expocontact',
 *     data: {
 *       leads:               [...],
 *       clients:             [...],
 *       portfolio_ru/en/uz:  [...],
 *       testimonials_ru/en/uz: [...],
 *       settings_ru/en/uz:   {...},
 *       seo_ru/en/uz:        {...},
 *       locale_ru/en/uz:     {...}   // full content/{locale}.json (FAQ + services + nav + ...)
 *     }
 *   }
 *
 * Protected by ADMIN_PASSWORD.
 */
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { listLeads, restoreLeads } from '@/lib/leads';

const DATA_DIR    = path.join(process.cwd(), 'content', 'data');
const CONTENT_DIR = path.join(process.cwd(), 'content');
const LOCALES     = ['ru', 'en', 'uz'];

function checkAuth(request) {
  const token = (request.headers.get('Authorization') || '').replace('Bearer ', '');
  return token === (process.env.ADMIN_PASSWORD || 'admin123');
}

async function readJson(filepath, fallback) {
  try { return JSON.parse(await fs.readFile(filepath, 'utf8')); }
  catch { return fallback; }
}

async function writeJson(filepath, content) {
  await fs.mkdir(path.dirname(filepath), { recursive: true });
  await fs.writeFile(filepath, JSON.stringify(content, null, 2), 'utf8');
}

export async function GET(request) {
  if (!checkAuth(request))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const data = {
    leads:   await listLeads(),
    clients: await readJson(path.join(DATA_DIR, 'clients.json'), []),
  };

  for (const locale of LOCALES) {
    data[`portfolio_${locale}`]    = await readJson(path.join(DATA_DIR, `portfolio.${locale}.json`),    []);
    data[`testimonials_${locale}`] = await readJson(path.join(DATA_DIR, `testimonials.${locale}.json`), []);
    data[`settings_${locale}`]     = await readJson(path.join(DATA_DIR, `settings.${locale}.json`),     {});
    data[`seo_${locale}`]          = await readJson(path.join(DATA_DIR, `seo.${locale}.json`),          {});
    data[`locale_${locale}`]       = await readJson(path.join(CONTENT_DIR, `${locale}.json`),           {});
  }

  const backup = {
    version:   1,
    timestamp: new Date().toISOString(),
    site:      'expocontact',
    data,
  };

  const date = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
  return new Response(JSON.stringify(backup, null, 2), {
    headers: {
      'Content-Type':        'application/json',
      'Content-Disposition': `attachment; filename="expocontact-backup-${date}.json"`,
    },
  });
}

export async function POST(request) {
  if (!checkAuth(request))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let backup;
  try { backup = await request.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  if (!backup || backup.version !== 1 || !backup.data || typeof backup.data !== 'object')
    return NextResponse.json({ error: 'Invalid backup format (version 1 expected)' }, { status: 400 });

  const d = backup.data;
  const restored = [];
  const failed   = [];

  const trySave = async (label, fn) => {
    try { await fn(); restored.push(label); }
    catch (err) { failed.push({ label, error: err.message }); }
  };

  if (Array.isArray(d.clients))
    await trySave('clients', () => writeJson(path.join(DATA_DIR, 'clients.json'), d.clients));

  for (const locale of LOCALES) {
    if (Array.isArray(d[`portfolio_${locale}`]))
      await trySave(`portfolio.${locale}`, () => writeJson(path.join(DATA_DIR, `portfolio.${locale}.json`), d[`portfolio_${locale}`]));
    if (Array.isArray(d[`testimonials_${locale}`]))
      await trySave(`testimonials.${locale}`, () => writeJson(path.join(DATA_DIR, `testimonials.${locale}.json`), d[`testimonials_${locale}`]));
    if (d[`settings_${locale}`] && typeof d[`settings_${locale}`] === 'object')
      await trySave(`settings.${locale}`, () => writeJson(path.join(DATA_DIR, `settings.${locale}.json`), d[`settings_${locale}`]));
    if (d[`seo_${locale}`] && typeof d[`seo_${locale}`] === 'object')
      await trySave(`seo.${locale}`, () => writeJson(path.join(DATA_DIR, `seo.${locale}.json`), d[`seo_${locale}`]));
    if (d[`locale_${locale}`] && typeof d[`locale_${locale}`] === 'object')
      await trySave(`${locale}.json`, () => writeJson(path.join(CONTENT_DIR, `${locale}.json`), d[`locale_${locale}`]));
  }

  if (Array.isArray(d.leads))
    await trySave('leads', () => restoreLeads(d.leads));

  return NextResponse.json({ ok: failed.length === 0, restored, failed });
}
