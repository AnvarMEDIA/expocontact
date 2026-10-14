"use client";

/**
 * Sticky header: transparent over the hero, white with blur after 80px.
 * Highlights the section in view, keeps the CTA on screen, and switches
 * language without losing the reader's place — the current section travels
 * along as the anchor.
 *
 * Nothing here links out of the landing: the logo scrolls to the top, the
 * menu holds anchors, and the language links stay under /offer.
 */
import { useEffect, useState } from "react";
import Logo from "../components/Logo";
import { IconArrow } from "../components/Icons";
import { LANG_INFO, OFFER_LANGS, type OfferDict, type OfferLang } from "../i18n";
import base from "../styles/base.module.css";
import s from "./Header.module.css";

const SECTIONS = ["services", "visitors", "plan", "experience", "formats"] as const;
const TRACKED = [...SECTIONS, "contact"] as const;

interface HeaderProps {
  lang: OfferLang;
  nav: OfferDict["nav"];
  a11y: OfferDict["a11y"];
}

export default function Header({ lang, nav, a11y }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setScrolled(window.scrollY > 80));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  // The section crossing the middle of the screen is the active one.
  useEffect(() => {
    const els = TRACKED.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const switchLang = (event: React.MouseEvent<HTMLAnchorElement>, to: OfferLang) => {
    event.preventDefault();
    const hash = active ? `#${active}` : window.location.hash;
    window.location.assign(`/offer/${to}${hash}`);
  };

  const solid = scrolled || open;

  const langLinks = (
    <ul className={s.langs} aria-label={a11y.language}>
      {OFFER_LANGS.map((l) => (
        <li key={l}>
          <a
            href={`/offer/${l}`}
            hrefLang={LANG_INFO[l].hreflang}
            lang={LANG_INFO[l].html}
            aria-current={l === lang ? "true" : undefined}
            className={l === lang ? s.langActive : undefined}
            onClick={(e) => switchLang(e, l)}
          >
            {LANG_INFO[l].label}
          </a>
        </li>
      ))}
    </ul>
  );

  return (
    <header className={`${s.header} ${solid ? s.solid : ""}`}>
      <div className={`${base.container} ${s.bar}`}>
        <a href="#top" className={s.logo} aria-label={a11y.home} onClick={() => setOpen(false)}>
          <Logo tone={solid ? "color" : "white"} idPrefix="hd" className={s.logoSvg} label="ExpoContact" />
        </a>

        <nav className={s.nav} aria-label="ExpoContact">
          <ul>
            {SECTIONS.map((id) => (
              <li key={id}>
                <a href={`#${id}`} aria-current={active === id ? "true" : undefined}
                  className={active === id ? s.navActive : undefined}>
                  {nav[id]}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={s.desktopLangs}>{langLinks}</div>

        <a href="#contact" className={`${base.btn} ${base.btnPrimary} ${s.cta}`} data-track="cta_header">
          {nav.cta}
          <IconArrow />
        </a>

        <button type="button" className={s.burger} aria-expanded={open} aria-controls="of-menu"
          aria-label={open ? a11y.closeMenu : a11y.menu} onClick={() => setOpen((v) => !v)}>
          <span /><span />
        </button>
      </div>

      <div id="of-menu" className={s.menu} hidden={!open}>
        <ul className={s.menuNav}>
          {SECTIONS.map((id) => (
            <li key={id}>
              <a href={`#${id}`} onClick={() => setOpen(false)}
                aria-current={active === id ? "true" : undefined}>{nav[id]}</a>
            </li>
          ))}
        </ul>
        {langLinks}
      </div>
    </header>
  );
}
