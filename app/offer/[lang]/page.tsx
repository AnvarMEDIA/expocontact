import { notFound } from "next/navigation";
import { LANG_INFO, getDict, isOfferLang } from "@/offer/i18n";
import { countryOptions } from "@/offer/lib/countries";
import Header from "@/offer/sections/Header";
import Hero from "@/offer/sections/Hero";
import Services from "@/offer/sections/Services";
import Problems from "@/offer/sections/Problems";
import OneContract from "@/offer/sections/OneContract";
import Visitors from "@/offer/sections/Visitors";
import Report from "@/offer/sections/Report";
import Plan from "@/offer/sections/Plan";
import Experience from "@/offer/sections/Experience";
import Formats from "@/offer/sections/Formats";
import Contact from "@/offer/sections/Contact";
import Footer from "@/offer/sections/Footer";
import MobileCta from "@/offer/components/MobileCta";
import PrivacyDialog from "@/offer/components/PrivacyDialog";
import base from "@/offer/styles/base.module.css";

/** "январь" → "Январь"; Chinese month names pass through unchanged. */
function monthNames(intl: string): string[] {
  const fmt = new Intl.DateTimeFormat(intl, { month: "long", timeZone: "UTC" });
  return Array.from({ length: 12 }, (_, i) => {
    const name = fmt.format(new Date(Date.UTC(2026, i, 1)));
    return name.charAt(0).toLocaleUpperCase(intl) + name.slice(1);
  });
}

export default function OfferPage({ params }: { params: { lang: string } }) {
  if (!isOfferLang(params.lang)) notFound();
  const lang = params.lang;
  const dict = getDict(lang);
  const info = LANG_INFO[lang];

  return (
    <>
      <a className={base.skip} href="#main">{dict.a11y.skip}</a>
      <Header lang={lang} nav={dict.nav} a11y={dict.a11y} />
      <main id="main">
        <Hero hero={dict.hero} intl={info.intl} />
        <Services services={dict.services} />
        <Problems problems={dict.problems} />
        <OneContract contract={dict.contract} />
        <Visitors visitors={dict.visitors} />
        <Report report={dict.report} intl={info.intl} />
        <Plan plan={dict.plan} />
        <Experience experience={dict.experience} a11y={dict.a11y} intl={info.intl} />
        <Formats formats={dict.formats} a11y={dict.a11y} />
        <Contact lang={lang} dict={dict} countries={countryOptions(info.intl)} months={monthNames(info.intl)}
          startYear={new Date().getFullYear()} defaultDial={info.dial} />
      </main>
      <Footer footer={dict.footer} year={new Date().getFullYear()} />
      <MobileCta label={dict.nav.cta} />
      <PrivacyDialog privacy={dict.privacy} close={dict.a11y.close} />
    </>
  );
}
