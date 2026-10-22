/**
 * Google tag (gtag.js) for the main site: Google Ads and, optionally, GA4.
 * Off until an id is set in the environment (.env.example) — the variables
 * are read at build time, so a new value needs a redeploy:
 *
 *   NEXT_PUBLIC_GADS_ID           Google Ads tag id, AW-…
 *   NEXT_PUBLIC_GADS_LEAD_LABEL   label of the «lead» conversion action
 *   NEXT_PUBLIC_GA4_ID            GA4 measurement id, G-…
 *
 * The same variables drive /offer's own tags (offer/components/Trackers.tsx).
 *
 * Google Ads counts a lead in either of two ways, and an account should use
 * one, not both: a URL-based conversion on the thank-you page
 * (…/thanks, matched as «URL contains /thanks»), which needs nothing but this
 * tag; or the `conversion` event with the label, sent by trackGoogleLead() on
 * the thank-you page after a confirmed submit.
 *
 * Loading follows the Meta Pixel (lib/metaPixel.js): the `gtag` queue exists
 * at once, gtag.js itself is fetched on the first interaction or 3 s after
 * load — except on the pages ads and conversions live on, where it loads
 * immediately (LOAD_AT_ONCE).
 */
import { LOAD_AT_ONCE } from '@/lib/metaPixel';

/** Ids end up inside an inline script, so only the characters they are made of pass. */
const safe = (v) => String(v || '').replace(/[^A-Za-z0-9_-]/g, '');

export const GADS_ID = safe(process.env.NEXT_PUBLIC_GADS_ID);
export const GADS_LEAD_LABEL = safe(process.env.NEXT_PUBLIC_GADS_LEAD_LABEL);
export const GA4_ID = safe(process.env.NEXT_PUBLIC_GA4_ID);

/** The inline snippet, or null when no Google id is configured. */
export function googleTagSnippet() {
  const ids = [GADS_ID, GA4_ID].filter(Boolean);
  if (!ids.length) return null;
  const src = `https://www.googletagmanager.com/gtag/js?id=${ids[0]}`;
  return `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;
gtag('js',new Date());${ids.map((id) => `gtag('config','${id}');`).join('')}
!function(w,d){var ev=['pointerdown','touchstart','scroll','keydown'],done=0,
l=function(){if(done)return;done=1;ev.forEach(function(x){w.removeEventListener(x,l)});
var s=d.createElement('script');s.async=!0;s.src='${src}';d.head.appendChild(s)};
if(${LOAD_AT_ONCE}.test(w.location.pathname))return l();
ev.forEach(function(x){w.addEventListener(x,l,{passive:!0})});
var a=function(){setTimeout(l,3000)};d.readyState==='complete'?a():w.addEventListener('load',a)}(window,document);`;
}

/** The Google Ads «lead» conversion event. A no-op without id and label. */
export function trackGoogleLead(params = {}) {
  try {
    if (GADS_ID && GADS_LEAD_LABEL) {
      window.gtag?.('event', 'conversion', { send_to: `${GADS_ID}/${GADS_LEAD_LABEL}`, ...params });
    }
  } catch { /* blocked */ }
}
