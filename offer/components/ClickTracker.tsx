"use client";

/**
 * Click events from anything marked `data-track="name"`: the hero CTA, the
 * package buttons, WhatsApp, Telegram and phone links. One delegated listener
 * instead of a handler on every link, so the sections stay server components.
 */
import { useEffect } from "react";
import { trackEvent } from "../lib/track";

export default function ClickTracker({ language }: { language: string }) {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = (event.target as Element | null)?.closest<HTMLElement>("[data-track]");
      if (!target) return;
      const name = target.dataset.track;
      if (!name) return;
      trackEvent(name, { language, ...(target.dataset.trackLabel ? { label: target.dataset.trackLabel } : {}) });
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, [language]);

  return null;
}
