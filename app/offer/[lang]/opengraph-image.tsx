/**
 * The social preview of each language version, 1200×630, drawn in the hero's
 * style: navy gradient, the logo mark cut by the edge, the headline in white
 * and orange. Rendered at build time with next/og.
 *
 * Fonts come from Google Fonts subset to exactly the characters on the card
 * (Onest; Noto Sans SC for Chinese). If they cannot be fetched the card still
 * renders, in the default font.
 */
import { ImageResponse } from "next/og";
import { DEFAULT_OFFER_LANG, OFFER_LANGS, getDict, isOfferLang } from "@/offer/i18n";
import { logoSvgWhite } from "@/offer/lib/logo";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "ExpoContact — trade show organiser in Uzbekistan";

export function generateStaticParams() {
  return OFFER_LANGS.map((lang) => ({ lang }));
}

async function googleFont(family: string, weight: number, text: string): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:wght@${weight}&text=${encodeURIComponent(text)}`,
    ).then((r) => r.text());
    const src = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    return src ? await fetch(src).then((r) => r.arrayBuffer()) : null;
  } catch {
    return null;
  }
}

/** The mark as on the hero, in solid muted colours — the renderer ignores opacity on SVG strokes. */
const MARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 104 104"><g fill="none" stroke="#1F4C8E"><path stroke-width="11.93" d="M94.035 55.36 L94.035 50 A44.035 44.035 0 1 0 50 94.035 L55.7 94.035"/><path stroke-width="10.77" d="M72.115 55.42 L72.115 50 A22.115 22.115 0 1 0 50 72.115 L55.76 72.115"/></g><path fill="#B9541C" d="M55.67 55.67l-5.67 0c-3.12,0 -5.67,-2.55 -5.67,-5.67 0,-3.12 2.55,-5.67 5.67,-5.67 3.12,0 5.67,2.55 5.67,5.67l0 5.67z"/><polygon fill="#B9541C" points="100,61.67 61.67,61.67 61.67,100 70.84,100 70.84,70.84 100,70.84"/><polygon fill="#1F4C8E" points="77.5,77.5 100,77.5 100,100 77.5,100"/></svg>`;

const dataUri = (svg: string) => `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

export default async function Image({ params }: { params: { lang: string } }) {
  const lang = isOfferLang(params.lang) ? params.lang : DEFAULT_OFFER_LANG;
  const dict = getDict(lang);
  const [first, ...accent] = dict.hero.title;
  const footer = "expocontact.uz";
  const text = [dict.meta.ogKicker, ...dict.hero.title, footer].join(" ");

  const family = lang === "zh" ? "Noto Sans SC" : "Onest";
  const [heavy, bold] = await Promise.all([googleFont(family, 800, text), googleFont(family, 600, text)]);
  const fonts = [
    ...(heavy ? [{ name: "OG", data: heavy, weight: 800 as const, style: "normal" as const }] : []),
    ...(bold ? [{ name: "OG", data: bold, weight: 600 as const, style: "normal" as const }] : []),
  ];
  const cjk = lang === "zh";

  return new ImageResponse(
    (
      <div style={{
        width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between",
        padding: "60px 72px", color: "#fff", fontFamily: fonts.length ? "OG" : undefined,
        backgroundImage: "radial-gradient(120% 120% at 0% 0%, #1B4E9B 0%, #0E2A5A 55%, #0A1F45 100%)",
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={dataUri(MARK_SVG)} width={720} height={720} alt=""
          style={{ position: "absolute", right: -330, top: -45 }} />

        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 24, fontWeight: 600,
          letterSpacing: cjk ? 2 : 3, color: "#FF9658" }}>
          <div style={{ width: 36, height: 3, background: "#FF9658", borderRadius: 3 }} />
          {dict.meta.ogKicker.toLocaleUpperCase(lang)}
        </div>

        {/* Chinese breaks between any two characters, so each phrase gets its
            own line at a size where the longest one fits whole. */}
        <div style={{ display: "flex", flexDirection: "column", fontSize: cjk ? 58 : 74, fontWeight: 800,
          lineHeight: cjk ? 1.25 : 1.04, letterSpacing: cjk ? 0 : -2, maxWidth: 780 }}>
          <span>{first}</span>
          {cjk
            ? accent.map((line) => <span key={line} style={{ color: "#EC691F" }}>{line}</span>)
            : <span style={{ color: "#EC691F" }}>{accent.join(" ")}</span>}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
          fontSize: 26, fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={dataUri(logoSvgWhite())} width={252} height={70} alt="ExpoContact" />
          <span>{footer}</span>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
