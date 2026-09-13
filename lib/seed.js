/**
 * Built-in content shipped with the deployment.
 *
 * These are STATIC imports on purpose. Reading content/*.json with fs at
 * runtime does not work on Vercel — the files are not part of the serverless
 * bundle, the read throws and the caller silently falls back to empty data.
 * Importing them makes the bundler include the contents in the function.
 *
 * The store (lib/store.js) uses this as the fallback whenever a document has
 * not been written to persistent storage yet, so a fresh deployment always has
 * the repository content and an editor never starts from a blank site.
 */
import clients from '@/content/data/clients.json';

import portfolioRu from '@/content/data/portfolio.ru.json';
import portfolioEn from '@/content/data/portfolio.en.json';
import portfolioUz from '@/content/data/portfolio.uz.json';

import testimonialsRu from '@/content/data/testimonials.ru.json';
import testimonialsEn from '@/content/data/testimonials.en.json';
import testimonialsUz from '@/content/data/testimonials.uz.json';

import settingsRu from '@/content/data/settings.ru.json';
import settingsEn from '@/content/data/settings.en.json';
import settingsUz from '@/content/data/settings.uz.json';

import seoRu from '@/content/data/seo.ru.json';
import seoEn from '@/content/data/seo.en.json';
import seoUz from '@/content/data/seo.uz.json';

import contentRu from '@/content/ru.json';
import contentEn from '@/content/en.json';
import contentUz from '@/content/uz.json';

export const LOCALES = ['ru', 'en', 'uz'];

/** Document name → built-in value. Document names are the store's keys. */
export const SEED = {
  'clients': clients,

  'portfolio.ru': portfolioRu,
  'portfolio.en': portfolioEn,
  'portfolio.uz': portfolioUz,

  'testimonials.ru': testimonialsRu,
  'testimonials.en': testimonialsEn,
  'testimonials.uz': testimonialsUz,

  'settings.ru': settingsRu,
  'settings.en': settingsEn,
  'settings.uz': settingsUz,

  'seo.ru': seoRu,
  'seo.en': seoEn,
  'seo.uz': seoUz,

  'content.ru': contentRu,
  'content.en': contentEn,
  'content.uz': contentUz,
};

export const DOC_NAMES = Object.keys(SEED);

/** Deep clone so callers can mutate freely without touching the imported module. */
export function seedOf(name) {
  const value = SEED[name];
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
}
