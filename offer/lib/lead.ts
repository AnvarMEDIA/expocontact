/**
 * The organiser enquiry from /offer — one definition for the browser form and
 * for POST /api/contact, so the two cannot disagree about what is valid.
 *
 * Answers are stored as stable keys ("5000_10000", "full_house"), never as the
 * visitor's translated wording: the same enquiry can arrive in five languages
 * and the team reads all of them in Russian.
 */
import { formatPhone } from "@/lib/phone";
import { COUNTRY_CODES, countryNameRu } from "./countries";

export const AREA_KEYS = ["lt1000", "1000_5000", "5000_10000", "10000plus", "unknown"] as const;
export type AreaKey = (typeof AREA_KEYS)[number];

export const FORMAT_KEYS = ["local_partner", "turnkey_build", "full_house", "consult"] as const;
export type FormatKey = (typeof FORMAT_KEYS)[number];
export type PackageKey = Exclude<FormatKey, "consult">;

/** Package names are a brand: the same in every language. */
export const PACKAGE_NAMES: Record<PackageKey, string> = {
  local_partner: "Local Partner",
  turnkey_build: "Turnkey Build",
  full_house: "Full House",
};

const AREA_RU: Record<AreaKey, string> = {
  lt1000: "до 1 000 м²",
  "1000_5000": "1 000–5 000 м²",
  "5000_10000": "5 000–10 000 м²",
  "10000plus": "10 000+ м²",
  unknown: "пока не знает",
};

const FORMAT_RU: Record<FormatKey, string> = { ...PACKAGE_NAMES, consult: "нужна консультация" };

export const FIELDS = [
  "name", "company", "country", "email", "phone",
  "showName", "dates", "area", "format", "message", "consent",
] as const;
export type Field = (typeof FIELDS)[number];
export type FieldError = "required" | "email" | "phone" | "country" | "consent";

export interface OrganiserLead {
  name: string;
  company: string;
  country: string;
  email: string;
  phone: string;
  showName: string;
  /** "2027-03", "2027" or "" — month and year the show is planned for. */
  dates: string;
  area: AreaKey | "";
  format: FormatKey | "";
  message: string;
  consent: true;
}

export type Validation =
  | { ok: true; value: OrganiserLead }
  | { ok: false; errors: Partial<Record<Field, FieldError>> };

const LIMITS = { name: 120, company: 160, email: 160, phone: 40, showName: 200, message: 2000 };

/** Trim, drop control characters (they end up in Telegram and CSV), bound the length. */
function text(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, " ").trim().slice(0, max);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function phoneDigits(phone: string): number {
  return phone.replace(/\D/g, "").length;
}

export function validateOrganiser(input: Record<string, unknown>): Validation {
  const errors: Partial<Record<Field, FieldError>> = {};

  const name = text(input.name, LIMITS.name);
  const company = text(input.company, LIMITS.company);
  const country = text(input.country, 2).toUpperCase();
  const email = text(input.email, LIMITS.email);
  const phone = text(input.phone, LIMITS.phone);
  const showName = text(input.showName, LIMITS.showName);
  const message = text(input.message, LIMITS.message);
  const datesRaw = text(input.dates, 7);
  const areaRaw = text(input.area, 20);
  const formatRaw = text(input.format, 20);

  if (!name) errors.name = "required";
  if (!company) errors.company = "required";
  if (!country) errors.country = "required";
  else if (!COUNTRY_CODES.has(country)) errors.country = "country";
  if (!email) errors.email = "required";
  else if (!EMAIL_RE.test(email)) errors.email = "email";
  // An international number is 7 to 15 digits (E.164). The field starts
  // prefilled with a dial code, so "+90" alone means it was never filled in.
  if (!phone || phoneDigits(phone) === 0 || /^\+\d{1,4}$/.test(phone)) errors.phone = "required";
  else if (!/^[+\d\s()\-.]+$/.test(phone) || phoneDigits(phone) < 7 || phoneDigits(phone) > 15) {
    errors.phone = "phone";
  }
  if (input.consent !== true && input.consent !== "true" && input.consent !== "on") {
    errors.consent = "consent";
  }

  if (Object.keys(errors).length) return { ok: false, errors };

  // Optional answers that are not one of the offered options are dropped, not
  // stored: they arrive from the browser and must not be trusted.
  const year = Number(datesRaw.slice(0, 4));
  const dates = /^\d{4}(-(0[1-9]|1[0-2]))?$/.test(datesRaw) && year >= 2024 && year <= 2045 ? datesRaw : "";
  const area = (AREA_KEYS as readonly string[]).includes(areaRaw) ? (areaRaw as AreaKey) : "";
  const format = (FORMAT_KEYS as readonly string[]).includes(formatRaw) ? (formatRaw as FormatKey) : "";

  return {
    ok: true,
    value: { name, company, country, email, phone, showName, dates, area, format, message, consent: true },
  };
}

