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
};

export default withNextIntl(nextConfig);
