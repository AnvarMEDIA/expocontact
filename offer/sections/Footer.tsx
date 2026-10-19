import Logo from "../components/Logo";
import PrivacyButton from "../components/PrivacyButton";
import { CONTACTS } from "../lib/content";
import type { OfferDict, OfferLang } from "../i18n";
import { mainSiteHref } from "@/lib/directions";
import base from "../styles/base.module.css";
import s from "./Footer.module.css";

/**
 * Minimal by design: logo, contacts, privacy, and one link to the main site —
 * ExpoContact's other direction, stands for exhibitors (lib/directions.js).
 * The header stays without it, so the page keeps one goal: the enquiry.
 */
export default function Footer({ footer, year, lang }: { footer: OfferDict["footer"]; year: number; lang: OfferLang }) {
  return (
    <footer className={s.footer}>
      <div className={`${base.container} ${s.inner}`}>
        <Logo tone="white" idPrefix="ft" className={s.logo} />
        <ul className={s.contacts}>
          {CONTACTS.phones.map((p) => (
            <li key={p.tel}><a href={`tel:${p.tel}`} data-track="click_phone">{p.display}</a></li>
          ))}
          <li><a href={`mailto:${CONTACTS.email}`} data-track="click_email">{CONTACTS.email}</a></li>
          <li><a href={mainSiteHref(lang)} data-track="click_main_site">{footer.mainSite}</a></li>
        </ul>
        <div className={s.bottom}>
          <p>© {year} ExpoContact. {footer.rights}</p>
          <PrivacyButton className={s.privacy}>{footer.privacy}</PrivacyButton>
        </div>
      </div>
    </footer>
  );
}
