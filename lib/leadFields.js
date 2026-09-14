/**
 * Qualifying questions asked on the ad landing form.
 *
 * The visitor answers in their own locale, but the answer is stored as a stable
 * key ('24_50'), not as the label they saw. That way the admin panel, Telegram
 * and the CSV export can show one Russian wording no matter which language the
 * lead came in through, and the options can be re-worded later without
 * rewriting the leads already stored.
 *
 * Shared by the browser and the API route, so keep this free of React and of
 * Node-only APIs.
 */

export const QUALIFIERS = {
  area: {
    label: { ru: 'Площадь стенда', en: 'Stand area', uz: 'Stend maydoni' },
    options: [
      { value: 'upto_12', ru: 'до 12 м²',    en: 'up to 12 m²',  uz: '12 m² gacha' },
      { value: '12_24',   ru: '12–24 м²',    en: '12–24 m²',     uz: '12–24 m²' },
      { value: '24_50',   ru: '24–50 м²',    en: '24–50 m²',     uz: '24–50 m²' },
      { value: '50_100',  ru: '50–100 м²',   en: '50–100 m²',    uz: '50–100 m²' },
      { value: 'over_100',ru: 'более 100 м²',en: 'over 100 m²',  uz: '100 m² dan ortiq' },
      { value: 'unknown', ru: 'пока не знаю', en: 'not sure yet', uz: 'hali aniq emas' },
    ],
  },
  standType: {
    label: { ru: 'Тип стенда', en: 'Stand type', uz: 'Stend turi' },
    options: [
      { value: 'linear',    ru: 'линейный',    en: 'in-line',    uz: 'chiziqli' },
      { value: 'corner',    ru: 'угловой',     en: 'corner',     uz: 'burchakli' },
      { value: 'peninsula', ru: 'полуостров',  en: 'peninsula',  uz: 'yarim orol' },
      { value: 'island',    ru: 'остров',      en: 'island',     uz: 'orol' },
      { value: 'two_floor', ru: 'двухэтажный', en: 'two-storey', uz: 'ikki qavatli' },
      { value: 'unknown',   ru: 'нужен совет', en: 'need advice', uz: 'maslahat kerak' },
    ],
  },
  timing: {
    label: { ru: 'Когда выставка', en: 'When is the show', uz: 'Ko’rgazma qachon' },
    options: [
      { value: 'lt_1m',   ru: 'меньше месяца',  en: 'under a month', uz: 'bir oydan kam' },
      { value: '1_3m',    ru: '1–3 месяца',     en: '1–3 months',    uz: '1–3 oy' },
      { value: '3_6m',    ru: '3–6 месяцев',    en: '3–6 months',    uz: '3–6 oy' },
      { value: 'over_6m', ru: 'позже полугода', en: 'in 6+ months',  uz: '6 oydan keyin' },
      { value: 'unknown', ru: 'дата не определена', en: 'no date yet', uz: 'sana aniqlanmagan' },
    ],
  },
};

export const QUALIFIER_KEYS = Object.keys(QUALIFIERS);

/** The question wording in one locale, falling back to Russian. */
export function qualifierLabel(key, locale = 'ru') {
  const q = QUALIFIERS[key];
  return q ? q.label[locale] || q.label.ru : key;
}

/** The chosen answer spelled out, e.g. '24_50' -> '24–50 м²'. */
export function qualifierValueLabel(key, value, locale = 'ru') {
  const opt = QUALIFIERS[key]?.options.find(o => o.value === value);
  return opt ? opt[locale] || opt.ru : value;
}

/**
 * Keep only known questions answered with one of their own options.
 *
 * The browser posts this, so anything else is dropped rather than stored:
 * these strings are shown in the admin panel and written into CSV exports.
 */
export function sanitizeDetails(input) {
  if (!input || typeof input !== 'object') return undefined;
  const out = {};
  for (const key of QUALIFIER_KEYS) {
    const value = input[key];
    if (typeof value !== 'string') continue;
    if (QUALIFIERS[key].options.some(o => o.value === value)) out[key] = value;
  }
  return Object.keys(out).length ? out : undefined;
}
