/**
 * CMS API, backed by the persistent store (lib/store.js).
 *
 * Locale-aware collections (documents `portfolio.<locale>`, `testimonials.<locale>`):
 *   GET  /api/admin?collection=portfolio|testimonials&locale=ru|en|uz
 *   POST /api/admin?collection=...&locale=...  body: { action, item, id }
 *     actions: create | update | delete | duplicate
 *
 * Locale-aware singletons (`settings.<locale>`, `seo.<locale>`):
 *   GET  /api/admin?collection=settings|seo&locale=ru|en|uz
 *   POST .. body: { action:'save', item }
 *
 * Locale-agnostic collection (`clients`):
 *   GET  /api/admin?collection=clients
 *   POST .. body: { action, item, id }
 *
 * Collections nested inside the locale content file (`content.<locale>`):
 *   GET  /api/admin?collection=faq|services&locale=ru|en|uz
 *   POST .. body: { action, item, id }
 *
 * Whole locale content file — every heading, label and list the site renders:
 *   GET  /api/admin?collection=content&locale=ru|en|uz
 *   POST .. body: { action:'save', item }
 *
 * Storage health, used by the admin dashboard:
 *   GET  /api/admin?collection=_status
 *
 * Protected by ADMIN_PASSWORD.
 */
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { readList, readObject, writeDoc, storeStatus } from '@/lib/store';
import { leadsStatus } from '@/lib/leads';
import { LOCALES } from '@/lib/seed';

const LOCALE_DATA_COLLECTIONS      = ['portfolio', 'testimonials'];
const GLOBAL_DATA_COLLECTIONS      = ['clients'];
const LOCALE_SINGLETON_COLLECTIONS = ['settings', 'seo'];
const NESTED_COLLECTIONS           = ['faq', 'services'];

function checkAuth(request) {
  const token    = (request.headers.get('Authorization') || '').replace('Bearer ', '');
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  return token === password;
}

/** Published pages are ISR-cached; drop that cache so edits show immediately. */
function refreshSite() {
  try {
    revalidatePath('/[locale]', 'layout');
    revalidatePath('/', 'layout');
  } catch (err) {
    console.error('[admin] revalidate failed:', err.message);
  }
}

function badRequest(error, status = 400) {
  return NextResponse.json({ error }, { status });
}

function indexedItems(items) {
  return items.map((item, i) => ({ _idx: i, id: item.id ?? String(i), ...item }));
}

// ── GET ──────────────────────────────────────────────────────────────────────
export async function GET(request) {
  if (!checkAuth(request)) return badRequest('Unauthorized', 401);

  const { searchParams } = new URL(request.url);
  const collection = searchParams.get('collection');
  const locale     = searchParams.get('locale') || 'ru';

  if (collection === '_status') {
    return NextResponse.json({
      content:   storeStatus(),
      leads:     await leadsStatus(),
      media:     { backend: process.env.BLOB_READ_WRITE_TOKEN ? 'blob' : 'local', persistent: !!process.env.BLOB_READ_WRITE_TOKEN },
      analytics: {
        metrika: !!process.env.YANDEX_METRIKA_TOKEN,
        local:   process.env.VERCEL !== '1',
      },
      telegram:  !!(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID),
      adminPasswordSet: !!process.env.ADMIN_PASSWORD,
    });
  }

  const needsLocale =
    LOCALE_DATA_COLLECTIONS.includes(collection) ||
    LOCALE_SINGLETON_COLLECTIONS.includes(collection) ||
    NESTED_COLLECTIONS.includes(collection) ||
    collection === 'content';

  if (needsLocale && !LOCALES.includes(locale)) return badRequest('Unknown locale');

  if (LOCALE_DATA_COLLECTIONS.includes(collection)) {
    return NextResponse.json(await readList(`${collection}.${locale}`));
  }

  if (GLOBAL_DATA_COLLECTIONS.includes(collection)) {
    return NextResponse.json(await readList(collection));
  }

  if (LOCALE_SINGLETON_COLLECTIONS.includes(collection)) {
    return NextResponse.json(await readObject(`${collection}.${locale}`));
  }

  if (collection === 'content') {
    return NextResponse.json(await readObject(`content.${locale}`));
  }

  if (NESTED_COLLECTIONS.includes(collection)) {
    const file  = await readObject(`content.${locale}`);
    const items = file[collection]?.items ?? [];
    return NextResponse.json(indexedItems(items));
  }

  return badRequest('Unknown collection');
}

