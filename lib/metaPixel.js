/**
 * Meta (Facebook) Pixel — ExpoContact Pixel, id 2224423588452859.
 *
 * The base snippet lives in app/[locale]/layout.js and fires the first
 * PageView; components/MetaPixel.jsx repeats it on client-side navigation.
 * Everything here runs in the browser only.
 *
 * Conversions API is not connected, so there is no event deduplication to
 * worry about: one browser event per conversion, no eventID.
 */

export const META_PIXEL_ID = '2224423588452859';

/**
 * The snippet Meta ships, with the id filled in and one change: fbevents.js
 * is fetched on the visitor's first interaction or three seconds after load,
 * not while the first screen is still loading. It is ~100 KB of third-party
 * script plus a config file, and it used to compete with the page's own
 * fonts and scripts on a phone. The `fbq` queue exists from the start, so the
 * PageView below (and any Lead) is recorded and sent once the script runs.
 * A visitor who leaves within three seconds without touching the page is not
 * counted — except on the pages ads point at (/<locale>/lp and /offer), where
 * the pixel is the point of the page and loads at once.
 */
export const META_PIXEL_SNIPPET = `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];var w=['pointerdown','touchstart','scroll','keydown'],d=0,
l=function(){if(d)return;d=1;w.forEach(function(x){f.removeEventListener(x,l)});
t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)};
if(/^\\/([a-z]{2}\\/lp|offer)(\\/|$)/.test(f.location.pathname))l();
w.forEach(function(x){f.addEventListener(x,l,{passive:!0})});
var a=function(){setTimeout(l,3000)};
b.readyState==='complete'?a():f.addEventListener('load',a)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');`;

/**
 * Send one event. Never throws: the pixel is blocked by ad blockers and
 * privacy browsers for a good share of visitors, and a lead must not be lost
 * because a tracker is missing.
 */
export function metaTrack(event, params) {
  try {
    // Omit the third argument entirely when there is nothing to send: fbq
    // treats an explicit undefined as a parameter object.
    if (params) window.fbq?.('track', event, params);
    else window.fbq?.('track', event);
  } catch { /* blocked */ }
}

/**
 * A submitted lead form. Called only after the server confirmed the lead —
 * never on the button click, or every abandoned submit would count as a
 * conversion and the ad platform would optimise for the wrong thing.
 */
export function trackLead(contentName, extra) {
  // `extra` carries content_category: which direction the lead came for
  // (exhibitor / organiser, lib/directions.js), so ad reports can split them.
  const params = { ...(contentName ? { content_name: contentName } : {}), ...(extra || {}) };
  metaTrack('Lead', Object.keys(params).length ? params : undefined);
}
