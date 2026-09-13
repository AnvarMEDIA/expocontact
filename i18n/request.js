import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';
import { readObject } from '../lib/store';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // Validate the locale
  if (!locale || !routing.locales.includes(locale)) {
    locale = routing.defaultLocale;
  }

  // Messages come from the store so headings, labels and lists edited in
  // /admin reach the site. readObject falls back to the bundled content file
  // when nothing has been saved yet, so this can never render an empty page.
  return {
    locale,
    messages: await readObject(`content.${locale}`),
  };
});
