import { NETWORK_SCOPE } from '@/lib/runtimeEnv';

export type SupportedChain = {
  id: number;
  name: string;
  rpcUrls: string[];
  explorerUrl: string;
  nativeSymbol: string;
  scope: 'production' | 'development';
};

const ALL_SUPPORTED_CHAINS: SupportedChain[] = [
  {
    id: 1,
    name: 'Ethereum',
    rpcUrls: [
      process.env.NEXT_PUBLIC_RPC_ETH_MAINNET ??
        'https://ethereum-rpc.publicnode.com',
      'https://eth-mainnet.public.blastapi.io',
    ],
    explorerUrl: 'https://etherscan.io',
    nativeSymbol: 'ETH',
    scope: 'production',
  },
  {
    id: 137,
    name: 'Polygon',
    rpcUrls: [
      process.env.NEXT_PUBLIC_RPC_POLYGON ??
        'https://polygon-bor-rpc.publicnode.com',
      'https://polygon-rpc.com',
    ],
    explorerUrl: 'https://polygonscan.com',
    nativeSymbol: 'MATIC',
    scope: 'production',
  },
  {
    id: 11155111,
    name: 'Sepolia',
    rpcUrls: [
      process.env.NEXT_PUBLIC_RPC_SEPOLIA ??
        'https://ethereum-sepolia-rpc.publicnode.com',
    ],
    explorerUrl: 'https://sepolia.etherscan.io',
    nativeSymbol: 'ETH',
    scope: 'development',
  },
  {
    id: 80002,
    name: 'Polygon Amoy',
    rpcUrls: [
      process.env.NEXT_PUBLIC_RPC_POLYGON_AMOY ??
        'https://rpc-amoy.polygon.technology',
    ],
    explorerUrl: 'https://amoy.polygonscan.com',
    nativeSymbol: 'POL',
    scope: 'development',
  },
  {
    id: 8453,
    name: 'Base',
    rpcUrls: [
      process.env.NEXT_PUBLIC_RPC_BASE ?? 'https://mainnet.base.org',
      'https://base-rpc.publicnode.com',
    ],
    explorerUrl: 'https://basescan.org',
    nativeSymbol: 'ETH',
    scope: 'production',
  },
  {
    id: 84532,
    name: 'Base Sepolia',
    rpcUrls: [
      process.env.NEXT_PUBLIC_RPC_BASE_SEPOLIA ?? 'https://sepolia.base.org',
      'https://base-sepolia-rpc.publicnode.com',
    ],
    explorerUrl: 'https://sepolia.basescan.org',
    nativeSymbol: 'ETH',
    scope: 'development',
  },
];

export const SUPPORTED_CHAINS: SupportedChain[] = ALL_SUPPORTED_CHAINS.filter(
  (chain) => chain.scope === NETWORK_SCOPE,
);

export const DEFAULT_CHAIN_ID = SUPPORTED_CHAINS[0]?.id ?? 1;

export function getChain(chainId: number) {
  return SUPPORTED_CHAINS.find((chain) => chain.id === chainId);
}

// Mirrors the backend CHAIN_LIST in src/config/goPlusChains.ts.
// Used as a fallback when the catalog API doesn't return a chainKey.
// Keys must match the Stargate icon CDN network slugs.
export const CHAIN_KEY_BY_ID: Record<number, string> = {
  // Production static chains
  1:       'ethereum',
  137:     'polygon',
  8453:    'base',
  // Development static chains
  11155111: 'ethereum',
  80002:   'polygon',
  84532:   'base',
  // Full GoPlus / catalog chain list
  56:      'bsc',
  42161:   'arbitrum',
  324:     'zksync',
  59144:   'linea',
  534352:  'scroll',
  10:      'optimism',
  43114:   'avalanche',
  250:     'fantom',
  25:      'cronos',
  66:      'okc',
  128:     'heco',
  100:     'gnosis',
  321:     'kcc',
  5000:    'mantle',
  204:     'opbnb',
  42766:   'zkfair',
  81457:   'blast',
  169:     'manta',
  80094:   'berachain',
  2741:    'abstract',
  177:     'hashkey',
  146:     'sonic',
  1514:    'story',
  130:     'unichain',
  480:     'worldchain',
  1868:    'soneium',
  48900:   'zircuit',
  143:     'monad',
};

export function getChainKey(chainId: number) {
  return CHAIN_KEY_BY_ID[chainId] ?? '';
}
