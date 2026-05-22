/**
 * Admin media library
 *   GET    /api/admin/media               — list all blobs in /uploads/
 *   DELETE /api/admin/media?url=...       — delete one blob by URL
 *
 * Vercel Blob only (requires BLOB_READ_WRITE_TOKEN).
 * In dev without token returns empty list (local files stay in public/uploads/).
 */
import { NextResponse } from 'next/server';

function checkAuth(request) {
  const token = (request.headers.get('Authorization') || '').replace('Bearer ', '');
  return token === (process.env.ADMIN_PASSWORD || 'admin123');
}

export async function GET(request) {
  if (!checkAuth(request))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ blobs: [], note: 'BLOB_READ_WRITE_TOKEN not set — using local uploads' });
  }

  try {
    const { list } = await import('@vercel/blob');
    const result = await list({ prefix: 'uploads/', limit: 1000 });
    const blobs = (result.blobs || [])
      .map(b => ({
        url:       b.url,
        pathname:  b.pathname,
        size:      b.size,
        uploadedAt: b.uploadedAt,
      }))
      .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    return NextResponse.json({ blobs });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  if (!checkAuth(request))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  if (!url) return NextResponse.json({ error: 'url required' }, { status: 400 });

  if (!process.env.BLOB_READ_WRITE_TOKEN)
    return NextResponse.json({ error: 'BLOB_READ_WRITE_TOKEN not set' }, { status: 400 });

  try {
    const { del } = await import('@vercel/blob');
    await del(url);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
