/**
 * Simple file-based CMS API
 * GET  /api/admin?collection=portfolio|testimonials|clients
 * POST /api/admin?collection=...   — body: { action: 'create'|'update'|'delete', item, id }
 *
 * Protected by ADMIN_PASSWORD env variable (default: "admin123" for dev).
 */
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'content', 'data');
const ALLOWED  = ['portfolio', 'testimonials', 'clients'];

function filePath(collection) {
  return path.join(DATA_DIR, `${collection}.json`);
}

async function readCollection(collection) {
  try {
    const raw = await fs.readFile(filePath(collection), 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeCollection(collection, data) {
  await fs.writeFile(filePath(collection), JSON.stringify(data, null, 2), 'utf8');
}

function checkAuth(request) {
  const authHeader = request.headers.get('Authorization') || '';
  const token      = authHeader.replace('Bearer ', '');
  const password   = process.env.ADMIN_PASSWORD || 'admin123';
  return token === password;
}

// ── GET ──────────────────────────────────────────────────────────────────────
export async function GET(request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const collection       = searchParams.get('collection');

  if (!ALLOWED.includes(collection)) {
    return NextResponse.json({ error: 'Unknown collection' }, { status: 400 });
  }

  return NextResponse.json(await readCollection(collection));
}

// ── POST ─────────────────────────────────────────────────────────────────────
export async function POST(request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const collection       = searchParams.get('collection');

  if (!ALLOWED.includes(collection)) {
    return NextResponse.json({ error: 'Unknown collection' }, { status: 400 });
  }

  const body             = await request.json();
  const { action, item, id } = body;
  let   data             = await readCollection(collection);

  if (action === 'create') {
    const newItem = { ...item, id: Date.now().toString() };
    data.push(newItem);
    await writeCollection(collection, data);
    return NextResponse.json(newItem);
  }

  if (action === 'update') {
    data = data.map((d) => (d.id === id ? { ...d, ...item, id } : d));
    await writeCollection(collection, data);
    return NextResponse.json({ ok: true });
  }

  if (action === 'delete') {
    data = data.filter((d) => d.id !== id);
    await writeCollection(collection, data);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
