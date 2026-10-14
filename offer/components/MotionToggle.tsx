"use client";

/**
 * Pause control for the scrolling rows (WCAG 2.2.2: anything that moves for
 * more than five seconds needs a way to stop it). Hover and keyboard focus
 * already pause a row, but a phone has neither, and the rows hold no focusable
 * element. The rows also stop on their own while they are off screen.
 *
 * Under prefers-reduced-motion the rows are a static list and the button is
 * hidden: there is nothing to stop.
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { IconPause, IconPlay } from "./Icons";
import s from "./MotionToggle.module.css";

export default function MotionToggle({ pauseLabel, playLabel, className, children }: {
  pauseLabel: string;
  playLabel: string;
  className?: string;
  children: ReactNode;
}) {
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={className} data-paused={paused || !visible ? "" : undefined}>
      {children}
      <button type="button" className={s.toggle} onClick={() => setPaused((p) => !p)}>
        {paused ? <IconPlay /> : <IconPause />}
        {paused ? playLabel : pauseLabel}
      </button>
    </div>
  );
}
