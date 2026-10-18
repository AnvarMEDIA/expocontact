import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.js');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Only allow the hosts we actually serve images from (logos on Tilda CDN,
    // uploaded/seed images on Vercel Blob). Avoids turning the image optimizer
    // into an open proxy for arbitrary remote hosts.
    remotePatterns: [
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
      { protocol: 'https', hostname: 'static.tildacdn.one' },
      { protocol: 'https', hostname: 'static.tildacdn.com' },
    ],
  },
  // The main site's fonts (scripts/build-site-fonts.py) carry a content hash
  // in their names, so a browser may keep them for good. Without this, files
  // in public/ are revalidated on every visit.
  async headers() {
    return [{
      source: '/fonts/site/:file*',
      headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
    }];
  },
};

export default withNextIntl(nextConfig);
