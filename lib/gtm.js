/**
 * Google Tag Manager — container GTM-K6KCKM2F, on the main site and on /offer
 * (not on /admin, which is deliberately untracked).
 *
 * NEXT_PUBLIC_GTM_ID overrides the container; set it to an empty string to
 * switch GTM off without a code change. The value is read at build time, so a
 * new one needs a redeploy.
 *
 * Loading follows the Meta Pixel and the Google tag (lib/metaPixel.js,
 * lib/googleTag.js): `dataLayer` and the `gtm.start` event exist at once,
 * gtm.js itself is fetched on the first interaction or 3 s after load —
 * except on the pages ads and conversions live on, where it loads at once
 * (LOAD_AT_ONCE). A container is arbitrary third-party code and can weigh
 * hundreds of KB, which is exactly what used to hold up the first screen.
 *
 * The `gtm.start` / `gtm.js` push is what GTM's own snippet does before it
 * loads the script. Without it the container's page-view triggers never fire,
 * so it must not be dropped when this snippet is simplified.
 *
 * Do not also measure the same thing through the gtag.js tag
 * (NEXT_PUBLIC_GA4_ID / NEXT_PUBLIC_GADS_ID) or a Meta Pixel tag inside the
 * container: every pageview and lead would be counted twice.
 */
import { LOAD_AT_ONCE } from '@/lib/metaPixel';

/** The id ends up inside an inline script, so only the characters it is made of pass. */
const safe = (v) => String(v || '').replace(/[^A-Za-z0-9_-]/g, '');

export const GTM_ID = safe(process.env.NEXT_PUBLIC_GTM_ID ?? 'GTM-K6KCKM2F');

/** The inline <head> snippet, or null when GTM is switched off. */
export function gtmSnippet() {
  if (!GTM_ID) return null;
  return `window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){dataLayer.push(arguments)};
dataLayer.push({'gtm.start':new Date().getTime(),event:'gtm.js'});
!function(w,d){var ev=['pointerdown','touchstart','scroll','keydown'],done=0,
l=function(){if(done)return;done=1;ev.forEach(function(x){w.removeEventListener(x,l)});
var s=d.createElement('script');s.async=!0;s.src='https://www.googletagmanager.com/gtm.js?id=${GTM_ID}';d.head.appendChild(s)};
if(${LOAD_AT_ONCE}.test(w.location.pathname))return l();
ev.forEach(function(x){w.addEventListener(x,l,{passive:!0})});
var a=function(){setTimeout(l,3000)};d.readyState==='complete'?a():w.addEventListener('load',a)}(window,document);`;
}

/**
 * GTM's <noscript> fallback for visitors without JavaScript. Raw HTML, like
 * the Meta noscript pixel: as a JSX <iframe> React would render it into the
 * page for everyone.
 */
export function gtmNoscript() {
  if (!GTM_ID) return null;
  return `<iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
}
