/**
 * POST /api/analytics/track — one page view.
 *
 * Public, called by components/AnalyticsTracker.jsx with sendBeacon. Always
 * answers 200: a tracker must never be able to break a page, and a browser
 * retrying a failed beacon would double-count.
 *
 * The request carries the page, locale, referrer and campaign; the IP and user
 * agent are read from the request but only hashed, never stored — see
 * lib/analytics/store.js for the privacy rules.
 */
import { NextResponse } from 'next/server';
import { recordVisit } from '@/lib/analytics/store';
import { sanitizeMarketing } from '@/lib/marketing';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const headers = request.headers;

    await recordVisit({
      page: body.page,
      beat: body.beat === true,
      locale: body.locale,
      referrer: body.referrer,
      marketing: sanitizeMarketing(body.marketing),
      ua: headers.get('user-agent') || '',
      ip: headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        || headers.get('x-real-ip') || '',
      country: headers.get('x-vercel-ip-country') || headers.get('cf-ipcountry') || 'XX',
      host: headers.get('x-forwarded-host') || headers.get('host') || '',
    });
  } catch (err) {
    console.error('[analytics] track failed:', err.message);
  }
  return NextResponse.json({ ok: true });
}
