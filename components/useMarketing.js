'use client';

import { useEffect, useRef } from 'react';
import { UTM_FIELDS, CLICK_ID_PARAMS } from '@/lib/marketing';

const STORAGE_KEY = 'expo_marketing';

/**
 * Remembers where the visitor came from and hands it to whichever form they
 * eventually submit.
 *
 * Attribution is captured on the first page of the visit and kept for the rest
 * of the session: somebody can land on an ad URL, read the portfolio, open the
 * modal three pages later and still be counted against the right campaign.
 * A later visit carrying fresh utm parameters overwrites the stored set, so
 * the most recent campaign wins rather than the first one ever seen.
 *
 * Returns a getter rather than state — the forms are uncontrolled and only
 * need the value at submit time, so there is nothing to re-render.
 */
export default function useMarketing() {
  const ref = useRef(null);

  useEffect(() => {
    const read = () => {
      try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
      } catch { return null; }
    };

    const params = new URLSearchParams(window.location.search);
    const fresh = {};

    for (const field of UTM_FIELDS) {
      const v = params.get(`utm_${field}`);
      if (v) fresh[field] = v;
    }
    for (const param of Object.keys(CLICK_ID_PARAMS)) {
      const v = params.get(param);
      if (v) { fresh.clickType = param; fresh.clickId = v; break; }
    }

    if (Object.keys(fresh).length) {
      // Only record the entry point on a genuinely new campaign touch.
      fresh.landing = `${window.location.pathname}${window.location.search}`.slice(0, 200);
      if (document.referrer && !document.referrer.startsWith(window.location.origin)) {
        fresh.referrer = document.referrer;
      }
      ref.current = fresh;
      try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(fresh)); } catch { /* private mode */ }
      return;
    }

    const stored = read();
    if (stored) { ref.current = stored; return; }

    // No campaign at all: still worth knowing an external site sent them.
    if (document.referrer && !document.referrer.startsWith(window.location.origin)) {
      const fallback = {
        referrer: document.referrer,
        landing:  `${window.location.pathname}${window.location.search}`.slice(0, 200),
      };
      ref.current = fallback;
      try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(fallback)); } catch { /* ignore */ }
    }
  }, []);

  return () => ref.current || undefined;
}
