/**
 * Language-independent facts of the landing: names that are never translated
 * (venues, partner companies, contacts) and the shape of the formats table and
 * of the launch plan. The page and the texts for language models (/llms.txt,
 * /llms-full.txt) both read them from here, so the two cannot disagree.
 */
import type { PackageKey } from "./lead";
export const VENUES = [
  "UzExpoCentre", "CAEx Uzbekistan", "Anhor Lokomotiv", "Yoshlar Ijod Saroyi",
  "Humo Arena", "Alpomish Arena", "Zakovat Arena",
] as const;

export const PARTNERS = [
  "Alif Bank", "Silk Road Motors", "UzTextile Cluster", "AlmazPharm",
  "MaxWay", "Agromir", "TashkentMed", "UZ Tourism Committee",
] as const;

export const CONTACTS = {
  phones: [
    { display: "+998 97 711-17-11", tel: "+998977111711" },
    { display: "+998 99 722-70-70", tel: "+998997227070" },
  ],
  whatsapp: "https://wa.me/998977111711",
  telegram: "https://t.me/expocontact",
  email: "info@expocontact.uz",
  /** Shown as text only: the landing never links to the main site. */
  site: "www.expocontact.uz",
} as const;

/** How many of the ten «formats» rows each package covers, top-down. */
export const FORMAT_PACKAGES: ReadonlyArray<{ key: PackageKey; rows: number; tagline: "local" | "turnkey" | "full" }> = [
  { key: "local_partner", rows: 3, tagline: "local" },
  { key: "turnkey_build", rows: 6, tagline: "turnkey" },
  { key: "full_house", rows: 10, tagline: "full" },
];
export const RECOMMENDED_PACKAGE: PackageKey = "full_house";

/** Launch plan in months relative to the opening (month 0), one entry per plan stage. */
export const PLAN_STAGES: ReadonlyArray<{ from: number; to: number; accent?: boolean }> = [
  { from: -9, to: -7 },
  { from: -8, to: -4 },
  { from: -6, to: -3 },
  { from: -3, to: 0, accent: true },
  { from: -0.6, to: 0 },
  { from: 0, to: 0.7 },
];
