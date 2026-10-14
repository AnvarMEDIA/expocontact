"use client";

/**
 * A number that counts up when it scrolls into view (1.2 s, ease-out).
 *
 * Two elements, rendered by the server and never replaced:
 * - the visible one starts at `from` when JavaScript is present (the `of-js`
 *   class set in <head>) and is the one that counts;
 * - the final value, which is what visitors without JavaScript, screen
 *   readers and search engines get.
 * Nothing is hidden waiting for hydration, and no new element appears when
 * the count starts — both would push Largest Contentful Paint late.
 */
import { useEffect, useRef, useState } from "react";

interface CountUpProps {
  value: number;
  /** The final value as the server formatted it, so hydration never compares
   *  two different Intl builds. */
  display: string;
  from?: number;
  /** Intl locale for the in-between frames: "5 000" in Russian, "5,000" in English. */
  locale: string;
  /** No grouping — for years. */
  plain?: boolean;
  suffix?: string;
  className?: string;
}

const DURATION = 1200;

export default function CountUp({ value, display, from = 0, locale, plain = false, suffix = "", className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const format = (n: number) =>
    plain ? String(Math.round(n)) : new Intl.NumberFormat(locale).format(Math.round(n));
  const [shown, setShown] = useState<string | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) {
      setShown(display);
      return;
    }

    let frame = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / DURATION);
          const eased = 1 - Math.pow(1 - t, 3);
          setShown(t < 1 ? format(from + (value - from) * eased) : display);
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
    // The value never changes for a mounted counter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <span ref={ref} data-count="" className={className}>
      <span data-count-start="" aria-hidden="true">{shown ?? format(from)}{suffix}</span>
      <span data-count-final="">{display}{suffix}</span>
    </span>
  );
}
