/**
 * Writes offer/i18n/TRANSLATIONS_REVIEW.md: every string of the /offer
 * landing side by side in all five languages, for native speakers to check.
 *
 *   node offer/scripts/translations-review.mjs
 *
 * Node 22+ reads the .ts dictionaries directly (type stripping).
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const dir = join(dirname(dirname(fileURLToPath(import.meta.url))), "i18n");
const LANGS = ["ru", "en", "tr", "zh", "uz"];
const dicts = Object.fromEntries(
  await Promise.all(LANGS.map(async (l) => [l, (await import(join(dir, `${l}.ts`)))[l]])),
);

const leaves = [];
const walk = (node, path) => {
  if (typeof node === "string") return leaves.push(path);
  for (const [k, v] of Object.entries(node)) walk(v, path ? `${path}.${k}` : k);
};
walk(dicts.ru, "");

const get = (obj, path) => path.split(".").reduce((o, k) => o?.[k], obj);
const show = (s) => s.replace(/\n/g, " ⏎ ");

const SECTION = {
  meta: "Мета-теги и соцсети", a11y: "Подписи для скринридеров", nav: "Шапка", hero: "1. Hero",
  services: "2. Услуги", problems: "3. Проблемы → решения", contract: "4. Один договор вместо пяти",
  visitors: "5. Посетители", report: "6. Отчёт организатору", plan: "7. План запуска",
  experience: "8. Опыт", formats: "9. Форматы", contact: "10. Контакт", form: "10. Форма заявки",
  footer: "11. Футер", privacy: "Политика конфиденциальности",
};

let out = `# /offer — переводы на проверку

Все тексты лендинга для зарубежных организаторов на пяти языках. Мастер —
русский, английский дан в брифе; турецкий, китайский (упрощённый) и
узбекский (латиница) переведены и **нуждаются в проверке носителями**.

Как читать:
- \`[квадратные скобки]\` — выделенная оранжевым часть заголовка. Скобки
  можно переставить, если в языке другой порядок слов.
- \`⏎\` — принудительный перенос строки.
- \`{n}\`, \`{from}\`, \`{to}\`, \`{name}\`, \`{link}\` — подставляемые значения, не переводить.
- Не переводятся: названия пакетов (Local Partner, Turnkey Build, Full House),
  площадки и компании, ExpoContact, Meta / Telegram / Google / WhatsApp.
- Узбекский: оʻ и gʻ пишутся с U+02BB (ʻ), разделительный знак — U+02BC (ʼ).

Как внести правку: исправить строку в \`offer/i18n/<язык>.ts\`. После правки
китайского запустить \`node offer/scripts/build-zh-font.mjs\` — шрифт
собирается ровно из иероглифов словаря. Этот файл пересобирается командой
\`node offer/scripts/translations-review.mjs\`.

Всего строк: ${leaves.length} × 5 языков.
`;

let current = "";
for (const path of leaves) {
  const top = path.split(".")[0];
  if (top !== current) {
    current = top;
    out += `\n## ${SECTION[top] || top}\n`;
  }
  out += `\n**\`${path}\`**\n\n`;
  for (const l of LANGS) out += `- ${l.toUpperCase()}: ${show(get(dicts[l], path))}\n`;
}

writeFileSync(join(dir, "TRANSLATIONS_REVIEW.md"), out);
console.log(`TRANSLATIONS_REVIEW.md: ${leaves.length} strings`);
