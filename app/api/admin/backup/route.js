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
 *       leads:                  [...],
 *       clients:                [...],
 *       portfolio_ru/en/uz:     [...],
 *       testimonials_ru/en/uz:  [...],
 *       settings_ru/en/uz:      {...},
 *       seo_ru/en/uz:           {...},
 *       locale_ru/en/uz:        {...}   // full content/{locale}.json
 *     }
 *   }
 *
 * Reads and writes go through the persistent store, so a restore performed on
 * production actually replaces the live content instead of writing to a
 * read-only filesystem.
 *
 * Protected by ADMIN_PASSWORD.
 */
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { readDoc, writeDoc } from '@/lib/store';
import { LOCALES } from '@/lib/seed';
import { listLeads, restoreLeads } from '@/lib/leads';
import { exportProjects, restoreProjects } from '@/lib/crm/store';

function checkAuth(request) {
  const token = (request.headers.get('Authorization') || '').replace('Bearer ', '');
  return token === (process.env.ADMIN_PASSWORD || 'admin123');
}

export async function GET(request) {
  if (!checkAuth(request))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const data = {
    clients: await readDoc('clients'),
  };

  // Leads live in a separate store and may be unavailable; never fail the
  // whole backup because of them.
  try {
    data.leads = await listLeads();
  } catch (err) {
    data.leads = [];
    data.leadsError = err.message;
  }

  // Projects share that store, and the same rule applies: a backup without
  // them would quietly look complete.
  try {
    data.crm = await exportProjects();
  } catch (err) {
    data.crm = null;
    data.crmError = err.message;
  }

  for (const locale of LOCALES) {
    data[`portfolio_${locale}`]    = await readDoc(`portfolio.${locale}`);
    data[`testimonials_${locale}`] = await readDoc(`testimonials.${locale}`);
    data[`settings_${locale}`]     = await readDoc(`settings.${locale}`);
    data[`seo_${locale}`]          = await readDoc(`seo.${locale}`);
    data[`locale_${locale}`]       = await readDoc(`content.${locale}`);
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

  const isList   = (v) => Array.isArray(v);
  const isObject = (v) => v && typeof v === 'object' && !Array.isArray(v);

  if (isList(d.clients))
    await trySave('clients', () => writeDoc('clients', d.clients));

  for (const locale of LOCALES) {
    if (isList(d[`portfolio_${locale}`]))
      await trySave(`portfolio.${locale}`, () => writeDoc(`portfolio.${locale}`, d[`portfolio_${locale}`]));
    if (isList(d[`testimonials_${locale}`]))
      await trySave(`testimonials.${locale}`, () => writeDoc(`testimonials.${locale}`, d[`testimonials_${locale}`]));
    if (isObject(d[`settings_${locale}`]))
      await trySave(`settings.${locale}`, () => writeDoc(`settings.${locale}`, d[`settings_${locale}`]));
    if (isObject(d[`seo_${locale}`]))
      await trySave(`seo.${locale}`, () => writeDoc(`seo.${locale}`, d[`seo_${locale}`]));
    if (isObject(d[`locale_${locale}`]))
      await trySave(`content.${locale}`, () => writeDoc(`content.${locale}`, d[`locale_${locale}`]));
  }

  if (isList(d.leads))
    await trySave('leads', () => restoreLeads(d.leads));

  if (isObject(d.crm) && Array.isArray(d.crm.projects))
    await trySave('projects', () => restoreProjects(d.crm));

  try {
    revalidatePath('/[locale]', 'layout');
    revalidatePath('/', 'layout');
  } catch { /* revalidation is best-effort */ }

  return NextResponse.json({ ok: failed.length === 0, restored, failed });
}
