/**
 * GET /offer — sends the visitor to their language.
 *
 * 307 by Accept-Language, English when nothing matches. The query string
 * travels along: ads point here with utm_* tags, and dropping them in the
 * redirect would lose the attribution of every visit that arrives this way.
 */
import { pickOfferLang } from "@/offer/lib/language";

export const dynamic = "force-dynamic";

export function GET(request: Request): Response {
  const lang = pickOfferLang(request.headers.get("accept-language"));
  const { search } = new URL(request.url);
  return new Response(null, {
    status: 307,
    headers: {
      // Relative on purpose: the absolute host behind Vercel's proxy is not
      // always the one the visitor typed (www or not).
      Location: `/offer/${lang}${search}`,
      Vary: "Accept-Language",
      "Cache-Control": "private, no-store",
    },
  });
}
