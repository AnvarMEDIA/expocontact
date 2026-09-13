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
WebP for portfolio shots, 256x256 WebP for avatars, and a 1200x630 JPEG for the
social preview. Render every image through `next/image` with a `sizes` hint;
a raw `<img>` makes the browser download the full source.

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
| Visitor analytics | Yandex Metrika API | `YANDEX_METRIKA_TOKEN` |
| Lead notifications | Telegram | `TELEGRAM_BOT_TOKEN`+`TELEGRAM_CHAT_ID` |

Leads must never go into Blob: blobs are public to anyone holding the URL.
Without a Redis store on Vercel, lead writes throw and Telegram is the only
record — the admin dashboard shows this as a red row.

The Vercel Upstash integration prefixes the standard names with the store
label, so this project has `UPSTASH_REDIS_REST_KV_REST_API_URL` rather than the
documented `UPSTASH_REDIS_REST_URL`, and the retired Vercel KV store left bare
`KV_REST_API_*` variables behind that no longer resolve. `lib/leads.js`
therefore discovers credential pairs by suffix, tries prefixed pairs before
bare ones, and probes each with a read before using it — do not replace that
with hardcoded variable names. `leadsStatus()` reports which variable actually
answered, and is async because it performs that probe.

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

## Environment

See `.env.example`. `ADMIN_PASSWORD` guards every admin and analytics endpoint
and falls back to `admin123` in code, so it must be set in production.
