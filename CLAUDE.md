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
- `content/data/*.json` — portfolio, testimonials, clients.
- `/admin` edits these files through `app/api/admin`, which writes to disk.
  That works locally but not on Vercel, where the filesystem is read-only.

## Environment

See `.env.example`. `ADMIN_PASSWORD` guards every admin and analytics endpoint
and falls back to `admin123` in code, so it must be set in production.
