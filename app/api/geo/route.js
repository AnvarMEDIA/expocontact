/**
 * GET /api/geo — the visitor's country, used to preselect a phone country code.
 *
 * Read from the edge headers Vercel adds to every request. It lives in its own
 * endpoint rather than in the page because the landing is ISR-cached: calling
 * headers() during render would make every page view dynamic just to guess a
 * dial code.
 *
 * Returns a two-letter code, or null when the header is absent (local dev),
 * in which case the form falls back to Uzbekistan.
 */
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const country =
    request.headers.get('x-vercel-ip-country') ||
    request.headers.get('cf-ipcountry') ||
    null;

  return NextResponse.json(
    { country: country && /^[A-Za-z]{2}$/.test(country) ? country.toUpperCase() : null },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
