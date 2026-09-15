'use client';

/**
 * Reports page views to our own statistics.
 *
 * Sends the page, the locale and where the visitor came from. No cookie, no
 * identifier of any kind travels with it: the server counts people by hashing
 * the request's IP and user agent with a salt that changes daily, and stores
 * neither. See lib/analytics/store.js.
 *
 * The heartbeat every 60 seconds is what "online now" is built from.
 */
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import useMarketing from './useMarketing';

export default function AnalyticsTracker({ locale }) {
  const pathname = usePathname();
  const getMarketing = useMarketing();
  // The referrer only means something on the first page of a visit; afterwards
  // it is our own previous page, which is not a traffic source.
  const firstView = useRef(true);

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin')) return;

    // `beat` separates "a page was opened" from "the tab is still open":
    // only the first call is a page view.
    const send = (beat = false) => {
      try {
        const payload = {
          page: pathname,
          locale,
          beat,
          referrer: !beat && firstView.current ? document.referrer : '',
          marketing: getMarketing(),
        };
        if (!beat) firstView.current = false;
        navigator.sendBeacon(
          '/api/analytics/track',
          new Blob([JSON.stringify(payload)], { type: 'application/json' }),
        );
      } catch { /* a blocked beacon must not break the page */ }
    };

    send(false);
    const id = setInterval(() => send(true), 60_000);
    return () => clearInterval(id);
  }, [pathname, locale, getMarketing]);

  return null;
}
