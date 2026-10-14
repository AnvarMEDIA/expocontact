import OfferForm from "../components/OfferForm";
import Title from "../components/Title";
import LogoMark from "../components/LogoMark";
import { IconMail, IconPhone, IconGlobe, IconTelegram, IconWhatsApp } from "../components/Icons";
import { CONTACTS } from "../lib/content";
import type { CountryOption } from "../lib/countries";
import type { OfferDict } from "../i18n";
import base from "../styles/base.module.css";
import s from "./Contact.module.css";

interface ContactProps {
  lang: string;
  dict: OfferDict;
  countries: CountryOption[];
  months: string[];
  startYear: number;
  defaultDial: string;
}

export default function Contact({ lang, dict, countries, months, startYear, defaultDial }: ContactProps) {
  const { contact } = dict;
  return (
    <section id="contact" className={`${base.section} ${base.sectionDark}`} aria-labelledby="contact-title">
      <LogoMark animate={false} className={s.deco} />
      <div className={`${base.container} ${s.layout}`}>
        <div className={s.intro}>
          <h2 id="contact-title" className={base.h2} data-reveal=""><Title text={contact.title} /></h2>
          <p className={`${base.kicker} ${s.kicker}`} data-reveal="">{contact.kicker}</p>
          <ol className={s.prepare}>
            {contact.prepare.map((item, i) => (
              <li key={item} data-reveal="" style={{ ["--d" as string]: i }}>
                <span className={s.prepareNum} aria-hidden="true">{i + 1}</span>
                {item}
              </li>
            ))}
          </ol>

          <ul className={s.contacts} data-reveal="">
            <li>
              <span className={s.contactIcon} aria-hidden="true"><IconPhone /></span>
              <span className={s.contactBody}>
                <span className={s.contactLabel}>{contact.phones}</span>
                {CONTACTS.phones.map((p) => (
                  <a key={p.tel} href={`tel:${p.tel}`} data-track="click_phone" className={s.contactLink}>{p.display}</a>
                ))}
              </span>
            </li>
            <li>
              <span className={s.contactIcon} aria-hidden="true"><IconWhatsApp /></span>
              <span className={s.contactBody}>
                <span className={s.contactLabel}>{contact.whatsapp}</span>
                <a href={CONTACTS.whatsapp} target="_blank" rel="noopener noreferrer" data-track="click_whatsapp"
                  className={s.contactLink}>+998 97 711-17-11</a>
              </span>
            </li>
            <li>
              <span className={s.contactIcon} aria-hidden="true"><IconTelegram /></span>
              <span className={s.contactBody}>
                <span className={s.contactLabel}>{contact.telegram}</span>
                <a href={CONTACTS.telegram} target="_blank" rel="noopener noreferrer" data-track="click_telegram"
                  className={s.contactLink}>@expocontact</a>
              </span>
            </li>
            <li>
              <span className={s.contactIcon} aria-hidden="true"><IconMail /></span>
              <span className={s.contactBody}>
                <span className={s.contactLabel}>{contact.email}</span>
                <a href={`mailto:${CONTACTS.email}`} data-track="click_email" className={s.contactLink}>{CONTACTS.email}</a>
              </span>
            </li>
            <li>
              <span className={s.contactIcon} aria-hidden="true"><IconGlobe /></span>
              <span className={s.contactBody}>
                <span className={s.contactLabel}>{contact.site}</span>
                {/* Text only: the landing does not link to the main site. */}
                <span className={s.contactText}>{CONTACTS.site}</span>
              </span>
            </li>
          </ul>
        </div>

        <div className={s.formCol} data-reveal="">
          <OfferForm lang={lang} form={dict.form} chosenTemplate={dict.formats.chosen} countries={countries}
            months={months} startYear={startYear} defaultDial={defaultDial} />
        </div>
      </div>
    </section>
  );
}
