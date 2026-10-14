/**
 * The five languages of the /offer landing. They exist only here: the main
 * site keeps its own ru / en / uz routing (i18n/routing.js) and never learns
 * about Turkish or Chinese.
 */
import { ru, type OfferDict } from "./ru";
import { en } from "./en";
import { tr } from "./tr";
import { zh } from "./zh";
import { uz } from "./uz";

export type { OfferDict };

import { OFFER_LANGS, DEFAULT_OFFER_LANG, isOfferLang, type OfferLang } from "./langs";

export { OFFER_LANGS, DEFAULT_OFFER_LANG, isOfferLang, type OfferLang };

interface LangInfo {
  /** Switcher label, in the language itself. */
  label: string;
  /** `<html lang>` — a script subtag where the language has two scripts. */
  html: string;
  /** hreflang value in the sitemap and <link rel="alternate">. */
  hreflang: string;
  /** Locale handed to Intl for numbers, months and country names. */
  intl: string;
  /** Open Graph locale. */
  og: string;
  /** What the phone field starts with. Empty: an international visitor types their own. */
  dial: string;
}

export const LANG_INFO: Record<OfferLang, LangInfo> = {
  ru: { label: "RU", html: "ru", hreflang: "ru", intl: "ru-RU", og: "ru_RU", dial: "+998 " },
  en: { label: "EN", html: "en", hreflang: "en", intl: "en-GB", og: "en_GB", dial: "" },
  tr: { label: "TR", html: "tr", hreflang: "tr", intl: "tr-TR", og: "tr_TR", dial: "+90 " },
  zh: { label: "中文", html: "zh-Hans", hreflang: "zh-Hans", intl: "zh-CN", og: "zh_CN", dial: "+86 " },
  uz: { label: "UZ", html: "uz-Latn", hreflang: "uz", intl: "uz-Latn-UZ", og: "uz_UZ", dial: "+998 " },
};

const DICTS: Record<OfferLang, OfferDict> = { ru, en, tr, zh, uz };

export function getDict(lang: OfferLang): OfferDict {
  return DICTS[lang];
}

/** "День {n}" + { n: 2 } → "День 2". */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

export interface TitlePart {
  text: string;
  accent: boolean;
}

/**
 * Headings mark their highlighted words with square brackets, so each language
 * can put the accent wherever its word order needs it:
 * "Один договор [вместо пяти]", "Beş sözleşme yerine [tek sözleşme]".
 * Returns one array per line (`\n` breaks a line).
 */
export function parseTitle(source: string): TitlePart[][] {
  return source.split("\n").map((line) => {
    const parts: TitlePart[] = [];
    const re = /\[([^\]]+)\]/g;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(line))) {
      if (m.index > last) parts.push({ text: line.slice(last, m.index), accent: false });
      parts.push({ text: m[1], accent: true });
      last = m.index + m[0].length;
    }
    if (last < line.length) parts.push({ text: line.slice(last), accent: false });
    return parts;
  });
}

/** Plain text of a bracketed heading, for metadata and aria labels. */
export function plainTitle(source: string): string {
  return source.replace(/[[\]]/g, "").replace(/\n/g, " ");
}
