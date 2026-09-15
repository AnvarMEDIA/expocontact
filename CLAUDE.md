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
- Branch inventory as of the merge above. `claude/expocontact-website-vGZXk` is
  the only live branch — build on it and deploy from it. These are fully
  contained in it and are dead; do not start work on them or deploy them:
  `claude/review-project-planning-xqBle`, `claude/project-review-ov8uju`,
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

## Daily digest to Telegram

`vercel.json` declares one cron: `GET /api/cron/digest` at `0 4 * * *` — 04:00
UTC, which is 09:00 in Tashkent, the start of the working day while there is
still time to act on what is overdue.

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

## SEO and AI discoverability

- Titles, descriptions, keywords and the social image come from
  `content/data/seo.{ru,en,uz}.json`, imported statically in
  `app/[locale]/layout.js`. Do not switch this back to reading the files with
  `fs` at request time: on Vercel those files are not in the bundle, the read
  silently returns `{}` and every SEO setting disappears from production.
- `layout.js` also emits one JSON-LD `@graph` (Organization/LocalBusiness with
  its service catalogue, WebSite, WebPage, FAQPage) built from the locale
  content, so FAQ and services edits flow into structured data automatically.
- `app/robots.js` explicitly allows AI crawlers (GPTBot, ClaudeBot,
  PerplexityBot, Google-Extended, ...).
- `/llms.txt` is generated by `app/llms.txt/route.js` from the live CMS
  content — services, FAQ, contacts and cases — so it never goes stale. There
  is no static file to maintain.
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

## Forms

- Both lead forms live in `components/HomePageClient.jsx` (the contact section
  and the modal) and are uncontrolled — they submit via `FormData`, so any new
  field needs a real `name` attribute.
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
  untracked. It is the only third-party counter on the site; Yandex.Metrika was
  removed in favour of the statistics below. The `yandex` verification string in
  the layout's metadata is Yandex **Webmaster** (search console) and has nothing
  to do with it — keep it.
- `lib/metaPixel.js` holds the id, the snippet and `trackLead()`;
  `components/MetaPixel.jsx` repeats `PageView` on client-side navigation.
  Most links on the site are plain anchors, which reload the page and are
  counted by the snippet — but the locale switcher uses `router.push()`, and
  that switch moves between two `[locale]` layout instances, so the component
  remounts. The last counted path therefore lives at module scope, not in a
  ref: a per-instance flag resets on that remount and swallows exactly the
  PageView it exists to send.
- `Lead` fires only after the API confirms the lead (`res.ok`), never on the
  button click, from all three forms: the ad landing, the contact section and
  the popup. `content_name` says which one. Counting clicks would teach the ad
  platform to find people who abandon forms.
- Conversions API is not connected, so there is no event deduplication and no
  `eventID` to send. If it is added later, the same id must be sent from both
  sides for each event.

## Environment

See `.env.example`. `ADMIN_PASSWORD` guards every admin and analytics endpoint
and falls back to `admin123` in code, so it must be set in production.
