/**
 * Builds the Chinese font for /offer/zh: Noto Sans SC cut down to exactly the
 * characters the Chinese dictionary uses.
 *
 * Why: Manrope has no hanzi. Loading Noto Sans SC through next/font/google put
 * ~200 @font-face rules (187 KB of render-blocking CSS) on every language
 * version and ~900 KB of font slices on /offer/zh. The subset is two small
 * woff2 files in public/fonts, declared in app/offer/[lang]/offer-fonts.css
 * and preloaded by the layout on /offer/zh only.
 *
 * Re-run after changing offer/i18n/zh.ts:  node offer/scripts/build-zh-font.mjs
 * Characters outside the subset (country names typed by a visitor) fall back
 * to the system's Chinese font, which every Chinese-language device has.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const publicFonts = join(dirname(root), "public", "fonts");
const source = readFileSync(join(root, "i18n", "zh.ts"), "utf8");

// Everything the dictionary prints, plus month names built by Intl in the form
// (一月 … 十二月), digits and the punctuation Chinese text uses.
const extra = "一二三四五六七八九十月年0123456789，。、：；！？（）—…「」“”·％";
const chars = [...new Set([...source, ...extra])]
  .filter((c) => c.codePointAt(0) > 0x2000)
  .sort()
  .join("");

// A browser user agent makes Google answer with woff2.
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36";

for (const weight of [400, 700]) {
  const url = `https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@${weight}&text=${encodeURIComponent(chars)}`;
  const css = await fetch(url, { headers: { "User-Agent": UA } }).then((r) => r.text());
  const src = css.match(/src: url\((.+?)\) format\('woff2'\)/)?.[1];
  if (!src) throw new Error(`No woff2 for weight ${weight}:\n${css.slice(0, 300)}`);
  const font = Buffer.from(await fetch(src).then((r) => r.arrayBuffer()));
  const out = join(publicFonts, `noto-sans-sc-offer-${weight}.woff2`);
  writeFileSync(out, font);
  console.log(`${out}: ${(font.length / 1024).toFixed(1)} KB, ${[...chars].length} characters`);
}