// ── POST ─────────────────────────────────────────────────────────────────────
export async function POST(request) {
  if (!checkAuth(request)) return badRequest('Unauthorized', 401);

  const { searchParams } = new URL(request.url);
  const collection = searchParams.get('collection');
  const locale     = searchParams.get('locale') || 'ru';

  const { action, item, id } = await request.json().catch(() => ({}));

  const needsLocale =
    LOCALE_DATA_COLLECTIONS.includes(collection) ||
    LOCALE_SINGLETON_COLLECTIONS.includes(collection) ||
    NESTED_COLLECTIONS.includes(collection) ||
    collection === 'content';

  if (needsLocale && !LOCALES.includes(locale)) return badRequest('Unknown locale');

  try {
    // ── Collections of items, locale-scoped or global ─────────────────────────
    const isLocaleList = LOCALE_DATA_COLLECTIONS.includes(collection);
    const isGlobalList = GLOBAL_DATA_COLLECTIONS.includes(collection);

    if (isLocaleList || isGlobalList) {
      const doc = isLocaleList ? `${collection}.${locale}` : collection;
      let data  = await readList(doc);

      if (action === 'create') {
        const newItem = { ...item, id: Date.now().toString() };
        data.push(newItem);
        await writeDoc(doc, data);
        refreshSite();
        return NextResponse.json(newItem);
      }

      if (action === 'update') {
        if (!data.some((d) => d.id === id)) return badRequest('Not found', 404);
        data = data.map((d) => (d.id === id ? { ...d, ...item, id } : d));
        await writeDoc(doc, data);
        refreshSite();
        return NextResponse.json({ ok: true });
      }

      if (action === 'delete') {
        const next = data.filter((d) => d.id !== id);
        if (next.length === data.length) return badRequest('Not found', 404);
        await writeDoc(doc, next);
        refreshSite();
        return NextResponse.json({ ok: true });
      }

      if (action === 'duplicate' && isLocaleList) {
        const toLocale = item?.toLocale;
        if (!LOCALES.includes(toLocale)) return badRequest('Unknown toLocale');
        const source = data.find((d) => d.id === id);
        if (!source) return badRequest('Item not found', 404);

        const targetDoc = `${collection}.${toLocale}`;
        const target    = await readList(targetDoc);
        const copy      = { ...source, id: Date.now().toString() };
        target.push(copy);
        await writeDoc(targetDoc, target);
        refreshSite();
        return NextResponse.json(copy);
      }

      return badRequest('Unsupported action');
    }

    // ── Locale-scoped singletons (settings, seo) ──────────────────────────────
    if (LOCALE_SINGLETON_COLLECTIONS.includes(collection)) {
      if (action !== 'save') return badRequest('Unsupported action');
      await writeDoc(`${collection}.${locale}`, item ?? {});
      refreshSite();
      return NextResponse.json({ ok: true });
    }

    // ── Whole locale content file ────────────────────────────────────────────
    if (collection === 'content') {
      if (action !== 'save') return badRequest('Unsupported action');
      if (!item || typeof item !== 'object' || Array.isArray(item))
        return badRequest('Content must be an object');
      await writeDoc(`content.${locale}`, item);
      refreshSite();
      return NextResponse.json({ ok: true });
    }

    // ── Collections nested in the locale content file (faq, services) ────────
    if (NESTED_COLLECTIONS.includes(collection)) {
      const doc   = `content.${locale}`;
      const file  = await readObject(doc);
      const items = file[collection]?.items ?? [];

      const persist = async (nextItems) => {
        file[collection] = { ...(file[collection] || {}), items: nextItems };
        await writeDoc(doc, file);
        refreshSite();
      };

      if (collection === 'faq') {
        if (action === 'create') {
          items.push({ q: item?.q ?? '', a: item?.a ?? '' });
          await persist(items);
          return NextResponse.json({ ok: true, idx: items.length - 1 });
        }
        const idx = Number(id);
        if (!Number.isInteger(idx) || idx < 0 || idx >= items.length)
          return badRequest('Not found', 404);

        if (action === 'update') {
          items[idx] = { q: item?.q ?? items[idx].q, a: item?.a ?? items[idx].a };
          await persist(items);
          return NextResponse.json({ ok: true });
        }
        if (action === 'delete') {
          items.splice(idx, 1);
          await persist(items);
          return NextResponse.json({ ok: true });
        }
        return badRequest('Unsupported action');
      }

      if (collection === 'services' && action === 'update') {
        const idx = items.findIndex((s) => s.id === id);
        if (idx === -1) return badRequest('Not found', 404);
        items[idx] = {
          ...items[idx],
          ...(item?.title !== undefined && { title: item.title }),
          ...(item?.short !== undefined && { short: item.short }),
          ...(item?.full  !== undefined && { full:  item.full  }),
        };
        await persist(items);
        return NextResponse.json({ ok: true });
      }

      return badRequest('Unsupported action');
    }

    return badRequest('Unknown collection');
  } catch (err) {
    // A write with nowhere durable to go must surface, not look like a success.
    console.error('[admin] write failed:', err);
    return NextResponse.json(
      { error: `Не удалось сохранить: ${err.message}` },
      { status: 500 },
    );
  }
}
