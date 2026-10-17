/**
 * Structured data for /offer/<lang>, one @graph per language: the company,
 * this page, the service it sells with its three formats, and the questions
 * answered on the page. Every value comes from the dictionary or from
 * offer/lib/content.ts — the same text the visitor reads, nothing extra.
 *
 * The organisation shares its @id with the main site's markup
 * (app/[locale]/layout.js), so search engines see one company, not two.
 */
import { CONTACTS, FORMAT_PACKAGES, RECOMMENDED_PACKAGE } from "./content";
import { PACKAGE_NAMES } from "./lead";
import { LANG_INFO, OFFER_LANGS, getDict, plainTitle, type OfferLang } from "../i18n";

const LOGO = "https://static.tildacdn.one/tild3233-3438-4034-a138-316162306464/ExpoContact_-_Logo_W.png";

/** «Организация выставок в Узбекистане под ключ | ExpoContact» → without the brand. */
const withoutBrand = (title: string) => title.replace(/\s*\|\s*ExpoContact\s*$/, "");

export function offerJsonLd(lang: OfferLang, site: string): string {
  const d = getDict(lang);
  const url = `${site}/offer/${lang}`;
  const orgId = `${site}/#organization`;
  const inLanguage = LANG_INFO[lang].html;

  const graph = [
    {
      "@type": "Organization",
      "@id": orgId,
      name: "ExpoContact",
      url: site,
      logo: LOGO,
      foundingDate: "2004",
      email: CONTACTS.email,
      telephone: CONTACTS.phones.map((p) => p.tel),
      address: { "@type": "PostalAddress", addressLocality: "Tashkent", addressCountry: "UZ" },
      contactPoint: CONTACTS.phones.map((p) => ({
        "@type": "ContactPoint",
        telephone: p.tel,
        email: CONTACTS.email,
        contactType: "sales",
        areaServed: "UZ",
      })),
      sameAs: [CONTACTS.instagram, CONTACTS.telegram],
    },
    {
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: d.meta.title,
      description: d.meta.description,
      inLanguage,
      isPartOf: { "@id": `${site}/#website` },
      about: { "@id": `${url}#service` },
      publisher: { "@id": orgId },
      primaryImageOfPage: { "@type": "ImageObject", url: `${url}/opengraph-image`, width: 1200, height: 630 },
    },
    {
      "@type": "Service",
      "@id": `${url}#service`,
      name: withoutBrand(d.meta.title),
      serviceType: "Trade show organisation",
      description: d.meta.description,
      provider: { "@id": orgId },
      areaServed: [
        { "@type": "Country", name: "Uzbekistan" },
        { "@type": "City", name: "Tashkent" },
      ],
      audience: { "@type": "BusinessAudience", audienceType: "Trade show organisers" },
      availableChannel: {
        "@type": "ServiceChannel",
        serviceUrl: url,
        availableLanguage: OFFER_LANGS.map((l) => LANG_INFO[l].html),
      },
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: plainTitle(d.formats.title),
        itemListElement: FORMAT_PACKAGES.map((p, i) => ({
          "@type": "Offer",
          position: i + 1,
          ...(p.key === RECOMMENDED_PACKAGE ? { description: d.formats.recommended } : {}),
          itemOffered: {
            "@type": "Service",
            name: PACKAGE_NAMES[p.key],
            description: `${d.formats.taglines[p.tagline]}: ${d.formats.rows.slice(0, p.rows).join(", ")}.`,
          },
        })),
      },
    },
    {
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      inLanguage,
      isPartOf: { "@id": `${url}#webpage` },
      mainEntity: d.faq.items.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ];

  // Escaped for an inline <script>: a "<" in any string cannot close it.
  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");
}
