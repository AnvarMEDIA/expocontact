/**
 * Texts for language models: /llms.txt (a short index, llmstxt.org format) and
 * /llms-full.txt (everything in one file).
 *
 * Both are built from what the site itself shows — the CMS documents behind
 * the main site and the dictionaries and data of the /offer landing — so an
 * edit in /admin or in offer/i18n reaches them with no file to keep in sync.
 * Nothing here is hidden from people: every fact is on a public page.
 *
 * Left out on purpose: testimonials (placeholder content, see CLAUDE.md) and
 * the demo numbers of the /offer dashboard, which are illustrations, not data.
 */
import { readList, readObject } from '@/lib/store';
import { getDict, plainTitle } from '@/offer/i18n';
import { CONTACTS, FORMAT_PACKAGES, PARTNERS, PLAN_STAGES, RECOMMENDED_PACKAGE, VENUES } from '@/offer/lib/content';
import { PACKAGE_NAMES } from '@/offer/lib/lead';

export const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://expocontact.uz';

const OFFER_LANG_NAMES = { en: 'English', ru: 'Russian', tr: 'Turkish', zh: 'Chinese', uz: 'Uzbek' };

export function stripHtml(s) {
  return typeof s === 'string'
    ? s.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    : '';
}

/** A markdown section. Null and false lines are dropped; empty strings stay as blank lines. */
function section(title, lines, level = 2) {
  const body = lines.filter((l) => l !== null && l !== undefined && l !== false);
  if (!body.some((l) => l !== '')) return null;
  return [`${'#'.repeat(level)} ${title}`, '', ...body].join('\n');
}

