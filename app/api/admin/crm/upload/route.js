/**
 * POST /api/admin/crm/upload — attach a document to a project.
 *
 * Separate from /api/admin/upload on purpose: that one takes site images and
 * writes to `uploads/`, which the media library lists. Project documents are
 * quotes and contracts, they belong to a client, and they must never show up
 * in the site's media picker — so they go under `projects/`.
 *
 * PRIVACY: Vercel Blob serves every object publicly to anyone holding the URL.
 * A quote carries prices and a client name, so the stored name is randomised
 * and unguessable, and the admin panel says plainly that the link is a secret.
 * Do not treat this as access control; if real protection is ever needed the
 * file has to move to a private store with signed URLs.
 *
 * Protected by ADMIN_PASSWORD.
 */
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const ALLOWED = {
  pdf:  'application/pdf',
  doc:  'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls:  'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt:  'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  png:  'image/png',
  jpg:  'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  zip:  'application/zip',
  rar:  'application/vnd.rar',
  dwg:  'application/acad',
};

const MAX_BYTES = 20 * 1024 * 1024;

function checkAuth(request) {
  const token = (request.headers.get('Authorization') || '').replace('Bearer ', '');
  return token === (process.env.ADMIN_PASSWORD || 'admin123');
}

export async function POST(request) {
  if (!checkAuth(request))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let formData;
  try { formData = await request.formData(); }
  catch { return NextResponse.json({ error: 'Некорректная форма' }, { status: 400 }); }

  const file = formData.get('file');
  if (!file || typeof file === 'string')
    return NextResponse.json({ error: 'Файл не передан' }, { status: 400 });

  const displayName = String(file.name || 'файл').slice(0, 120);
  const ext = displayName.split('.').pop()?.toLowerCase() || '';
  if (!ALLOWED[ext]) {
    return NextResponse.json({
      error: `Тип .${ext} не поддерживается. Можно: ${Object.keys(ALLOWED).join(', ')}`,
    }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  if (bytes.byteLength > MAX_BYTES)
    return NextResponse.json({ error: 'Файл больше 20 МБ' }, { status: 400 });

  // The stored path carries no client or project name: the URL is public to
  // whoever holds it, so it should reveal nothing on its own.
  const random = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
  const filename = `projects/${random}.${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import('@vercel/blob');
    const blob = await put(filename, bytes, {
      access: 'public',
      contentType: ALLOWED[ext],
      addRandomSuffix: false,
    });
    return NextResponse.json({ url: blob.url, name: displayName, size: bytes.byteLength, ext });
  }

  // Local development: keep the same shape so the admin behaves identically.
  const dir = path.join(process.cwd(), 'public', 'uploads', 'projects');
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, path.basename(filename)), Buffer.from(bytes));
  return NextResponse.json({
    url: `/uploads/projects/${path.basename(filename)}`,
    name: displayName, size: bytes.byteLength, ext,
  });
}
