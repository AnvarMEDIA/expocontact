'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin')) return;

    const send = () => {
      try {
        navigator.sendBeacon(
          '/api/analytics/track',
          new Blob([JSON.stringify({ page: pathname })], { type: 'application/json' }),
        );
      } catch { /* silent */ }
    };

    send();
    const id = setInterval(send, 60_000); // heartbeat — keeps "online now" alive
    return () => clearInterval(id);
  }, [pathname]);

  return null;
}