const link = (value) => (typeof value === 'string' && /^https?:\/\//.test(value) ? value : null);

/**
 * Contacts as the site shows them. Address and hours are translated, so the
 * English ones are used; phone, e-mail and links do not depend on language,
 * and for those the Russian settings win — they are the ones editors keep
 * up to date in /admin.
 */
function contactFrom(settings) {
  const ru = settings.ru.contact || {};
  const en = settings.en.contact || {};
  const merged = { ...ru, ...en };
  for (const key of ['phone', 'email', 'telegram', 'instagram']) if (ru[key]) merged[key] = ru[key];
  return merged;
}

export async function loadLlmsData() {
  const [contentRu, contentEn, contentUz, settingsRu, settingsEn, portfolio] = await Promise.all([
    readObject('content.ru'),
    readObject('content.en'),
    readObject('content.uz'),
    readObject('settings.ru'),
    readObject('settings.en'),
    readList('portfolio.en'),
  ]);
  const content = { ru: contentRu, en: contentEn, uz: contentUz };
  return {
    content,
    contact: contactFrom({ ru: settingsRu, en: settingsEn }),
    portfolio,
    offer: getDict('en'),
  };
}

// ── Shared pieces ───────────────────────────────────────────────────────────

const SUMMARY = [
  '> Exhibition contractor and local trade-show organising partner based in',
  '> Tashkent, Uzbekistan, operating since 2004. For exhibitors it designs,',
  '> builds, installs and dismantles stands, congress zones and national',
  '> pavilions across Central Asia and at shows abroad. For trade-show',
  '> organisers it runs a whole show in Uzbekistan under one contract:',
  '> permits, venue, pavilion build, promotion and a registered visitor flow.',
];

function keyFacts() {
  return [
    '- Headquarters and production: Tashkent, Uzbekistan (UTC+5).',
    '- In business since 2004; 5,000+ stands built; 500+ clients; 2,000 m² in-house production.',
    '- Works in Uzbekistan, across Central Asia (Kazakhstan, Kyrgyzstan, Tajikistan, Turkmenistan) and at international shows.',
    '- Two lines of business: exhibition stands for exhibitors, and organising partner for trade-show organisers entering Uzbekistan.',
    '- Site languages: Russian, English, Uzbek; the organiser page also in Turkish and Chinese.',
  ];
}

/** The main site's number first, then any other the organiser page lists. */
function phones(contact) {
  const digits = (v) => v.replace(/\D/g, '');
  const list = contact.phone ? [contact.phone] : [];
  for (const p of CONTACTS.phones) if (!list.some((x) => digits(x) === digits(p.display))) list.push(p.display);
  return list;
}

function contactLines(contact) {
  return [
    `- Phone: ${phones(contact).join(', ')}`,
    `- WhatsApp: ${CONTACTS.whatsapp}`,
    contact.email ? `- E-mail: ${contact.email}` : null,
    CONTACTS.email !== contact.email ? `- E-mail (organiser enquiries): ${CONTACTS.email}` : null,
    link(contact.telegram) ? `- Telegram: ${contact.telegram}` : null,
    link(contact.instagram) ? `- Instagram: ${contact.instagram}` : null,
    contact.address ? `- Address: ${stripHtml(contact.address)}` : null,
    contact.hours ? `- Hours: ${stripHtml(contact.hours)} (UTC+5)` : null,
    `- Website: ${SITE}`,
  ];
}

function mainPages() {
  return [
    `- [Home, English](${SITE}/en): services, portfolio, process, FAQ and a contact form`,
    `- [Home, Russian](${SITE}/ru): the same in Russian`,
    `- [Home, Uzbek](${SITE}/uz): the same in Uzbek`,
    `- [FAQ, English](${SITE}/en/faq): full answers on price, timing, materials and geography`,
    `- [FAQ, Russian](${SITE}/ru/faq)`,
    `- [FAQ, Uzbek](${SITE}/uz/faq)`,
  ];
}

function offerPages(offer) {
  return [
    `- [Organiser offer, English](${SITE}/offer/en): ${offer.meta.description}`,
    ...['ru', 'tr', 'zh', 'uz'].map((l) => `- [Organiser offer, ${OFFER_LANG_NAMES[l]}](${SITE}/offer/${l})`),
  ];
}

const packagesIncluded = (offer, rows) => offer.formats.rows.slice(0, rows);

function formatLines(offer) {
  return FORMAT_PACKAGES.map((p) => {
    const recommended = p.key === RECOMMENDED_PACKAGE ? ' (recommended)' : '';
    const included = packagesIncluded(offer, p.rows).join('; ');
    return `- **${PACKAGE_NAMES[p.key]}**${recommended} — ${offer.formats.taglines[p.tagline]}. Includes: ${included}.`;
  });
}

// ── /llms.txt ───────────────────────────────────────────────────────────────

export function llmsIndex({ content, contact, offer }) {
  const services = (content.en.services?.items || content.ru.services?.items || [])
    .map((s) => `- **${stripHtml(s.title)}** — ${stripHtml(s.short || s.full)}`);

  return [
    '# ExpoContact',
    '',
    ...SUMMARY,
    '',
    'Key facts:',
    '',
    ...keyFacts(),
    '',
    section('Contact', contactLines(contact)),
    '',
    section('Exhibition stands — for exhibitors', [
      ...services,
      '',
      ...mainPages(),
    ]),
    '',
    section('Trade-show organising in Uzbekistan — for organisers', [
      `${offer.hero.lead} Formats: ${FORMAT_PACKAGES.map((p) => PACKAGE_NAMES[p.key]).join(', ')}. ${offer.visitors.note}`,
      '',
      ...offerPages(offer),
    ]),
    '',
    section('Optional', [
      `- [Full text](${SITE}/llms-full.txt): every service, the complete organiser offer, the FAQ in three languages and selected projects in one file`,
    ]),
    '',
  ].filter((l) => l !== null).join('\n');
}

// ── /llms-full.txt ──────────────────────────────────────────────────────────

/** "−9" months → "9 months before opening"; under a month is told in weeks. */
function monthLabel(m) {
  if (m === 0) return 'opening';
  const abs = Math.abs(m);
  const amount = abs < 1 ? `${Math.round(abs * 4.3)} weeks` : `${abs} month${abs === 1 ? '' : 's'}`;
  return `${amount} ${m < 0 ? 'before' : 'after'} opening`;
}

function stageRange({ from, to }) {
  if (from < 0 && to < 0 && Math.abs(from) >= 1 && Math.abs(to) >= 1) {
    return `${-from}–${-to} months before opening`;
  }
  return `from ${monthLabel(from)} to ${monthLabel(to)}`;
}

function offerFull(offer) {
  const pairs = offer.problems.pairs.map((p) => `- ${p.problem} → ${p.solution}.`);
  return [
    `${offer.meta.description}`,
    '',
    section('What ExpoContact handles on the ground', offer.services.cards.map((c) => `- **${c.title}** — ${c.text}.`), 3),
    '',
    section('Risks of a new market and how they are removed', pairs, 3),
    '',
    section('One contract instead of five', [
      `Usually an organiser signs separately with: ${offer.contract.usual.join(', ')} (${offer.contract.usualCaption}).`,
      `With ExpoContact: ${offer.contract.with.join('; ')}.`,
    ], 3),
    '',
    section('Visitors: how the halls are filled', [
      ...offer.visitors.steps.map((s, i) => `${i + 1}. **${s.title}** — ${s.text}.`),
      '',
      offer.visitors.note,
    ], 3),
    '',
    section('Organiser report', [
      `${offer.report.receiveTitle}:`,
      '',
      ...offer.report.receive.map((r) => `- **${r.title}** — ${r.text}.`),
    ], 3),
    '',
    section('Launch plan', [
      ...offer.plan.stages.map((stage, i) => `- ${stage}: ${stageRange(PLAN_STAGES[i])}.`),
      '',
      offer.plan.note,
    ], 3),
    '',
    section('Formats', formatLines(offer), 3),
    '',
    section('Experience', [
      `${plainTitle(offer.experience.title)}.`,
      `Venues in Tashkent: ${VENUES.join(', ')}.`,
      `${offer.experience.partnersText}. Partners named on the page: ${PARTNERS.join(', ')}.`,
    ], 3),
    '',
    section('From the brief, before launch ExpoContact prepares', offer.contact.prepare.map((p) => `- ${p}`), 3),
    '',
    section('Organiser offer pages', offerPages(offer), 3),
  ];
}

export function llmsFull({ content, contact, portfolio, offer }) {
  const en = content.en;
  const services = (en.services?.items || content.ru.services?.items || [])
    .map((s) => `- **${stripHtml(s.title)}** — ${stripHtml(s.full || s.short)}`);
  const steps = (en.process?.steps || [])
    .map((s, i) => `${i + 1}. **${stripHtml(s.title)}**${s.duration ? ` (${stripHtml(s.duration)})` : ''} — ${stripHtml(s.desc)}`);
  const stats = (en.stats?.items || []).map((s) => `- ${s.value}${s.suffix || ''} ${stripHtml(s.label)}`);
  const faq = (lang) => (content[lang].faq?.items || [])
    .flatMap((f, i) => [i ? '' : null, `**${stripHtml(f.q)}**`, stripHtml(f.a)]);
  const cases = portfolio.slice(0, 20).map((p) => {
    const head = [stripHtml(p.client), stripHtml(p.exhibition), p.area ? `${p.area} m²` : null, p.year || null]
      .filter(Boolean).join(' · ');
    const text = stripHtml(p.description);
    return text ? `- ${head} — ${text}` : `- ${head}`;
  });

  return [
    '# ExpoContact — full reference',
    '',
    ...SUMMARY,
    '',
    `This file collects, in one place, what the public pages of ${SITE} say. The short index is ${SITE}/llms.txt.`,
    '',
    section('Key facts', [
      ...keyFacts(),
      ...(stats.length ? ['', 'As stated on the site:', '', ...stats] : []),
      en.about?.lead ? `\n${stripHtml(en.about.lead)}` : null,
    ]),
    '',
    section('Contact', contactLines(contact)),
    '',
    section('Exhibition stands — services', services),
    '',
    section('How a stand project runs', steps),
    '',
    section('Where it works', [
      'Home market: Uzbekistan — Tashkent, including the UzExpoCentre and CAEx venues.',
      'Region: Kazakhstan (Almaty, Astana), Kyrgyzstan, Tajikistan, Turkmenistan.',
      'International: exhibitions in the UAE, Germany, Russia and China, with production in Tashkent and freight and customs handled by the same contractor.',
    ]),
    '',
    section('Trade-show organising in Uzbekistan — for organisers', offerFull(offer)),
    '',
    section('Selected projects', cases),
    '',
    section('Frequently asked questions — English', faq('en')),
    '',
    section('Часто задаваемые вопросы — русский', faq('ru')),
    '',
    section('Koʻp beriladigan savollar — oʻzbekcha', faq('uz')),
    '',
    section('Who it is for', [
      '- A company that needs an exhibition stand, trade-show booth, congress zone or national pavilion built in Uzbekistan or elsewhere in Central Asia.',
      '- A company from the region going to a show abroad that wants design, production and logistics under one contract.',
      '- An organiser who needs a whole event branded: registration, navigation, stage, press wall and networking areas.',
      '- A trade-show organiser, often from abroad, launching or moving a show to Uzbekistan who needs a local partner for permits, venue, build and visitors.',
      '',
      'Not a fit: printing-only orders with no construction, and permanent retail interiors unrelated to exhibitions.',
    ]),
    '',
    section('Pages', [...mainPages(), ...offerPages(offer)]),
    '',
    `Last generated: ${new Date().toISOString().slice(0, 10)}`,
    '',
  ].flat().filter((l) => l !== null).join('\n');
}

export const TEXT_HEADERS = {
  'Content-Type': 'text/plain; charset=utf-8',
  'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
};
