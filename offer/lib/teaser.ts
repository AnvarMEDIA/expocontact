/**
 * The organiser proposition in brief, for the main site's home page
 * (the «Организаторам» section and the fork between the two directions —
 * see lib/directions.js).
 *
 * Everything here is read from the /offer dictionary and data of the same
 * language, never retyped, so a wording or a format changed on /offer changes
 * on the home page too. Built on the server (app/[locale]/page.js) and handed
 * to the page as plain data: only the visitor's language reaches the browser,
 * not five dictionaries.
 */
import { getDict, parseTitle, type TitlePart } from "../i18n";
import { isOfferLang, type OfferLang } from "../i18n/langs";
import { FORMAT_PACKAGES, RECOMMENDED_PACKAGE } from "./content";
import { PACKAGE_NAMES, type PackageKey } from "./lead";

export interface OrganiserTeaser {
  /** The /offer language the texts come from. */
  lang: OfferLang;
  kicker: string;
  /** Hero title, one entry per line; the last line carries the accent. */
  title: string[];
  lead: string;
  services: { title: string; text: string }[];
  contract: { kicker: string; title: TitlePart[][]; usual: string; with: string[] };
  visitors: { kicker: string; title: TitlePart[][]; steps: { title: string; text: string }[]; note: string };
  formats: { key: PackageKey; name: string; tagline: string; rows: number; recommended: boolean }[];
  /** Rows of the formats table, so «n of total» can be printed. */
  totalRows: number;
  /** Badge on the recommended format. */
  recommended: string;
}

/** ru / en / uz map to themselves; anything else falls back to English. */
export function organiserTeaser(locale: string): OrganiserTeaser {
  const lang: OfferLang = isOfferLang(locale) ? locale : "en";
  const d = getDict(lang);
  return {
    lang,
    kicker: d.hero.kicker,
    title: [...d.hero.title],
    lead: d.hero.lead,
    services: d.services.cards.map((c) => ({ title: c.title, text: c.text })),
    contract: {
      kicker: d.contract.kicker,
      title: parseTitle(d.contract.title),
      usual: d.contract.usualCaption,
      with: [...d.contract.with],
    },
    visitors: {
      kicker: d.visitors.kicker,
      title: parseTitle(d.visitors.title),
      steps: d.visitors.steps.map((step) => ({ title: step.title, text: step.text })),
      note: d.visitors.note,
    },
    formats: FORMAT_PACKAGES.map((p) => ({
      key: p.key,
      name: PACKAGE_NAMES[p.key],
      tagline: d.formats.taglines[p.tagline],
      rows: p.rows,
      recommended: p.key === RECOMMENDED_PACKAGE,
    })),
    totalRows: d.formats.rows.length,
    recommended: d.formats.recommended,
  };
}
