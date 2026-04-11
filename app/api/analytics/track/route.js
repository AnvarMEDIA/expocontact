/**
 * POST /api/analytics/track
 * Public endpoint — called from every page via sendBeacon.
 * Records: timestamp, country (Vercel header), device+OS (UA parsing), page.
 * Stores to content/data/analytics.json, max 8000 entries (rotates oldest).
 */
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const FILE = path.join(process.cwd(), 'content', 'data', 'analytics.json');
const MAX  = 8000;

function parseDevice(ua = '') {
  const u = ua.toLowerCase();
  const device = /ipad|tablet|(android(?!.*mobile))/i.test(u)
    ? 'tablet'
    : /mobile|android|iphone|ipod|blackberry|windows phone/i.test(u)
    ? 'mobile'
    : 'desktop';
  const os = /windows nt/i.test(u) ? 'Windows'
    : /android/i.test(u)           ? 'Android'
    : /iphone|ipad|ipod/i.test(u)  ? 'iOS'
    : /mac os x/i.test(u)          ? 'macOS'
    : /linux/i.test(u)             ? 'Linux'
    : 'Other';
  const browser = /edg\//i.test(u)    ? 'Edge'
    : /opr\//i.test(u)               ? 'Opera'
    : /chrome/i.test(u)              ? 'Chrome'
    : /safari/i.test(u)              ? 'Safari'
    : /firefox/i.test(u)             ? 'Firefox'
    : 'Other';
  return { device, os, browser };
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const ua   = request.headers.get('user-agent') || '';

    // Skip bots
    if (/bot|crawler|spider|curl|wget|python|java|go-http/i.test(ua)) {
      return NextResponse.json({ ok: true });
    }

    const country = request.headers.get('x-vercel-ip-country')
      || request.headers.get('cf-ipcountry')
      || 'XX';

    const { device, os, browser } = parseDevice(ua);

    const entry = {
      ts:      Date.now(),
      country: country.toUpperCase(),
      device,
      os,
      browser,
      page:    (body.page || '/').slice(0, 100),
    };

    // Read → append → rotate → write
    let data = [];
    try {
      data = JSON.parse(await fs.readFile(FILE, 'utf8'));
    } catch { /* first run */ }

    data.push(entry);
    if (data.length > MAX) data = data.slice(-MAX);

    await fs.writeFile(FILE, JSON.stringify(data), 'utf8');
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }); // never fail silently
  }
}
