# ExpoContact

Next.js 14 (App Router) marketing site for an exhibition-stand contractor in
Tashkent. Three locales (`ru` default, `en`, `uz`) via `next-intl`. Deployed on
Vercel.

## Deployment

**Always deploy to production when work is finished.** Do not stop at pushing a
feature branch — merge it into the production branch and push, which triggers
the Vercel production build.

- Production branch: `claude/expocontact-website-vGZXk` (the repository default
  branch, and what Vercel builds for production).
- **Being the default branch does not mean it holds the newest work.** Feature
  work has lived on long-running `claude/*` branches that were only ever
  deployed as Vercel previews. Before building on or deploying any branch, run
  `git for-each-ref --sort=-committerdate refs/remotes/origin` and check that
  the branch you are on is not behind another one; otherwise you will ship a
  stale design. This has happened once already: the approved site sat on
  `claude/review-project-planning-xqBle`, 31 commits ahead of the default
  branch, and was merged into production only afterwards.
- Branch inventory as of October 2026, after the /offer landing was approved
  and fast-forwarded into production. `claude/expocontact-website-vGZXk` is
  the only live branch — build on it and deploy from it. These are fully
  contained in it and are dead; do not start work on them or deploy them:
  `claude/review-project-planning-xqBle`, `claude/project-review-ov8uju`
  (carried /offer as a preview until approval),
  `claude/dazzling-johnson-t53him`. One branch is NOT merged and is not dead:
  `claude/analyze-project-status-Gttja` carries a Hero refactor (fullscreen
  auto-playing 5-slide slider) that production does not have.
- Before deploying, run `npx next lint` and `npx next build`; both must pass.
- Never deploy with images or assets that resolve to 404. Verify remote assets
  actually exist first.

## Images

Site images live in the Vercel Blob store `expocontact-blob`, referenced by
absolute URL from `content/data/*.json`. `next.config.mjs` allows only the Blob
and Tilda CDN hosts, so any new image host has to be added there.

Store optimized derivatives, not camera/generator originals: roughly 1600x900
WebP for portfolio shots, 800x520 WebP for the service hover previews, 256x256
WebP for avatars, and a 1200x630 JPEG for the social preview. Render every image
through `next/image` with a `sizes` hint; a raw `<img>` makes the browser
download the full source. The two CSS `background-image` cases (portfolio bento
cards and service previews) are the exception — they cannot go through
`next/image`, which is why their sources are pre-sized and kept small.

Service pictures live in the CMS at `services.items[].image` in each locale
file, so they are editable in the admin under Тексты сайта. There are no
generated placeholder URLs anywhere: an item with no picture renders the card's
own dark surface. Do not reintroduce a random-image service such as picsum as a
fallback — it put unrelated stock photos on the front page.

## Content

- `content/{ru,en,uz}.json` — UI copy and the FAQ/services collections. All
  three files must keep the same key structure.
- `content/data/` — per-locale data: `portfolio.{ru,en,uz}.json`,
  `testimonials.{ru,en,uz}.json`, `settings.{ru,en,uz}.json` and
  `seo.{ru,en,uz}.json`, plus locale-independent `clients.json`. The three
  files of a set share ids and differ only in translated text, so a change to
  images or ids has to be applied to all three.
- Nothing reads these files directly at runtime. Everything goes through
  `lib/store.js`, which keeps the same JSON documents in Vercel Blob under
  `cms/` and falls back to the copies bundled by `lib/seed.js`. The repository
  files are the seed for a fresh deployment; once an editor saves, Blob wins.
- Never read content with `fs` in a route or component: on Vercel those files
  are not in the serverless bundle and the read fails silently. Import through
  `lib/seed.js` or read through `lib/store.js`.
- `/admin` writes through the same store and then calls `revalidatePath`, so an
  edit reaches the live site within a minute without a redeploy. Pages carry
  `export const revalidate = 60`.
- Contacts confirmed by the owner (October 2026): e-mail
  `info@expocontact.uz` and Instagram `https://instagram.com/expo.contact`.
  `hello@expocontact.uz` and `instagram.com/expocontact` are wrong and must
  not come back — not in the settings seeds, the JSON-LD in
  `app/[locale]/layout.js`, the form fallbacks or `offer/lib/content.ts`.
  A settings document already saved in Blob keeps whatever it holds, so a
  wrong value there is fixed in /admin, not in the repository.

## Two directions — exhibitors and organisers

Since October 2026 the site is one company with two lines of work, not a
stand-builder site plus a separate landing. `lib/directions.js` is the model
both halves share:

| Direction | Audience key | Who | Full page |
|---|---|---|---|
| Stands | `exhibitor` | a company taking part in a show | `/[locale]` (the home page) |
| Shows | `organiser` | a company bringing a trade show to Uzbekistan | `/offer/[lang]` |

- **The home page shows both.** Under the hero, a fork (`.dirs`) sends each
  audience to its part: `#services` for exhibitors, `#organizers` for
  organisers. `#organizers` is the organiser proposition in brief — title,
  six services, «один договор вместо пяти», visitor steps, the three formats —
  and links to `/offer/<locale>` for the plan, the full table and the report.
  The nav carries «Организаторам», the footer links `/offer/<locale>`.
- **One source for the organiser copy.** Everything in `#organizers` and the
  organiser fork card is read from the /offer dictionary of the same language
  by `offer/lib/teaser.ts`, on the server, in `app/[locale]/page.js`; the page
  receives one language as props. Never retype those texts on the main site —
  edit `offer/i18n/*.ts` and both pages change. Only the frame (nav label,
  fork cards, captions, button and form wording) lives in `lib/directions.js`,
  in code rather than `content/*.json`, because `content.ru` is already in
  Blob and a new key there would never reach the live Russian page.
