import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@react-native-async-storage/async-storage':
        require.resolve('localforage'),
    };
    return config;
  },
  turbopack: {},
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
