/**
 * /offer/[lang] — the landing for foreign trade-show organisers.
 *
 * The full page of ExpoContact's organiser direction (lib/directions.js; the
 * home page carries its summary). Its own <html>, fonts, styles and five
 * languages; the only links out are the main site in the contacts and the
 * footer. The lead pipeline is shared — the form posts to /api/contact like
 * every other form.
 */
import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Onest } from "next/font/google";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import { META_PIXEL_ID, META_PIXEL_SNIPPET } from "@/lib/metaPixel";
import { DEFAULT_OFFER_LANG, LANG_INFO, OFFER_LANGS, getDict, isOfferLang } from "@/offer/i18n";
import { offerJsonLd } from "@/offer/lib/schema";
import { SITE_URL } from "@/lib/site";
import ClickTracker from "@/offer/components/ClickTracker";
import RevealObserver from "@/offer/components/RevealObserver";
import Trackers from "@/offer/components/Trackers";
import base from "@/offer/styles/base.module.css";
import "./offer-motion.css";
import "./offer-fonts.css";


const onest = Onest({
  subsets: ["latin", "latin-ext", "cyrillic"],
  display: "swap",
  variable: "--font-onest",
});

/** Runs before first paint: hide-until-revealed only when JavaScript is here to reveal. */
const HEAD_SCRIPT =
  "(function(d){var h=d.documentElement;h.classList.add('of-js');" +
  "setTimeout(function(){if(!window.__ofReady)h.classList.remove('of-js')},4000)})(document)";

export const dynamicParams = false;

export function generateStaticParams() {
  return OFFER_LANGS.map((lang) => ({ lang }));
}

type Params = { params: { lang: string } };

export function generateMetadata({ params }: Params): Metadata {
  const lang = isOfferLang(params.lang) ? params.lang : DEFAULT_OFFER_LANG;
  const meta = getDict(lang).meta;
  const languages: Record<string, string> = Object.fromEntries(
    OFFER_LANGS.map((l) => [LANG_INFO[l].hreflang, `/offer/${l}`]),
  );
  languages["x-default"] = `/offer/${DEFAULT_OFFER_LANG}`;

  return {
    metadataBase: new URL(SITE_URL),
    title: { absolute: meta.title },
    description: meta.description,
    alternates: { canonical: `/offer/${lang}`, languages },
    openGraph: {
      type: "website",
      siteName: "ExpoContact",
      url: `/offer/${lang}`,
      title: meta.ogTitle,
      description: meta.ogDescription,
      locale: LANG_INFO[lang].og,
      alternateLocale: OFFER_LANGS.filter((l) => l !== lang).map((l) => LANG_INFO[l].og),
    },
    twitter: { card: "summary_large_image", title: meta.ogTitle, description: meta.ogDescription },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    },
    formatDetection: { telephone: false, email: false, address: false },
  };
}

export const viewport: Viewport = {
  themeColor: "#0A1F45",
  // The palette is drawn for light only. Without this, Chrome's automatic
  // dark mode on Android inverts it into muddy greys and kills the orange.
  colorScheme: "only light",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function OfferLayout({ children, params }: { children: ReactNode } & Params) {
  if (!isOfferLang(params.lang)) notFound();
  const lang = params.lang;

  return (
    <html lang={LANG_INFO[lang].html} className={base.html} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: HEAD_SCRIPT }} />
        {/* The Chinese headline is the largest paint on /offer/zh and cannot
            render without these glyphs: fetch them before the CSS asks. */}
        {lang === "zh" && (
          <>
            <link rel="preload" as="font" type="font/woff2" href="/fonts/noto-sans-sc-offer-700.woff2" crossOrigin="anonymous" />
            <link rel="preload" as="font" type="font/woff2" href="/fonts/noto-sans-sc-offer-400.woff2" crossOrigin="anonymous" />
          </>
        )}
        {/* Meta Pixel — the same ExpoContact Pixel as the main site. Loaded
            here because the main site's layout, which carries it, is not. */}
        <script dangerouslySetInnerHTML={{ __html: META_PIXEL_SNIPPET }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: offerJsonLd(lang, SITE_URL) }} />
      </head>
      <body className={`${base.body} of-root ${onest.variable} ${lang === "zh" ? "of-zh" : ""}`}>
        {/* Raw HTML on purpose: as a JSX <img>, React hoisted it into a
            <link rel="preload" as="image">, so every browser fetched the
            noscript pixel — a second, cookieless PageView for each visit. */}
        <noscript
          dangerouslySetInnerHTML={{
            __html: `<img height="1" width="1" style="display:none" alt="" src="https://www.facebook.com/tr?id=${META_PIXEL_ID}&amp;ev=PageView&amp;noscript=1">`,
          }}
        />
        {children}
        <RevealObserver />
        <ClickTracker language={lang} />
        <AnalyticsTracker locale={lang} />
        <Trackers />
      </body>
    </html>
  );
}
