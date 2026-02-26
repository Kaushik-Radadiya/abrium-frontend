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

export const CHAIN_KEY_BY_ID: Record<number, string> = {
  1: 'ethereum',
  137: 'polygon',
  11155111: 'ethereum',
  80002: 'polygon',
  84532: 'base',
};

export function getChainKey(chainId: number) {
  return CHAIN_KEY_BY_ID[chainId] ?? '';
}
