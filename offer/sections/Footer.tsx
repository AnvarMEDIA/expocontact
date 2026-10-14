import Logo from "../components/Logo";
import PrivacyButton from "../components/PrivacyButton";
import { CONTACTS } from "../lib/content";
import type { OfferDict } from "../i18n";
import base from "../styles/base.module.css";
import s from "./Footer.module.css";

/** Minimal by design: no links to the main site — logo, contacts, privacy. */
export default function Footer({ footer, year }: { footer: OfferDict["footer"]; year: number }) {
  return (
    <footer className={s.footer}>
      <div className={`${base.container} ${s.inner}`}>
        <Logo tone="white" idPrefix="ft" className={s.logo} />
        <ul className={s.contacts}>
          {CONTACTS.phones.map((p) => (
            <li key={p.tel}><a href={`tel:${p.tel}`} data-track="click_phone">{p.display}</a></li>
          ))}
          <li><a href={`mailto:${CONTACTS.email}`} data-track="click_email">{CONTACTS.email}</a></li>
        </ul>
        <div className={s.bottom}>
          <p>© {year} ExpoContact. {footer.rights}</p>
          <PrivacyButton className={s.privacy}>{footer.privacy}</PrivacyButton>
        </div>
      </div>
    </footer>
  );
}