/** "2027-03" → "03.2027". */
function datesLabel(dates: string): string {
  return dates.length === 7 ? `${dates.slice(5)}.${dates.slice(0, 4)}` : dates;
}

/**
 * The enquiry as Russian lines. Stored as the lead's message too, so the admin
 * lead card and the CSV export show every answer without knowing this form.
 */
export function organiserSummary(lead: OrganiserLead): string[] {
  return [
    `Страна: ${countryNameRu(lead.country)} (${lead.country})`,
    `E-mail: ${lead.email}`,
    lead.dates ? `Даты: ${datesLabel(lead.dates)}` : null,
    lead.area ? `Площадь: ${AREA_RU[lead.area]}` : null,
    lead.format ? `Формат: ${FORMAT_RU[lead.format]}` : null,
  ].filter((line): line is string => Boolean(line));
}

interface Marketing {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
  clickType?: string;
  clickId?: string;
  referrer?: string;
}

const UTM_KEYS = ["source", "medium", "campaign", "content", "term"] as const;

export function tashkentTime(at: Date): string {
  return new Intl.DateTimeFormat("ru-RU", {
    timeZone: "Asia/Tashkent",
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(at);
}

/** The Telegram message for the team chat. Plain text: no parse_mode, see lib/telegram.js. */
export function organiserTelegram(args: {
  lead: OrganiserLead;
  id?: string | null;
  lang: string;
  marketing?: Marketing | null;
  at: Date;
  adminUrl?: string | null;
}): string {
  const { lead, id, lang, marketing, at, adminUrl } = args;
  const utm = UTM_KEYS.filter((k) => marketing?.[k]).map((k) => `utm_${k}: ${marketing?.[k]}`);

  return [
    "🌍 OFFER / ORGANISER LEAD",
    id ? `🆔 ${id}` : null,
    "",
    `👤 Имя: ${lead.name}`,
    `🏢 Компания: ${lead.company}`,
    `🌐 Страна: ${countryNameRu(lead.country)} (${lead.country})`,
    `✉️ E-mail: ${lead.email}`,
    `📞 Телефон / WhatsApp: ${formatPhone(lead.phone)}`,
    lead.showName ? `🎪 Выставка: ${lead.showName}` : null,
    lead.dates ? `📅 Даты: ${datesLabel(lead.dates)}` : null,
    lead.area ? `📐 Площадь: ${AREA_RU[lead.area]}` : null,
    lead.format ? `📦 Формат: ${FORMAT_RU[lead.format]}` : null,
    lead.message ? `💬 Сообщение: ${lead.message}` : null,
    "",
    `🗣 Язык страницы: ${lang.toUpperCase()}`,
    ...(utm.length ? ["🎯 Метки:", ...utm.map((line) => `   ${line}`)] : ["🎯 Метки: нет"]),
    marketing?.clickId ? `🆔 Клик ${marketing.clickType}: ${marketing.clickId}` : null,
    `🔗 Referrer: ${marketing?.referrer || "прямой заход"}`,
    `🕒 Время (Ташкент): ${tashkentTime(at)}`,
    adminUrl ? `\n🔧 Открыть в админке: ${adminUrl}` : null,
  ]
    .filter((line) => line !== null)
    .join("\n");
}