- **Every lead says which direction it is for.** Both home-page forms carry
  an `AudienceSwitch` (radios named `audience`); the organiser section opens
  the popup in organiser mode (own heading, plus a «тема и даты» field). The
  API whitelists the value with `sanitizeAudience()` and stores
  `lead.audience`; `/offer` leads are `organiser`. Older leads have no field —
  read it through `leadAudience()`, which derives it from the source. Telegram
  heads an organiser lead from the home page «🌍 Заявка организатора выставки»
  and every main-site message carries «🧭 Направление». The admin leads list
  filters by direction, marks organisers, shows «Тип» in the card and exports
  an `audience` column. Meta `Lead` carries it as `content_category`.
- Structured data: the main layout's OfferCatalog lists the organiser service
  by the `@id` of the Service node on `/offer/<locale>` (`…/offer/ru#service`),
  so the graph reads as one organisation with two lines of work.
- The nav has six links now. Its grid is `auto 1fr auto` (with `1fr auto 1fr`
  the wider right block slid into the menu), links never wrap, the menu
  tightens at 1600 and 1366px and hides below 1280px — Uzbek sets the limit.
  The phone number collapses to its icon at 1440px.
- Main-site locales map to /offer languages one to one (ru, en, uz);
  `mainSiteHref()` sends Turkish and Chinese /offer visitors to `/en`.

## Storage map

| Data | Where it lives | Needed env |
|---|---|---|
| Site content, portfolio, testimonials, clients, settings, SEO | Vercel Blob `cms/` | `BLOB_READ_WRITE_TOKEN` |
| Uploaded images | Vercel Blob `uploads/` | `BLOB_READ_WRITE_TOKEN` |
| Leads (personal data) | Upstash Redis | any variable pair ending in `KV_REST_API_URL`+`KV_REST_API_TOKEN` (or `UPSTASH_REDIS_REST_URL`+`_TOKEN`) |
| Visitor statistics | Upstash Redis (`stats:*`) | the same Redis pair as leads |
| Lead notifications | Telegram | `TELEGRAM_BOT_TOKEN`+`TELEGRAM_CHAT_ID` |

Leads must never go into Blob: blobs are public to anyone holding the URL.
Without a Redis store on Vercel, lead writes throw and Telegram is the only
record — the admin dashboard shows this as a red row.

Telegram delivery goes through `lib/telegram.js` only: `sendTelegram(text)`
never throws and returns the Bot API reason on failure, and
`telegramDiagnose()` backs the «Проверить» button on the admin dashboard
(`POST /api/admin/telegram`) — it validates the token with `getMe`, the chat
with `getChat`, then sends a real test message, and turns Telegram's error
strings into the fix an editor needs. Having both env vars set is not proof of
delivery: a wrong chat id, a bot the owner never messaged, or a bot missing
from the group all pass the env check and fail the send. Keep messages plain
text (no `parse_mode`): visitor input with `*`, `_` or `[` would make Telegram
reject the whole message.

The Vercel Upstash integration prefixes the standard names with the store
label, so this project has `UPSTASH_REDIS_REST_KV_REST_API_URL` rather than the
documented `UPSTASH_REDIS_REST_URL`, and the retired Vercel KV store left bare
`KV_REST_API_*` variables behind that no longer resolve. `lib/leads.js`
therefore discovers credential pairs by suffix, tries prefixed pairs before
bare ones, and probes each with a read before using it — do not replace that
with hardcoded variable names. `leadsStatus()` reports which variable actually
answered, and is async because it performs that probe.

## CRM — projects

`/admin` → Проекты. An exhibition project is not a generic deal: the build-up
date does not move, so the whole plan is counted backwards from the day the
crew drives in. Three files, each testable on its own:

- `lib/kv.js` — the one connection to Redis, shared by leads and the CRM. The
  credential discovery described above lives here now; `lib/leads.js` is just
  the leads collection on top of it. Local development falls back to JSON files
  under `content/data/`, and `leads:all` keeps its historical path.
- `lib/crm/model.js` — pure rules, no I/O: the stages (the company's own
  seven-step process plus `done`/`lost`), `scheduleFromSetup()` which derives
  every deadline backwards from build-up, `planTasks()` (20-item checklist),
  `projectHealth()` (why a project needs attention today) and
  `sanitizeProject()`. Import it from anywhere — it has no React and no Node
  APIs.
- `lib/crm/store.js` — `crm:index` holds **only ids**, one document per project
  under `crm:project:<id>`. Do not denormalise summary fields into the index:
  it would have to be rewritten on every edit and the board would eventually
  disagree with the card. The list is one index read plus one `mget`.

Rules worth keeping:

- Dates are calendar strings `YYYY-MM-DD`, never timestamps — build-up on the
  5th is the 5th in Tashkent regardless of the viewer's timezone. `isDate()`
  checks the date really exists: a format-only check let `2026-13-99` through
  and every day count against it came back `NaN`.
- Moving `dates.setup` moves the plan: if the project has no tasks yet (one
  created from a lead has none, because a lead carries no dates) the checklist
  is generated; if it already has tasks, every open deadline shifts by the same
  number of days. Finished tasks keep their real dates.
- Money is per project, `UZS` or `USD`, and the dashboard reports currencies
  side by side — never summed into one number.
- A lead becomes a project from the lead card. Both records link to each other
  (`lead.projectId`, `project.leadId`) and the lead moves to «в работе».
- Projects are in the backup (`data.crm`), like leads. They hold personal data,
  so Redis only — never Blob.
- `lib/countries.js` is the single country list, shared by `PhoneField` and the
  CRM. A project stores `client.country` as the two-letter code, never the
  display name, so renaming a country cannot orphan old records.
- `money.method` is the payment method (`PAYMENT_METHODS` in the model).
  «Перечисление с НДС» is its own option because in Uzbekistan it changes the
  invoiced amount.
