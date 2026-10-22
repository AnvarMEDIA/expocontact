/**
 * /[locale]/thanks — the page every main-site form sends a visitor to once the
 * server has accepted the enquiry (the two home-page forms and /lp; see
 * lib/leadHandoff.js). `?for=organiser` marks an organiser enquiry.
 *
 * It is the conversion page. Google Ads can count it by URL — «URL contains
 * /thanks» covers ru, en and uz — and <LeadConfirmed> reports Meta Lead and
 * the Google Ads conversion event, only after a real submit: never on a direct
 * visit or a reload. noindex and out of the sitemap: nobody should land here
 * from search.
 *
 * The texts reuse what the site already says: the call-back promise from the
 * contact block (CMS), the organiser wording from the /offer dictionary, the
 * contacts from offer/lib/content.ts. Only the frame is in lib/directions.js.
 */
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { readObject } from '@/lib/store';
import { directionCopy, organiserPageHref, sanitizeAudience } from '@/lib/directions';
import { getDict, parseTitle } from '@/offer/i18n';
import { isOfferLang } from '@/offer/i18n/langs';
import { CONTACTS } from '@/offer/lib/content';
import BrandLogo from '@/components/BrandLogo';
import LeadConfirmed from '@/components/LeadConfirmed';
import '@/app/landing.css';

const CALL_US_FALLBACK = {
  ru: 'Перезвоним в течение 30 минут в рабочее время.',
  en: 'We’ll call back within 30 minutes during business hours.',
  uz: 'Ish vaqtida 30 daqiqa ichida qayta qoʻngʻiroq qilamiz.',
};

export async function generateMetadata({ params }) {
  const { locale } = await params;
  return {
    title: directionCopy(locale).thanks.meta,
    robots: { index: false, follow: false },
    // Its own canonical and no hreflang: the layout's would name the home page.
    alternates: { canonical: `/${locale}/thanks` },
  };
}

export default async function ThanksPage({ params, searchParams }) {
  const { locale } = await params;
  if (!routing.locales.includes(locale)) notFound();
  const audience = sanitizeAudience((await searchParams)?.for);

  const dir = directionCopy(locale);
  const offer = getDict(isOfferLang(locale) ? locale : 'en');
  const content = await readObject(`content.${locale}`);
  const callUs = content?.contact?.modalCallUs || CALL_US_FALLBACK[locale] || CALL_US_FALLBACK.ru;
  const phone = CONTACTS.phones[0];
  const isOrg = audience === 'organiser';

  return (
    <>
      {/* The landing palette, set while parsing — as on the home page. */}
      <script dangerouslySetInnerHTML={{ __html: "document.body.classList.add('landing-body')" }} />
      <LeadConfirmed />

      <main className="thanks">
        <a className="thanks__logo" href={`/${locale}`} aria-label="ExpoContact">
          <BrandLogo />
        </a>

        <section className="thanks__card" aria-labelledby="thanks-title">
          <span className={`eyebrow${isOrg ? ' is-alt' : ''}`}>{dir.thanks.kicker}</span>
          <h1 id="thanks-title" className="thanks__title">{offer.form.successTitle}</h1>
          <p className="thanks__text">{isOrg ? offer.form.successText : callUs}</p>

          {isOrg && (
            <div className="thanks__prepare">
              <p className="thanks__prepare-title">
                {parseTitle(offer.contact.kicker).flat().map((p) => p.text).join('')}
              </p>
              <ul className="org__checks">
                {offer.contact.prepare.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
          )}

          <p className="thanks__alt">{offer.form.successAlt}</p>
          <div className="thanks__contacts">
            <a className="thanks__chip" href={CONTACTS.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp</a>
            <a className="thanks__chip" href={CONTACTS.telegram} target="_blank" rel="noopener noreferrer">Telegram</a>
            <a className="thanks__chip" href={`tel:${phone.tel}`}>{phone.display}</a>
          </div>

          <div className="thanks__links">
            {isOrg
              ? <a href={organiserPageHref(locale)}>{dir.section.more} →</a>
              : <a href={`/${locale}#folio`}>{dir.thanks.works} →</a>}
            <a href={`/${locale}`}>{dir.thanks.home}</a>
          </div>
        </section>
      </main>
    </>
  );
}
