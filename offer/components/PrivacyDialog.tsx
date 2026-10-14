"use client";

/**
 * The privacy policy as a modal inside the landing — a native <dialog>, so
 * focus is trapped, Escape closes it and focus returns to whatever opened it.
 */
import { useEffect, useRef } from "react";
import { OPEN_PRIVACY } from "../lib/privacy";
import type { OfferDict } from "../i18n";
import s from "./PrivacyDialog.module.css";

export default function PrivacyDialog({ privacy, close }: { privacy: OfferDict["privacy"]; close: string }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const open = () => ref.current?.showModal();
    window.addEventListener(OPEN_PRIVACY, open);
    return () => window.removeEventListener(OPEN_PRIVACY, open);
  }, []);

  return (
    <dialog ref={ref} className={s.dialog} aria-labelledby="of-privacy-title"
      onClick={(e) => { if (e.target === ref.current) ref.current?.close(); }}>
      <div className={s.body}>
        <div className={s.head}>
          <h2 id="of-privacy-title" className={s.title}>{privacy.title}</h2>
          <button type="button" className={s.close} aria-label={close} onClick={() => ref.current?.close()}>×</button>
        </div>
        {privacy.sections.map((section) => (
          <section key={section.title} className={s.section}>
            <h3>{section.title}</h3>
            <p>{section.text}</p>
          </section>
        ))}
      </div>
    </dialog>
  );
}
