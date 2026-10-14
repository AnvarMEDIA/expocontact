"use client";

/**
 * Three formats, no prices. A comparison table on wide screens — hovering a
 * column lights it up, Full House is lit by default — and tabs on phones.
 * «Выбрать» scrolls to the form and fills in its «Формат» field.
 */
import { useRef, useState, type KeyboardEvent } from "react";
import Title from "../components/Title";
import { IconCheck, IconDash } from "../components/Icons";
import { PACKAGE_NAMES, type PackageKey } from "../lib/lead";
import { chooseFormat } from "../lib/events";
import { plainTitle, type OfferDict } from "../i18n";
import base from "../styles/base.module.css";
import s from "./Formats.module.css";

/** How many of the ten rows each format covers, top-down. */
const PACKAGES: ReadonlyArray<{ key: PackageKey; rows: number; tagline: "local" | "turnkey" | "full" }> = [
  { key: "local_partner", rows: 3, tagline: "local" },
  { key: "turnkey_build", rows: 6, tagline: "turnkey" },
  { key: "full_house", rows: 10, tagline: "full" },
];
const RECOMMENDED: PackageKey = "full_house";

interface FormatsProps {
  formats: OfferDict["formats"];
  a11y: OfferDict["a11y"];
}

export default function Formats({ formats, a11y }: FormatsProps) {
  const [active, setActive] = useState<PackageKey>(RECOMMENDED);
  const [tab, setTab] = useState<PackageKey>(RECOMMENDED);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const choose = (key: PackageKey) => {
    chooseFormat(key);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("contact")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };

  const mark = (included: boolean) => (
    included ? (
      <span className={s.yes}><IconCheck /><span className={base.srOnly}>{a11y.included}</span></span>
    ) : (
      <span className={s.no}><IconDash /><span className={base.srOnly}>{a11y.notIncluded}</span></span>
    )
  );

  const chooseButton = (key: PackageKey) => (
    <button type="button" onClick={() => choose(key)} data-track="choose_package" data-track-label={key}
      className={`${base.btn} ${key === RECOMMENDED ? base.btnPrimary : base.btnOutline} ${s.choose}`}
      aria-label={`${formats.choose}: ${PACKAGE_NAMES[key]}`}>
      {formats.choose}
    </button>
  );

  // Arrow keys move between tabs, as the WAI-ARIA tabs pattern expects.
  const onTabKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const delta = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;
    event.preventDefault();
    const next = (index + delta + PACKAGES.length) % PACKAGES.length;
    setTab(PACKAGES[next].key);
    tabs.current[next]?.focus();
  };

  return (
    <section id="formats" className={base.section} aria-labelledby="formats-title">
      <div className={base.container}>
        <div className={base.head} data-reveal="">
          <p className={base.kicker}>{formats.kicker}</p>
          <h2 id="formats-title" className={base.h2}><Title text={formats.title} /></h2>
        </div>

        {/* Wide screens */}
        <div className={s.tableWrap} data-reveal="">
          <table className={s.table} data-active={active} onMouseLeave={() => setActive(RECOMMENDED)}>
            <caption className={base.srOnly}>{plainTitle(formats.title)}</caption>
            <thead>
              <tr>
                <th scope="col" className={s.featureHead}>{formats.feature}</th>
                {PACKAGES.map((p) => (
                  <th key={p.key} scope="col" data-col={p.key} onMouseEnter={() => setActive(p.key)}
                    className={`${s.pkgHead} ${p.key === RECOMMENDED ? s.recommended : ""}`}>
                    {p.key === RECOMMENDED && <span className={s.badge}>{formats.recommended}</span>}
                    <span className={s.pkgName}>{PACKAGE_NAMES[p.key]}</span>
                    <span className={s.tagline}>{formats.taglines[p.tagline]}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {formats.rows.map((row, r) => (
                <tr key={row}>
                  <th scope="row" className={s.rowName}>{row}</th>
                  {PACKAGES.map((p) => (
                    <td key={p.key} data-col={p.key} onMouseEnter={() => setActive(p.key)}>{mark(r < p.rows)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td />
                {PACKAGES.map((p) => (
                  <td key={p.key} data-col={p.key} onMouseEnter={() => setActive(p.key)}>{chooseButton(p.key)}</td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Phones */}
        <div className={s.tabsWrap} data-reveal="">
          <div role="tablist" aria-label={plainTitle(formats.title)} className={s.tabs}>
            {PACKAGES.map((p, i) => (
              <button key={p.key} ref={(el) => { tabs.current[i] = el; }} type="button" role="tab"
                id={`tab-${p.key}`} aria-controls={`panel-${p.key}`} aria-selected={tab === p.key}
                tabIndex={tab === p.key ? 0 : -1} onClick={() => setTab(p.key)} onKeyDown={(e) => onTabKey(e, i)}
                className={`${s.tab} ${tab === p.key ? s.tabActive : ""}`}>
                {PACKAGE_NAMES[p.key]}
                {p.key === RECOMMENDED && <span className={s.tabDot} aria-hidden="true" />}
              </button>
            ))}
          </div>
          {PACKAGES.map((p) => (
            <div key={p.key} role="tabpanel" id={`panel-${p.key}`} aria-labelledby={`tab-${p.key}`}
              hidden={tab !== p.key} className={`${s.panel} ${p.key === RECOMMENDED ? s.panelRecommended : ""}`}>
              {p.key === RECOMMENDED && <span className={s.badge}>{formats.recommended}</span>}
              <p className={s.panelName}>{PACKAGE_NAMES[p.key]}</p>
              <p className={s.tagline}>{formats.taglines[p.tagline]}</p>
              <ul className={s.panelRows}>
                {formats.rows.map((row, r) => (
                  <li key={row} className={r < p.rows ? "" : s.off}>
                    {mark(r < p.rows)}
                    <span>{row}</span>
                  </li>
                ))}
              </ul>
              {chooseButton(p.key)}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
