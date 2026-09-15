'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { metaTrack } from '@/lib/metaPixel';

/**
 * PageView on client-side navigation.
 *
 * The snippet in the layout fires once, when the document loads. Most links on
 * this site are plain anchors, so they reload the page and the snippet counts
 * them — but the locale switcher calls router.push(), which changes the URL
 * without a reload and would otherwise go unreported.
 *
 * The last counted path is kept at module scope, not in a ref: a locale switch
 * moves between two different [locale] layouts, so this component remounts and
 * any per-instance "skip the first render" flag resets, swallowing exactly the
 * PageView it exists to send. Module scope lives as long as the document, which
 * is the same lifetime as the snippet's own PageView.
 */
let lastTracked = null;

export default function MetaPixel() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    if (lastTracked === null) { lastTracked = pathname; return; } // counted by the snippet
    if (pathname === lastTracked) return;
    lastTracked = pathname;
    metaTrack('PageView');
  }, [pathname]);

  return null;
}
