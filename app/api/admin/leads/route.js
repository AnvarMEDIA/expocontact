/**
 * Admin leads API
 *   GET    /api/admin/leads                — list all (newest first)
 *   PATCH  /api/admin/leads                — body { id, status?, note? }
 *   DELETE /api/admin/leads?id=...         — delete
 *
 * Protected by ADMIN_PASSWORD.
 */
import { NextResponse } from 'next/server';
import { listLeads, updateLeadStatus, addLeadNote, deleteLead } from '@/lib/leads';

function checkAuth(request) {
  const token = (request.headers.get('Authorization') || '').replace('Bearer ', '');
  return token === (process.env.ADMIN_PASSWORD || 'admin123');
}

export async function GET(request) {
  if (!checkAuth(request))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const leads = await listLeads();
  return NextResponse.json(leads);
}

export async function PATCH(request) {
  if (!checkAuth(request))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, status, note } = await request.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  let updated = null;
  if (status) updated = await updateLeadStatus(id, status);
  if (note)   updated = await addLeadNote(id, note);

  if (!updated)
    return NextResponse.json({ error: 'Not found or invalid' }, { status: 404 });

  return NextResponse.json(updated);
}

export async function DELETE(request) {
  if (!checkAuth(request))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const ok = await deleteLead(id);
  return NextResponse.json({ ok });
}
