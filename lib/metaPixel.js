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

/** The inline snippet Meta ships, with the id already filled in. */
export const META_PIXEL_SNIPPET = `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
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
export function trackLead(contentName) {
  metaTrack('Lead', contentName ? { content_name: contentName } : undefined);
}
