"use client";

/**
 * Moves its child slower than the page (transform only), while the element is
 * near the viewport. Off under prefers-reduced-motion.
 */
import { useEffect, useRef, type ReactNode } from "react";

export default function Parallax({ children, className, speed = 0.18 }: {
  children: ReactNode; className?: string; speed?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const update = () => {
      const y = window.scrollY;
      if (y < window.innerHeight * 1.5) el.style.transform = `translate3d(0, ${(y * speed).toFixed(1)}px, 0)`;
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [speed]);

  return <div ref={ref} className={className} aria-hidden="true">{children}</div>;
}
