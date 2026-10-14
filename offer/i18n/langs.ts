/** The five landing languages, without their dictionaries — cheap to import anywhere. */
export const OFFER_LANGS = ["ru", "en", "tr", "zh", "uz"] as const;
export type OfferLang = (typeof OFFER_LANGS)[number];

/** Foreign organisers are the audience, so an undecided visitor reads English. */
export const DEFAULT_OFFER_LANG: OfferLang = "en";

export function isOfferLang(value: unknown): value is OfferLang {
  return typeof value === "string" && (OFFER_LANGS as readonly string[]).includes(value);
}
