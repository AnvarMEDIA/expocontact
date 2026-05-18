/**
 * File-based CMS API
 *
 * Data collections (content/data/*.json):
 *   GET  /api/admin?collection=portfolio|testimonials|clients
 *   POST /api/admin?collection=...  body: { action, item, id }
 *
 * Locale collections (content/{locale}.json):
 *   GET  /api/admin?collection=faq|services&locale=ru|en|uz
 *   POST /api/admin?collection=faq|services&locale=ru|en|uz  body: { action, item, id }
 *
 * Protected by ADMIN_PASSWORD env var (default: "admin123").
 */
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR    = path.join(process.cwd(), 'content', 'data');
const CONTENT_DIR = path.join(process.cwd(), 'content');

const DATA_COLLECTIONS   = ['portfolio', 'testimonials', 'clients'];
const LOCALE_COLLECTIONS = ['faq', 'services'];
const SINGLETON_COLLECTIONS = ['settings'];
const LOCALES            = ['ru', 'en', 'uz'];

// ── Auth ─────────────────────────────────────────────────────────────────────
function checkAuth(request) {
  const token    = (request.headers.get('Authorization') || '').replace('Bearer ', '');
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  return token === password;
}

// ── Data collection helpers ──────────────────────────────────────────────────
async function readData(collection) {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, `${collection}.json`), 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeData(collection, data) {
  await fs.writeFile(
    path.join(DATA_DIR, `${collection}.json`),
    JSON.stringify(data, null, 2),
    'utf8',
  );
}

// Singleton helpers (object-shaped JSON files in content/data/).
async function readSingleton(collection) {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, `${collection}.json`), 'utf8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function writeSingleton(collection, data) {
  await fs.writeFile(
    path.join(DATA_DIR, `${collection}.json`),
    JSON.stringify(data, null, 2),
    'utf8',
  );
}

// ── Locale file helpers ──────────────────────────────────────────────────────
async function readLocale(locale) {
  const raw = await fs.readFile(path.join(CONTENT_DIR, `${locale}.json`), 'utf8');
  return JSON.parse(raw);
}

async function writeLocale(locale, data) {
  await fs.writeFile(
    path.join(CONTENT_DIR, `${locale}.json`),
    JSON.stringify(data, null, 2),
    'utf8',
  );
}

function indexedItems(items) {
  return items.map((item, i) => ({ _idx: i, id: item.id ?? String(i), ...item }));
}

// ── GET ──────────────────────────────────────────────────────────────────────
export async function GET(request) {
  if (!checkAuth(request))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const collection = searchParams.get('collection');
  const locale     = searchParams.get('locale') || 'ru';

  if (DATA_COLLECTIONS.includes(collection)) {
    return NextResponse.json(await readData(collection));
  }

  if (SINGLETON_COLLECTIONS.includes(collection)) {
    return NextResponse.json(await readSingleton(collection));
  }

  if (LOCALE_COLLECTIONS.includes(collection)) {
    if (!LOCALES.includes(locale))
      return NextResponse.json({ error: 'Unknown locale' }, { status: 400 });
    const file  = await readLocale(locale);
    const items = file[collection]?.items ?? [];
    return NextResponse.json(indexedItems(items));
  }

  return NextResponse.json({ error: 'Unknown collection' }, { status: 400 });
}

// ── POST ─────────────────────────────────────────────────────────────────────
export async function POST(request) {
  if (!checkAuth(request))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const collection = searchParams.get('collection');
  const locale     = searchParams.get('locale') || 'ru';

  const { action, item, id } = await request.json();

  // ── Data collections ──────────────────────────────────────────────────────
  if (DATA_COLLECTIONS.includes(collection)) {
    let data = await readData(collection);

    if (action === 'create') {
      const newItem = { ...item, id: Date.now().toString() };
      data.push(newItem);
      await writeData(collection, data);
      return NextResponse.json(newItem);
    }
    if (action === 'update') {
      data = data.map((d) => (d.id === id ? { ...d, ...item, id } : d));
      await writeData(collection, data);
      return NextResponse.json({ ok: true });
    }
    if (action === 'delete') {
      data = data.filter((d) => d.id !== id);
      await writeData(collection, data);
      return NextResponse.json({ ok: true });
    }
  }

  // ── Singleton collections (whole-object save) ─────────────────────────────
  if (SINGLETON_COLLECTIONS.includes(collection)) {
    if (action === 'save') {
      await writeSingleton(collection, item ?? {});
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
  }

  // ── Locale collections ────────────────────────────────────────────────────
  if (LOCALE_COLLECTIONS.includes(collection)) {
    if (!LOCALES.includes(locale))
      return NextResponse.json({ error: 'Unknown locale' }, { status: 400 });

    const file  = await readLocale(locale);
    const items = file[collection]?.items ?? [];

    if (collection === 'faq') {
      if (action === 'create') {
        items.push({ q: item.q ?? '', a: item.a ?? '' });
        file.faq.items = items;
        await writeLocale(locale, file);
        return NextResponse.json({ ok: true, idx: items.length - 1 });
      }
      if (action === 'update') {
        const idx = Number(id);
        if (idx < 0 || idx >= items.length)
          return NextResponse.json({ error: 'Not found' }, { status: 404 });
        items[idx] = { q: item.q ?? items[idx].q, a: item.a ?? items[idx].a };
        file.faq.items = items;
        await writeLocale(locale, file);
        return NextResponse.json({ ok: true });
      }
      if (action === 'delete') {
        const idx = Number(id);
        if (idx < 0 || idx >= items.length)
          return NextResponse.json({ error: 'Not found' }, { status: 404 });
        items.splice(idx, 1);
        file.faq.items = items;
        await writeLocale(locale, file);
        return NextResponse.json({ ok: true });
      }
    }

    if (collection === 'services' && action === 'update') {
      const idx = items.findIndex((s) => s.id === id);
      if (idx === -1)
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      items[idx] = {
        ...items[idx],
        ...(item.title !== undefined && { title: item.title }),
        ...(item.short !== undefined && { short: item.short }),
        ...(item.full  !== undefined && { full:  item.full  }),
      };
      file.services.items = items;
      await writeLocale(locale, file);
      return NextResponse.json({ ok: true });
    }
  }

  return NextResponse.json({ error: 'Unknown action or collection' }, { status: 400 });
}
