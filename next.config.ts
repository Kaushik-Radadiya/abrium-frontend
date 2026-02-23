import type { NextConfig } from 'next';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ASYNC_STORAGE_ALIAS = '@react-native-async-storage/async-storage';

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'wagmi',
      '@tanstack/react-query',
      'framer-motion',
      '@dynamic-labs/sdk-react-core',
      '@dynamic-labs/ethereum',
    ],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      [ASYNC_STORAGE_ALIAS]: require.resolve('localforage'),
    };
    return config;
  },
  turbopack: {
    resolveAlias: {
      [ASYNC_STORAGE_ALIAS]: 'localforage',
    },
  },
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