- Country and payment method follow the same rule: an empty string clears the
  field, anything unrecognised keeps what was stored, so a malformed payload
  cannot silently wipe a real value.
- `links.client` is a link to the client's own material (logos, brandbook),
  not an upload — it usually already lives in their Drive, and copying it here
  would only create a second version to keep in sync.
- `url()` in the model is what makes a link safe to render as an `href` in the
  admin: it accepts absolute http(s) and same-site paths such as the
  `/uploads/...` a local upload returns, and drops `javascript:`, `data:` and
  protocol-relative `//host`. Attachments go through it too.

### Money and the cashbook

- A payment records its own `method` and `currency`, not only the project's: a
  contract can say «перечисление» while the deposit came in cash, and the
  cashbook has to show where the money really landed. When `method` is omitted
  it falls back to the project's. `receivedBy` is who took it — the first
  question asked when a sum does not match the bank statement.
- `cashbook(range)` in the store (`GET /api/admin/crm?view=cash&range=…`)
  reports, per currency and never summed across them: `totals` received in the
  selected period, `byMethod` for that period, `allTime` received ever, and
  `owed` — what is still due on projects that are **not** closed. A lost
  project stops counting as money owed but keeps whatever it already paid.
- Payments predating the per-payment currency field fall back to the project's
  currency, so old records still add up correctly.
- The Касса screen fixes the currency order from `CURRENCIES`, so a figure does
  not jump between cards depending on which currency was seen first.

### Project files

- `POST /api/admin/crm/upload` stores attachments under `projects/` in Blob —
  deliberately not `uploads/`, which the site's media library lists. Quotes and
  contracts must never appear in the site's image picker.
- **Blob serves every object publicly to anyone holding the URL.** A quote
  carries prices and a client name, so the stored filename is random and
  reveals nothing, and the admin panel says plainly that the link is a secret.
  This is obscurity, not access control; real protection needs a private store
  with signed URLs.
- Allowed: pdf, doc(x), xls(x), ppt(x), png, jpg, webp, zip, rar, dwg, up to
  20 MB. HTML and executables are refused — an .html on our own origin would
  run with the site's privileges.
- Deleting an attachment unlinks it from the project and leaves the blob in
  place: an orphan costs storage, a wrong delete costs a quote.

## Scheduled Telegram messages

`vercel.json` declares two crons, both sending to the chat the leads go to:

| Cron | UTC | Tashkent | What |
|---|---|---|---|
| `/api/cron/digest` | `0 4 * * *` | 09:00 | what is burning in the projects |
| `/api/cron/stats` | `5 19 * * *` | 00:05 next day | yesterday's visitor numbers |

Cron schedules on Vercel are always UTC, so a Tashkent time is written five
hours earlier and the statistics run sits on the **previous** calendar day in
UTC — `5 19 * * *` fires at 00:05 Tashkent, when the day it reports has just
ended and nothing is still being counted into it. On the Hobby plan a cron is
only guaranteed to start within the hour of its slot, so treat the minute as a
wish, not a promise; both endpoints are safe to run late.

Both take the same authorisation and both are also wired to an «Отправить
сейчас» button on the admin dashboard (`?force=1`).

### The digest — what is burning

- Authorisation: Vercel attaches `Authorization: Bearer $CRON_SECRET` to
  scheduled calls **only when `CRON_SECRET` is set**. Without it the call
  carries no credentials and the endpoint refuses it — deliberately, since an
  open endpoint would let anyone spam the company chat. `ADMIN_PASSWORD` is
  also accepted, which is what the «Отправить сейчас» button in the dashboard
  uses (`?force=1`).
- `lib/crm/digest.js` builds the text and is pure, so the wording is tested
  without sending anything. It returns `null` when nothing is overdue, due
  today or at risk, and then **no message goes out**. A bot that reports "всё
  спокойно" every morning trains everyone to swipe it away, including on the
  morning it matters. The manual button is the exception: it always sends
  something, so pressing it proves delivery works.
- Only `risk`-level projects make the digest; `warn` would double the length of
  a message read on a phone between two site visits.
- `crm:digest:state` records the last run; a second scheduled call on the same
  day sends nothing (the scheduler can retry). The manual button ignores that
  guard.
- Messages are capped at 3800 characters and announce the truncation — Telegram
  rejects anything over 4096.
- Internal imports inside `lib/crm/` carry the `.js` extension so the modules
  can be run directly by Node in tests, not only through the bundler.

### The nightly statistics report

- `lib/analytics/report.js` builds the text and is pure, like the digest, so
  the wording is tested without sending anything. `GET /api/cron/stats` reads
  nine days in one call: the reported day, the one before it for the «ко
  вчера» comparison, and the seven that end on the reported day — the weekly
  line must not include today, which has barely started.
- **It always sends**, unlike the digest. The numbers are the message, and a
  day with no visits at all is the loudest thing it can report: that usually
  means the site or the counter stopped, so the text says so and suggests
  checking the site rather than staying silent.
- `stats:report:state` records the day already reported, so a retried run
  sends nothing; the manual button ignores that guard.
- The message is plain text and deliberately free of `*`, `_` and `[` — see
  the Telegram rules above.

## SEO and AI discoverability

- Titles, descriptions, keywords and the social image come from the
  `seo.{ru,en,uz}` documents, read through `lib/store.js` in
  `app/[locale]/layout.js` (Blob once an editor saves them in /admin → SEO,
  the `content/data/seo.*.json` seeds until then). Never read those files with
  `fs` at request time: on Vercel they are not in the bundle, the read
  silently returns `{}` and every SEO setting disappears from production.
- Titles stay within ~60 characters and descriptions within 160, keyword
  first, brand last; the `META` defaults in `layout.js` follow the same rule.
