"use client";

/**
 * The «Обсудить выставку» bar at the bottom of a phone screen. It appears once
 * the hero's own buttons have scrolled away — on the first screen it would
 * only cover the figures — and hides again while the form is in view.
 */
import { useEffect, useState } from "react";
import { IconArrow } from "./Icons";
import base from "../styles/base.module.css";
import s from "./MobileCta.module.css";

export default function MobileCta({ label }: { label: string }) {
  const [pastHero, setPastHero] = useState(false);
  const [atForm, setAtForm] = useState(false);
  const hidden = !pastHero || atForm;

  useEffect(() => {
    const ctas = document.querySelector("[data-hero-ctas]");
    const contact = document.getElementById("contact");
    const watchers: IntersectionObserver[] = [];
    if (ctas) {
      const io = new IntersectionObserver(([entry]) =>
        setPastHero(!entry.isIntersecting && entry.boundingClientRect.top < 0));
      io.observe(ctas);
      watchers.push(io);
    }
    if (contact) {
      const io = new IntersectionObserver(([entry]) => setAtForm(entry.isIntersecting), { threshold: 0.05 });
      io.observe(contact);
      watchers.push(io);
    }
    return () => watchers.forEach((io) => io.disconnect());
  }, []);

  return (
    <div className={`${s.bar} ${hidden ? s.hidden : ""}`} aria-hidden={hidden || undefined}>
      <a href="#contact" tabIndex={hidden ? -1 : undefined} data-track="cta_mobile"
        className={`${base.btn} ${base.btnPrimary} ${s.button}`}>
        {label}
        <IconArrow />
      </a>
    </div>
  );
}
