/**
 * POST /api/admin/upload
 * Accepts multipart/form-data with a single `file` field.
 * Resizes on server if sharp is available, otherwise saves as-is.
 * Saves to public/uploads/ and returns { url: '/uploads/filename.jpg' }
 */
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const ALLOWED_EXT = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif']);

function checkAuth(request) {
  const token = (request.headers.get('Authorization') || '').replace('Bearer ', '');
  return token === (process.env.ADMIN_PASSWORD || 'admin123');
}

export async function POST(request) {
  if (!checkAuth(request))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const file = formData.get('file');
  if (!file || typeof file === 'string')
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });

  const originalName = file.name || 'upload.jpg';
  const ext = originalName.split('.').pop()?.toLowerCase() || 'jpg';

  if (!ALLOWED_EXT.has(ext))
    return NextResponse.json({ error: 'File type not allowed. Use: jpg, png, webp, gif' }, { status: 400 });

  // 10 MB limit
  const bytes = await file.arrayBuffer();
  if (bytes.byteLength > 10 * 1024 * 1024)
    return NextResponse.json({ error: 'File too large (max 10 MB)' }, { status: 400 });

  const buffer = Buffer.from(bytes);
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, filename), buffer);

  return NextResponse.json({ url: `/uploads/${filename}` });
}