- The canonical host is `https://www.expocontact.uz` — the bare domain
  redirects to it. Every absolute URL (metadataBase, JSON-LD, sitemap, robots,
  llms texts, /offer) comes from `SITE_URL` in `lib/site.js`
  (`NEXT_PUBLIC_SITE_URL` overrides it). Canonicals and `og:url` pointing at
  the redirecting host made every page a redirect target in search consoles.
- Structured data is split by what is true where. The layout emits only what
  holds on every page: Organization/LocalBusiness with its service catalogue
  (built from the locale content, so services edits flow in) and WebSite.
  Each page describes itself: the home page a WebPage, `/faq` WebPage +
  BreadcrumbList + FAQPage. FAQPage lives on `/faq` only — the landing shows
  the same questions as an accordion, and marking them up twice is a
  duplicate. Shared nodes are linked by `@id` (`${SITE_URL}/#organization`,
  `/#website`, `/<locale>#webpage`).
- A page that sets `alternates` or `openGraph` replaces the layout's whole
  object, not single fields. `/lp` and `/new` set their own canonical (the
  layout's names the home page) and no hreflang; `/lp` also sets `og:url` and
  `og:title` from the resolved parent so ad previews do not show the home
  page, and keeps its image.
- An unknown first segment renders the 404 through the `[locale]` layout;
  `generateMetadata` returns `noindex` for it so it does not inherit the home
  page's canonical and hreflang.
- Performance of the home page is covered in its own section below
  («Home page performance»); most of it is also what keeps SEO healthy.
- Search-console ownership tags sit in `verification` of the same metadata:
  `yandex` (Yandex Webmaster) and `other['msvalidate.01']` (Bing Webmaster
  Tools — Next.js has no named field for Bing). Both consoles re-check
  periodically, and Bing says outright not to remove the tag once verification
  succeeds, so a metadata cleanup must leave them in place. They render only
  in the `[locale]` layout; a page that defines its own `verification` would
  replace the whole object, so do not add one.
- `app/robots.js` explicitly allows AI crawlers (GPTBot, ClaudeBot,
  PerplexityBot, Google-Extended, ...).
- `/llms.txt` (short index in the llmstxt.org shape) and `/llms-full.txt`
  (everything in one file) are built in `lib/llms.js` from the live CMS
  content and from the /offer dictionaries and data (`offer/i18n/en.ts`,
  `offer/lib/content.ts`), so they never go stale and both product lines —
  stands for exhibitors and the organiser offer — are covered. There is no
  static file to maintain. The formats table and the launch plan live in
  `offer/lib/content.ts` because the page and these texts both read them.
  Testimonials and the /offer dashboard's demo numbers are left out on
  purpose. Contacts: address and hours come from the English settings,
  phone, e-mail and links from the Russian ones (the ones editors maintain).
- `/[locale]/faq` renders every answer open, as plain server-rendered text with
  its own `FAQPage` schema. The landing keeps the accordion; assistants and
  search engines quote the full page. Add new indexable pages to `app/sitemap.js`.
- `/[locale]/new` is a draft landing and is `noindex`; remove that when it
  becomes the main page.
- Ground rules that are not negotiable: serve crawlers exactly what visitors
  see (no cloaking), never put instructions aimed at an AI model into page
  text, and never mark up ratings or reviews that did not come from real named
  customers. The current testimonials are placeholder content, which is why
  there is no `Review` or `AggregateRating` markup anywhere.

## Home page performance

Mobile Lighthouse on the production build: 95–98 on `/ru`, `/en`, `/uz`
(TBT ~10–50 ms, LCP ~2.3 s, CLS 0), 95 on `/faq` and `/lp`. It was 30 before
the October 2026 work. Each rule below cost real seconds on a phone:

- **Fonts** are self-hosted from `public/fonts/site/`, declared in
  `app/site-fonts.css` and preloaded by the locale layout from
  `lib/siteFonts.js` (Inter's Cyrillic only on `/ru`). All three files are
  generated by `scripts/build-site-fonts.py`: Google's own subsets cut to the
  weights in use (Inter 400–900, Space Grotesk and JetBrains Mono 400–700)
  and to the layout features text needs — 85 KB instead of 143 KB on a
  Russian page, same glyphs. A page that needs a weight outside those ranges
  means re-running the script with a wider range, not adding next/font back.
  Names carry a content hash and `next.config.mjs` serves the folder as
  immutable. Space Grotesk has no fallback face on purpose: Russian headings
  must fall through to Inter, not to a metric-matched Arial. Do not bring
  back Google Fonts stylesheets either — they blocked first paint for ~1 s.
- **Nothing on the landing may set React state per animation frame.** The hero
  progress bar was state updated from `requestAnimationFrame`, which
  re-rendered the whole landing sixty times a second for as long as the page
  was open. It is now a CSS animation keyed by slide (`animation-play-state`
  pauses it on hover), and the slide timer keeps the elapsed time across a
  pause. The headline swap is CSS too (`.hero__slide-out` / `.hero__slide-in`,
  same timing as framer-motion's `mode="wait"`), so the landing ships no
  framer-motion. The process section writes its percentage into the DOM
  through refs; only the step number is state.
- The first headline has no entrance animation: it is in the server HTML at
  full opacity. Starting it at `opacity: 0` was part of a 10 s mobile LCP.
- `body.landing-body` (palette, type) is set by an inline script in
  `app/[locale]/page.js` while the HTML is parsed; the body carries
  `suppressHydrationWarning` for it. Added from an effect, it restyled and
  relaid the entire page during hydration.
- The three.js logo (`HeroLogo3D`) starts on the first pointer, touch, wheel,
  scroll or key event, or 3 s after load, and fades in. three.js is imported
  through `components/heroLogoThree.js`, which names the dozen classes the
  logo uses — `import('three')` as a namespace shipped all of it (186 KB
  gzipped, now 144 KB). Pixel ratio is capped at 1.5.
- Background images below the fold — portfolio photos and the services'
  hover previews — carry `data-bg` and get their `background-image` from an
  IntersectionObserver 800 px ahead. As inline styles all of them downloaded
  with the page. A preview hidden on phones never intersects and is never
  fetched.
- `#clients`, `#faq`, `#contact` and the footer use `content-visibility: auto`
  (not `#process`: its scroll script measures the pin on every scroll). The
  `contain-intrinsic-size` values are content heights per breakpoint and only
  steer the scrollbar. An anchor jump aimed at placeholders overshot by
  ~550 px, so the first in-page link click (capture listener in
  `HomePageClient`) or a URL arriving with a `#hash` (the inline script) adds
  `.cv-off` to `<html>` before the browser scrolls.
- Local Lighthouse runs in this container sometimes delay the first frame by
  ~1 s for reasons outside the page (a trivial page does not show it), and in
  that mode everything loaded before the late paint counts towards LCP. Judge
  a change by several runs, and by the bytes and main-thread work before the
  first paint, not by one score.

## Forms

- Both lead forms live in `components/HomePageClient.jsx` (the contact section
  and the modal) and are uncontrolled — they submit via `FormData`, so any new
  field needs a real `name` attribute. Both post `audience` (see «Two
  directions»).
- **Every main-site form ends on `/<locale>/thanks`** — the contact section,
  the popup and `/lp`. Once the API answers ok, the form calls
  `rememberLead()` (`lib/leadHandoff.js`) and `window.location.assign()`s
  `thanksHref(locale, audience)`; an organiser lead adds `?for=organiser`.
  It must be a full page load, not `router.push()`: Google Ads matches the
  URL of a loaded page. The thank-you page is the conversion page — see
  «Conversions» below. A failed request stays on the form as before.
- `app/[locale]/thanks/page.js` is `noindex, nofollow`, has its own canonical
  and no hreflang, and is not in the sitemap. Its texts are reused, not new:
  the call-back promise from `contact.modalCallUs` (CMS), the organiser block
  from the /offer dictionary (`form.success*`, `contact.prepare`), contacts
  from `offer/lib/content.ts`; only the kicker and link labels live in
  `lib/directions.js` (`thanks`). The page sets `landing-body` like the home
  page and restores the system cursor, which that class hides.
- Phone input is `components/PhoneField.jsx`: a country dial-code selector plus
  the national number, assembled into one hidden `phone` input. The country is
  preselected from `/api/geo` (the Vercel edge geo header) and falls back to
  Uzbekistan; an explicit choice by the visitor is never overwritten by the
  late geo answer. Pasting a number that starts with a dial code moves the
  selector instead of doubling the prefix.
- `/api/geo` is its own endpoint precisely so the landing can stay ISR-cached;
  do not call `headers()` during page render just to read the country.
- `components/sections/*` are leftovers from the pre-merge design and are not
  rendered anywhere. Do not update them when changing the live site.

## Paid traffic landing

- `/[locale]/lp` (`app/[locale]/lp/page.js` + `components/AdLanding.jsx`) is the
  page ads point at. It has no navigation on purpose — one offer, one form — and
  is `noindex, nofollow` so it never competes with the real site in search.
  Keep it out of `app/sitemap.js`.
- Its copy lives in the component as defaults and is overridden field by field
  from `adLanding` in the locale content when that key exists. The defaults are
  not decoration: `content.ru` is already stored in Blob, so a key added to
  `content/ru.json` in the repository would never reach the live Russian page.
- The form is the page: centred, up to 900px wide, one step with seven
  questions (name, phone, company, exhibition, stand area, stand type, timing)
  plus a free-text brief. The three pill questions are defined once in
  `lib/leadFields.js`: the visitor sees their locale's label, the lead stores
  the stable key (`'24_50'`), and the admin, Telegram and CSV show the Russian
  wording through `qualifierValueLabel()`. Add or reword options there, never
  in the component, and never rename a stored key — old leads carry it.
- The API runs the answers through `sanitizeDetails()`: unknown questions and
  answers that are not one of the offered options are dropped, not stored.
- The page's CSS is a string constant injected with `dangerouslySetInnerHTML`.
  Do not turn it back into a JSX text child of `<style>`: React escapes
  quotes, apostrophes and angle brackets in text, the browser does not decode
  entities inside a style element, and the mismatch fails hydration for the
  whole page. This bit twice (an apostrophe in a comment, then `content:""`).
- `landing.css` sets `cursor:none` on every `button` for the main page's custom
  cursor, which this page does not render; the page restores `cursor:pointer`
  on its links, buttons and pills in its own style block.
- Attribution: `components/useMarketing.js` reads `utm_source`, `utm_medium`,
  `utm_campaign`, `utm_content`, `utm_term` and the platform click ids
  (`gclid`, `yclid`, `fbclid`, `ttclid`, `msclkid`, `twclid`) off the landing
  URL, keeps them in `sessionStorage` for the rest of the visit, and hands them
  to whichever form is submitted — the ad page and both forms on the main site.
- `lib/marketing.js` holds the shared constants plus `sanitizeMarketing()`,
  which whitelists and length-bounds the values server-side. Never store what
  the browser posted without it: these strings reach Telegram, the admin panel
  and CSV exports.
- A lead carries the result as `lead.marketing`. It shows in the admin lead
  card under «Откуда пришёл лид» and as `utm_*` columns in the CSV export.
- Ad-platform reporting is the Meta Pixel `Lead` event (below) plus our own
  Статистика screen, which breaks leads down by campaign. There is no
  Yandex.Metrika goal any more — the counter was removed entirely.

## /offer — landing for foreign organisers

`/offer/{ru,en,tr,zh,uz}` sells ExpoContact as the local organising partner
for trade shows in Uzbekistan — the full page of the organiser direction
(see «Two directions»; the home page carries its summary). It keeps its own
layout, languages and look, under these rules:

- **One way back to the main site, nothing more.** Own layout and `<html>`
  (`app/offer/[lang]/`), no shared header or footer, and the header keeps no
  link out — the page has one goal, the enquiry. Since the two directions were
  joined (see «Two directions» above), the site address in the contacts and a
  «Выставочные стенды для экспонентов» line in the footer (`footer.mainSite`)
  link the main site through `mainSiteHref(lang)`. The logo still scrolls to
  the top. Other hrefs allowed: in-page anchors, `/offer/<lang>`, `tel:`,
  `mailto:`, `wa.me` and `t.me`.
- Its five languages exist only under `offer/i18n/`. `middleware.js` returns
  early for `/offer` so next-intl's ru/en/uz routing never sees it — without
  that it redirected to `/ru/offer`. Turkish and Chinese must not appear in
  the main site's routing or switcher. `GET /offer` (`app/offer/route.ts`) is a
  307 by Accept-Language, English by default, **keeping the query string** —
  ads point there with utm tags.
- Dictionaries are TypeScript. `ru.ts` is the master; the others are typed
  against it, so a missing key, an extra key or a list of the wrong length is
  a compile error (`offer/i18n/types.ts`). In headings `[brackets]` mark the
  orange accent (each language puts it where its word order needs), `\n` is a
  line break, `{name}` a placeholder. `offer/i18n/TRANSLATIONS_REVIEW.md` is
  generated by `node offer/scripts/translations-review.mjs`.
- TypeScript was added for this landing: `tsconfig.json` replaced
  `jsconfig.json` and carries the same `@/*` alias. The rest of the project is
  still JavaScript (`allowJs`, `checkJs: false`).
- **Every size is in rem, never px** (media queries aside). The root font
  size in `offer/styles/base.module.css` is the browser's own up to 1600px —
  the designed and tested layout — and grows past it
  (`clamp(100%, 0.25rem + 0.75vw, 250%)`: 18.4px at 1920, 23.2px at 2560,
  32.8px at 3840), so Full HD, 2K and 4K show the same composition larger
  instead of a 1240px column in the middle of the screen. A px value added
  later will not scale; JavaScript that needs a size reads the header's real
  height or the root font size (see `OneContract.tsx`). Icons carrying
  `width="24"` are sized to 1.5rem by a zero-specificity rule. Careful with
  `0px` inside `calc()`/`var()` fallbacks: a bare `0` there invalidates the
  whole declaration.
- Styles are CSS Modules under `offer/`. The only global rules
  (`app/offer/[lang]/offer-motion.css`, `offer-fonts.css`) hang off the
  `of-js` / `of-root` / `of-zh` classes that exist on these pages alone.
  `next lint` does not look into `offer/` by default — run it with
  `--dir offer --dir app`.

The enquiry:

- Same pipeline as every form: `POST /api/contact` with `source: 'offer'`,
  which branches early to `organiserEnquiry()`; every other source takes the
  original path unchanged. Validation is `validateOrganiser()` in
  `offer/lib/lead.ts`, shared by the form and the route. Answers are stored as
  keys (`5000_10000`, `full_house`) and shown in Russian in Telegram.
- The lead is a normal lead plus `lead.organiser` (e-mail, country, dates,
  area, format, consent and its time). Its `message` holds the same answers as
  readable Russian lines, so the admin card and CSV need no changes.
- Telegram gets its own message, headed `🌍 OFFER / ORGANISER LEAD`, with the
  page language, all five utm tags, referrer and Tashkent time.
- **Short form.** Only name and phone/WhatsApp are required; the show's theme
  is a third, optional field. Company, country, e-mail, dates, area, format
  and message sit behind «Добавить детали» and are optional — the long form
  (six required fields and a checkbox) cost too much per lead, and the team
  asks the rest when it calls back. `REQUIRED_FIELDS` / `DETAIL_FIELDS` in
  `offer/lib/lead.ts`; an optional field that is filled is still validated.
  A format chosen in the formats table shows as a chip while details are
  folded; a draft with details, or an error in one, unfolds them.
- Consent is the notice under the button («Отправляя заявку, вы соглашаетесь
  с политикой конфиденциальности»), as on the main site's forms; the form
  sends `consent: true` and the API still requires it.
- Without a country, Telegram and the lead summary name it from the phone's
  dial code (`countriesByPhone()`, longest code first; +7 and +1 list every
  country that shares them).
- GA4 `lead_submit` carries `form: "short" | "detailed"`, so the two paths can
  be compared.
- Honeypot field `website`: when filled the API answers `{ok: true}` and
  stores and sends nothing. A phone field holding only the prefilled dial code
  counts as empty.
- Meta `Lead` (`content_name: 'offer'`), GA4 `lead_submit` and the optional
  Ads / LinkedIn conversions fire only after the server confirms. GA4, Google
  Ads and LinkedIn load only when their `NEXT_PUBLIC_*` id is set
  (`.env.example`); click events come from `data-track` attributes.

Motion and performance:

- Reveals: sections mark elements `data-reveal`; one observer
  (`RevealObserver`) sets `data-in`. Content is hidden only under `.of-js`,
  which the head script sets before paint and removes again after 4 s if the
  scripts never start, so a failed bundle cannot leave the page blank.
  `prefers-reduced-motion` shows everything at once.
- Only transform and opacity animate. «Один договор» is scroll-linked with a
  plain passive scroll listener (no framer-motion on /offer any more), and
  progress goes into CSS variables, so React does not re-render. Unpinned on
  desktop it played out in three wheel clicks, and visitors reported the
  block «disappearing on scroll». So where it fits the scene is **pinned**:
  the script sets `data-pin` to `block` (heading + stage) or `stage` (short
  screens), and a spacer gives ~80vh of scroll during which only the scene
  moves. On phones (stacked, taller than the screen) nothing is pinned and the
  scene is timed by the ExpoContact card coming up from below. Without
  JavaScript or with reduced motion there is no pin and no spacer.
- The blocks fly *over* the card into its badge (`.usual` sits above `.with`);
  underneath it they slid under its edge and seemed to vanish. Dashed outlines
  stay where they were, so the left panel does not end up looking empty.
- Largest Contentful Paint is the hero headline. Two things broke it and must
  not come back: an entrance animation starting at `opacity: 0` (Chrome does
  not count a fully transparent first paint — it starts at 0.01), and a
  counter that hid its number until hydration or swapped its text node when
  counting began (`CountUp` keeps the same two elements throughout).
- Fonts: Onest through `next/font/google`. Chinese is Noto Sans SC **subset**
  to the dictionary's characters (`node offer/scripts/build-zh-font.mjs` —
  re-run after editing `zh.ts`), served from `public/fonts/` and preloaded on
  `/offer/zh` only. The full Noto Sans SC through next/font put 187 KB of
  render-blocking CSS on every language and ~900 KB of slices on zh.
- Measured on the production build with mobile Lighthouse: performance 93–98
  across the five languages, accessibility and SEO 100.
- Small orange text uses `--orange-ink` on light and `--orange-glow` on dark
  backgrounds, and orange buttons carry navy text: the brand orange is 3.2:1 on
  white and fails AA below heading size.
- Uzbek is the longest language and sets the limits. The full header bar
  needs 1280px («Tashrif buyuruvchilar», «Koʻrgazmani muhokama qilish»);
  below that the burger carries sections and languages, and header items never
  wrap. On phones the hero H1 is sized by viewport width so its longest
  unbreakable piece («Koʻrgazmangiz —», 312px at 40px) fits a 320px screen,
  and button labels wrap inside the button. After any text change, check every
  language from 320 to 1920px — a long word that fits in Russian may not.
- SEO: `meta.title` stays within ~60 characters and `meta.description`
  within 160 — longer ones were cut off in search results. Structured data is
  one `@graph` per language from `offer/lib/schema.ts`: Organization (same
  `@id` as the main site's, `https://expocontact.uz/#organization`),
  WebPage, Service with the three formats as an OfferCatalog, and FAQPage.
- The FAQ section (`offer/sections/Faq.tsx`, `faq` in the dictionaries)
  answers only from what the page already says — plan months, venues,
  formats, visitor steps, the report. Do not add answers with new promises
  (prices, deadlines, guarantees) that the page does not make. Answers sit in
  native `<details>`, so the full text is in the HTML, and FAQPage is built
  from the same strings: what the markup says is what the visitor sees.
- `/llms.txt` lists each /offer language with its own description and links
  the FAQ; `/llms-full.txt` carries the organiser FAQ in all five languages.
- Open Graph images (`opengraph-image.tsx`, next/og) cannot use opacity on SVG
  strokes and must uppercase text with `toLocaleUpperCase(lang)` (Turkish
  `i → İ`), not CSS. Their font is subset to the exact characters drawn, so
  uppercase text must be passed to the subset in uppercase — otherwise the
  missing capitals fall back to the heavy weight.
- The portfolio images in Blob are generated, not photos of real stands, so
  the landing shows none. Use real photos only.

Design tokens and interaction rules:

- Shadows come from three levels in `offer/styles/base.module.css`:
  `--elev-1` (chips, tabs, small round buttons), `--elev-2` (cards,
  dropdowns), `--elev-3` (dashboard, ExpoContact card, form, dialog). Do not
  add a one-off `box-shadow`; pick a level. Durations are `--dur-fast` (0.2s),
  `--dur-base` (0.35s) and `--dur-slow` (0.6s): things arrive at base and leave
  at fast with `--ease-in` (the mobile CTA bar).
- The two scrolling rows in «Опыт» have a visible pause button
  (`MotionToggle`, WCAG 2.2.2) and stop on their own off screen. A phone has
  no hover, so pausing on hover alone is not enough. Under reduced motion the
  rows are static and the button is hidden.
- The form, on a failed submit, puts an error summary at the top, one link per
  problem, and moves focus to it; the error under each field stays. Before a
  submit, a field is checked only when the visitor leaves it with something
  typed in — never «required» for a box they have not reached. Country text
  that names no country is reported on leaving the box.
- The form keeps a draft in `sessionStorage` (`offer-form-draft`): this tab
  only, never the honeypot, removed once the enquiry is sent. It is restored after mount so server and client render agree.
- Over the hero the header CTA is an outline, so it does not compete with the
  hero's own orange button; it fills in once the header turns solid.
- `color-scheme: only light` in the viewport keeps Chrome's automatic dark
  mode on Android from inverting the palette.
- On phones `scroll-padding-bottom: 96px` keeps a focused element above the
  sticky CTA bar.

## Visitor statistics

`/admin` → Статистика. The site counts its own visitors; there is no external
account to keep access to, and the numbers survive a lost password to somebody
else's dashboard. Two modules, both testable on their own:

- `lib/analytics/model.js` — pure classification, no I/O: `parseDevice()`,
  `isBot()`, and `classifySource()`, which turns a referrer plus utm tags into
  `{source, channel, campaign}` over the channels ads / campaign / search /
  social / referral / direct. Also the field-name codec: a day is one Redis hash
  whose fields are prefixed (`p:` page, `s:` source, `ch:` channel, `c:`
  campaign, `d:` device, `b:` browser, `l:` locale, `g:` country, `h:` hour).
  `explodeDay()` matches the longest prefix first — otherwise `ch:` is read as
  `c:` and every channel lands in the campaign list.
- `lib/analytics/store.js` — the counters. `stats:d:<date>` is that hash,
  `stats:u:<date>` the set of visitor hashes, `stats:on:<minute>` a set with a
  six-minute TTL that «сейчас на сайте» is read from. Days keep 400 days.

Rules worth keeping:

- **Nothing identifying is stored.** A visitor is a 16-character hash of
  IP + user agent + a salt derived from the date, so the same person is a
  different hash tomorrow and no visit can be linked across days. The IP and the
  user agent are read from the request headers and thrown away; they never reach
  Redis. `ANALYTICS_SALT` sets the secret; without it `ADMIN_PASSWORD` is used.
- `beat: true` means «the tab is still open», not a page view. The tracker sends
  one real view on mount and a heartbeat every 60 seconds, and a heartbeat only
  touches the online set. Counting them as views would have tripled the numbers
  of anyone who leaves a tab open.
- `POST /api/analytics/track` is public and **always answers 200**: a tracker
  must never break a page, and a browser retrying a failed beacon double-counts.
  `GET /api/analytics/stats` needs `ADMIN_PASSWORD`.
- Crawlers are dropped by `isBot()` before anything is written — including
  GPTBot and ClaudeBot, which `app/robots.js` deliberately lets in.
- Leads are counted server-side in `app/api/contact/route.js` (`recordLead()`),
  not in the browser, so the conversion rate cannot be inflated by a form that
  never reached us.
- The screen before this one wrote JSON to `content/data/analytics.json` with
  `fs`. On Vercel that write fails silently, so it had been collecting nothing
  in production — the same trap as the CMS and the SEO files. Everything here
  goes through `lib/kv.js`.

## Advertising pixels

- The Meta Pixel (ExpoContact Pixel, id 2224423588452859) loads from
  `app/[locale]/layout.js`. `/admin` has its own layout and is deliberately
  untracked. The only other third-party tag is the Google tag, and only once
  `NEXT_PUBLIC_GADS_ID` (or `NEXT_PUBLIC_GA4_ID`) is set — see «Conversions».
  Yandex.Metrika was removed in favour of our own statistics. The `yandex`
  verification string in the layout's metadata is Yandex **Webmaster** (search
  console) and has nothing to do with it — keep it.
- The snippet defines the `fbq` queue at once but fetches `fbevents.js` (~100 KB
  plus a config file) on the first interaction or 3 s after load. Queued
  calls — the first PageView, any Lead — are sent when it runs; a visitor who
  leaves within 3 s without touching the page is not counted. The pages ads
  point at (`/<locale>/lp`, `/offer`) and the thank-you page load it
  immediately — `LOAD_AT_ONCE` in `lib/metaPixel.js`, shared with the Google
  tag.
- The `<noscript>` pixel is raw HTML (`dangerouslySetInnerHTML`) in both
  layouts. As a JSX `<img>`, React hoisted it into `<link rel="preload"
  as="image">`, so every browser fetched `facebook.com/tr?…&noscript=1` — a
  second, cookieless PageView per visit.
- `lib/metaPixel.js` holds the id, the snippet and `trackLead()`;
  `components/MetaPixel.jsx` repeats `PageView` on client-side navigation.
  Most links on the site are plain anchors, which reload the page and are
  counted by the snippet — but the locale switcher uses `router.push()`, and
  that switch moves between two `[locale]` layout instances, so the component
  remounts. The last counted path therefore lives at module scope, not in a
  ref: a per-instance flag resets on that remount and swallows exactly the
  PageView it exists to send.
- `Lead` fires only for a lead the API confirmed (`res.ok`), never on the
  button click, for all three main-site forms: the ad landing, the contact
  section and the popup. `content_name` says which one, `content_category`
  the direction. Counting clicks would teach the ad platform to find people
  who abandon forms. It is sent by `<LeadConfirmed>` on the thank-you page,
  from the one-shot handoff in sessionStorage — not by the form, whose page is
  unloading — so a reload or a direct visit to `/thanks` sends nothing. /offer
  keeps its inline success and fires its events in the form (`offer/lib/track.ts`).

### Conversions — Google Ads

- `lib/googleTag.js` renders the Google tag from `app/[locale]/layout.js`
  when `NEXT_PUBLIC_GADS_ID` and/or `NEXT_PUBLIC_GA4_ID` is set (Vercel env,
  then redeploy — the values are inlined at build time). Without them nothing
  is rendered. Like the pixel, the `gtag` queue exists at once and gtag.js is
  fetched on the first interaction or 3 s after load, at once on
  `LOAD_AT_ONCE` pages. /offer has its own copy of the tag
  (`offer/components/Trackers.tsx`) on the same variables.
- Two ways to count a lead in Google Ads; an account uses **one** of them as
  primary, or every lead counts twice:
  1. by URL — the conversion action «Контакты → URL страницы»:
     `https://www.expocontact.uz/ru/thanks`, then in the action's settings
     «URL содержит» `/thanks` so en and uz count too, counting «Одна».
     Needs only the tag. Its weakness is that any visit to the URL counts.
  2. by event — `NEXT_PUBLIC_GADS_LEAD_LABEL`, and `trackGoogleLead()` on the
     thank-you page sends `conversion` to `AW-…/label` only after a confirmed
     submit. More exact; /offer's form sends the same event.
- Conversions API is not connected, so there is no event deduplication and no
  `eventID` to send. If it is added later, the same id must be sent from both
  sides for each event.

## Environment

See `.env.example`. `ADMIN_PASSWORD` guards every admin and analytics endpoint
and falls back to `admin123` in code, so it must be set in production.
