/**
 * Persistent content store.
 *
 * Why this exists: the admin panel used to write straight to content/*.json
 * with fs. That works on a laptop and silently fails on Vercel, where the
 * filesystem is read-only — so every edit made in production was lost and the
 * site never changed. This module keeps the same JSON documents in Vercel Blob
 * instead, which is already connected to the project.
 *
 * Layout in Blob:  cms/<doc>.json   (e.g. cms/portfolio.ru.json)
 *
 * Resolution order for a read:
 *   1. Blob, when BLOB_READ_WRITE_TOKEN is set and the document exists there
 *   2. the local file, in development
 *   3. the built-in seed compiled into the bundle (lib/seed.js)
 *
 * Documents here are public website content. Do NOT put personal data such as
 * leads in this store: Blob objects are served publicly to anyone holding the
 * URL. Leads live in lib/leads.js, which needs a real database.
 */
import { seedOf } from '@/lib/seed';

const BLOB_PREFIX = 'cms/';

/** Cached documents, so one render does not refetch the same JSON repeatedly. */
const CACHE_TTL_MS = 10_000;
const docCache = new Map(); // name -> { value, expires }

/** pathname -> public URL, refreshed together with the document cache. */
let blobIndex = null;
let blobIndexExpires = 0;

export function hasBlobStore() {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

function blobPath(name) {
  return `${BLOB_PREFIX}${name}.json`;
}

/** content.ru → content/ru.json; everything else → content/data/<name>.json */
async function localPath(name) {
  const path = (await import('path')).default;
  if (name.startsWith('content.')) {
    return path.join(process.cwd(), 'content', `${name.slice('content.'.length)}.json`);
  }
  return path.join(process.cwd(), 'content', 'data', `${name}.json`);
}

/** One list() call gives the URL of every stored document. */
async function getBlobIndex() {
  const now = Date.now();
  if (blobIndex && now < blobIndexExpires) return blobIndex;

  const { list } = await import('@vercel/blob');
  const result = await list({ prefix: BLOB_PREFIX, limit: 1000 });
  const index = new Map();
  for (const b of result.blobs || []) index.set(b.pathname, b.url);

  blobIndex = index;
  blobIndexExpires = now + CACHE_TTL_MS;
  return index;
}

/** Drop caches so the next read sees a write made in this same process. */
export function invalidate(name) {
  if (name) docCache.delete(name);
  else docCache.clear();
  blobIndex = null;
  blobIndexExpires = 0;
}

async function readFromBlob(name) {
  const index = await getBlobIndex();
  const url = index.get(blobPath(name));
  if (!url) return undefined;

  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Blob read ${res.status} for ${name}`);
  return res.json();
}

async function readFromDisk(name) {
  const { promises: fs } = await import('fs');
  const raw = await fs.readFile(await localPath(name), 'utf8');
  return JSON.parse(raw);
}

/**
 * Read one document. Never throws: on any storage failure it degrades to the
 * built-in content rather than rendering an empty site.
 */
export async function readDoc(name) {
  const cached = docCache.get(name);
  if (cached && Date.now() < cached.expires) return cached.value;

  let value;
  try {
    if (hasBlobStore()) {
      value = await readFromBlob(name);
    } else {
      value = await readFromDisk(name);
    }
  } catch (err) {
    console.error(`[store] read failed for ${name}:`, err.message);
  }

  if (value === undefined) value = seedOf(name);
  if (value === undefined) value = null;

  docCache.set(name, { value, expires: Date.now() + CACHE_TTL_MS });
  return value;
}

/**
 * Write one document. Throws when there is nowhere durable to write, so the
 * admin panel can report the failure instead of showing a fake success.
 */
export async function writeDoc(name, value) {
  if (hasBlobStore()) {
    const { put } = await import('@vercel/blob');
    await put(blobPath(name), JSON.stringify(value, null, 2), {
      access:          'public',
      contentType:     'application/json',
      addRandomSuffix: false,
      allowOverwrite:  true,
      cacheControlMaxAge: 0,
    });
  } else {
    const { promises: fs } = await import('fs');
    const path = (await import('path')).default;
    const file = await localPath(name);
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, JSON.stringify(value, null, 2), 'utf8');
  }

  invalidate(name);
  return value;
}

/** Convenience wrappers that guarantee the shape callers expect. */
export async function readList(name) {
  const value = await readDoc(name);
  return Array.isArray(value) ? value : [];
}

export async function readObject(name) {
  const value = await readDoc(name);
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

/**
 * Where content is being stored right now — shown in the admin panel so an
 * editor can tell at a glance whether their changes will survive.
 */
export function storeStatus() {
  return hasBlobStore()
    ? { backend: 'blob', persistent: true, note: 'Vercel Blob (cms/)' }
    : { backend: 'filesystem', persistent: process.env.VERCEL !== '1',
        note: process.env.VERCEL === '1'
          ? 'Read-only filesystem — edits will NOT be saved. Connect Vercel Blob.'
          : 'Local files in content/ (development)' };
}
