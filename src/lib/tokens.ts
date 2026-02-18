import { SUPPORTED_CHAINS } from '@/lib/chains'

export type UiToken = {
  chainId: number
  address: `0x${string}` | 'native'
  symbol: string
  name: string
  decimals: number
  logoURI?: string
}

export const CURATED_TOKENS: UiToken[] = [
  {
    chainId: 1,
    address: 'native',
    symbol: 'ETH',
    name: 'Ether',
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
  },
  {
    chainId: 1,
    address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    logoURI: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png',
  },
  {
    chainId: 1,
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    symbol: 'USDT',
    name: 'Tether',
    decimals: 6,
    logoURI: 'https://assets.coingecko.com/coins/images/325/small/Tether.png',
  },
  {
    chainId: 137,
    address: 'native',
    symbol: 'MATIC',
    name: 'Polygon',
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/4713/small/polygon.png',
  },
  {
    chainId: 137,
    address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    symbol: 'USDC',
    name: 'USD Coin (PoS)',
    decimals: 6,
    logoURI: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png',
  },
  {
    chainId: 11155111,
    address: 'native',
    symbol: 'ETH',
    name: 'Sepolia Ether',
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
  },
  {
    chainId: 80002,
    address: 'native',
    symbol: 'POL',
    name: 'Amoy POL',
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/4713/small/polygon.png',
  },
  {
    chainId: 84532,
    address: 'native',
    symbol: 'ETH',
    name: 'Base Sepolia Ether',
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
  },
]

const ALLOWED_CHAIN_IDS = new Set(SUPPORTED_CHAINS.map((chain) => chain.id))

export function listTokensForChain(chainId: number) {
  if (!ALLOWED_CHAIN_IDS.has(chainId)) return []
  return CURATED_TOKENS.filter((token) => token.chainId === chainId)
}
