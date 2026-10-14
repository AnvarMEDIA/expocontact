/**
 * Which of the five landing languages a browser asks for.
 *
 * Reads Accept-Language with its q-weights and takes the best supported
 * match by primary subtag: "zh-TW" still lands on the simplified Chinese
 * page (the closest we have), "uz-Cyrl" on the Latin Uzbek one. Anything we
 * do not speak falls back to English — the audience is foreign organisers.
 */
import { DEFAULT_OFFER_LANG, isOfferLang, type OfferLang } from "../i18n/langs";

export function pickOfferLang(header: string | null | undefined): OfferLang {
  if (!header) return DEFAULT_OFFER_LANG;

  const ranked = header
    .split(",")
    .map((part, index) => {
      const [tag, ...params] = part.trim().split(";");
      const qParam = params.find((p) => p.trim().startsWith("q="));
      const q = qParam ? Number(qParam.trim().slice(2)) : 1;
      return { tag: tag.trim().toLowerCase(), q: Number.isFinite(q) ? q : 0, index };
    })
    .filter((entry) => entry.tag && entry.q > 0)
    // Stable: equal weights keep the browser's own order.
    .sort((a, b) => b.q - a.q || a.index - b.index);

  for (const { tag } of ranked) {
    const primary = tag.split("-")[0];
    if (isOfferLang(primary)) return primary;
  }
  return DEFAULT_OFFER_LANG;
}
