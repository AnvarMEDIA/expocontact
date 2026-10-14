/**
 * Names that are never translated: venues and partner companies are proper
 * names, and the contacts are the same on every language version.
 */
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
