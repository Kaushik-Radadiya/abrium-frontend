import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactCompiler: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'icons-ckg.pages.dev' },
      { protocol: 'https', hostname: 'assets.coingecko.com' },
      { protocol: 'https', hostname: 'iconic.dynamic-static-assets.com' },
    ],
  },
};

export default nextConfig;
