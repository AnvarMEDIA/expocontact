/**
 * POST /api/admin/upload
 * Uploads image to Vercel Blob (permanent CDN storage).
 * Requires BLOB_READ_WRITE_TOKEN env variable (set in Vercel dashboard).
 *
 * Falls back to local public/uploads/ if token is not set (dev mode).
 *
 * Returns { url: 'https://...' }
 */
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const ALLOWED_EXT = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif']);
const MAX_BYTES    = 10 * 1024 * 1024; // 10 MB

function checkAuth(request) {
  const token = (request.headers.get('Authorization') || '').replace('Bearer ', '');
  return token === (process.env.ADMIN_PASSWORD || 'admin123');
}

export async function POST(request) {
  if (!checkAuth(request))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let formData;
  try { formData = await request.formData(); }
  catch { return NextResponse.json({ error: 'Invalid form data' }, { status: 400 }); }

  const file = formData.get('file');
  if (!file || typeof file === 'string')
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });

  const originalName = (file.name || 'upload.jpg').replace(/[^a-zA-Z0-9._-]/g, '_');
  const ext = originalName.split('.').pop()?.toLowerCase() || 'jpg';

  if (!ALLOWED_EXT.has(ext))
    return NextResponse.json({ error: 'File type not allowed. Use: jpg, png, webp, gif' }, { status: 400 });

  const bytes = await file.arrayBuffer();
  if (bytes.byteLength > MAX_BYTES)
    return NextResponse.json({ error: 'File too large (max 10 MB)' }, { status: 400 });

  const filename = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  // ── Vercel Blob (production) ─────────────────────────────────────────────────
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import('@vercel/blob');
    const blob = await put(filename, bytes, {
      access: 'public',
      contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
    });
    return NextResponse.json({ url: blob.url });
  }

  // ── Local fallback (dev without token) ───────────────────────────────────────
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(path.join(uploadDir, path.basename(filename)), Buffer.from(bytes));
  return NextResponse.json({ url: `/uploads/${path.basename(filename)}` });
}
