import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intl = createMiddleware(routing);

// /offer is a separate product with five languages of its own (offer/i18n).
// The site's ru / en / uz routing must not touch it: without this it would
// redirect /offer to /ru/offer and invent duplicates of every page.
const OFFER = /^\/offer(\/|$)/;

export default function middleware(request) {
  if (OFFER.test(request.nextUrl.pathname)) return;
  return intl(request);
}

export const config = {
  // Match all paths except static assets, _next internals, and admin/api routes
  matcher: [
    '/((?!_next|_vercel|api|admin|.*\\..*).*)',
  ],
};
