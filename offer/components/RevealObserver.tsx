"use client";

/**
 * One IntersectionObserver for the whole page. Sections stay server components
 * and only mark what should appear with `data-reveal`; this sets `data-in`
 * once an element scrolls into view. The CSS that animates it lives in
 * app/offer/[lang]/offer-motion.css and the section modules.
 *
 * With prefers-reduced-motion everything is marked at once, so nothing waits
 * for a scroll to become visible.
 */
import { useEffect } from "react";

declare global {
  interface Window { __ofReady?: boolean }
}

export default function RevealObserver() {
  useEffect(() => {
    window.__ofReady = true;
    const items = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.setAttribute("data-in", ""));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-in", "");
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return null;
}
