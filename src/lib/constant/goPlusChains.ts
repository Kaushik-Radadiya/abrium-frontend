/**
 * Single source of truth for all GoPlus-supported chains.
 * Every chain-related lookup in the app derives from this config.
 */
export type ChainConfig = {
  id: number;
  name: string;
  /** CoinGecko asset platform slug (token price lookups) */
  coingeckoPlatform: string | null;
  /** CoinGecko coin IDs for the native token */
  nativeCoinIds: string[];
  /** GeckoTerminal network slug (token image lookups) */
  geckoTerminalNetwork: string | null;
};

const CHAIN_LIST: ChainConfig[] = [
  {
    id: 1,
    name: 'Ethereum',
    coingeckoPlatform: 'ethereum',
    nativeCoinIds: ['ethereum'],
    geckoTerminalNetwork: 'eth',
  },
  {
    id: 56,
    name: 'BSC',
    coingeckoPlatform: 'binance-smart-chain',
    nativeCoinIds: ['binancecoin'],
    geckoTerminalNetwork: 'bsc',
  },
  {
    id: 42161,
    name: 'Arbitrum',
    coingeckoPlatform: 'arbitrum-one',
    nativeCoinIds: ['ethereum'],
    geckoTerminalNetwork: 'arbitrum',
  },
  {
    id: 137,
    name: 'Polygon',
    coingeckoPlatform: 'polygon-pos',
    nativeCoinIds: ['polygon-ecosystem-token', 'matic-network'],
    geckoTerminalNetwork: 'polygon_pos',
  },
  {
    id: 324,
    name: 'zkSync Era',
    coingeckoPlatform: 'zksync',
    nativeCoinIds: ['ethereum'],
    geckoTerminalNetwork: 'zksync',
  },
  {
    id: 59144,
    name: 'Linea',
    coingeckoPlatform: 'linea',
    nativeCoinIds: ['ethereum'],
    geckoTerminalNetwork: 'linea',
  },
  {
    id: 8453,
    name: 'Base',
    coingeckoPlatform: 'base',
    nativeCoinIds: ['ethereum'],
    geckoTerminalNetwork: 'base',
  },
  {
    id: 534352,
    name: 'Scroll',
    coingeckoPlatform: 'scroll',
    nativeCoinIds: ['ethereum'],
    geckoTerminalNetwork: 'scroll',
  },
  {
    id: 10,
    name: 'Optimism',
    coingeckoPlatform: 'optimistic-ethereum',
    nativeCoinIds: ['ethereum'],
    geckoTerminalNetwork: 'optimism',
  },
  {
    id: 43114,
    name: 'Avalanche',
    coingeckoPlatform: 'avalanche',
    nativeCoinIds: ['avalanche-2'],
    geckoTerminalNetwork: 'avax',
  },
  {
    id: 250,
    name: 'Fantom',
    coingeckoPlatform: 'fantom',
    nativeCoinIds: ['fantom'],
    geckoTerminalNetwork: 'fantom',
  },
  {
    id: 25,
    name: 'Cronos',
    coingeckoPlatform: 'cronos',
    nativeCoinIds: ['crypto-com-chain'],
    geckoTerminalNetwork: 'cronos',
  },
  {
    id: 66,
    name: 'OKC',
    coingeckoPlatform: 'okex-chain',
    nativeCoinIds: ['oec-token'],
    geckoTerminalNetwork: 'okc',
  },
  {
    id: 128,
    name: 'HECO',
    coingeckoPlatform: 'huobi-token',
    nativeCoinIds: ['huobi-token'],
    geckoTerminalNetwork: 'heco',
  },
  {
    id: 100,
    name: 'Gnosis',
    coingeckoPlatform: 'xdai',
    nativeCoinIds: ['xdai'],
    geckoTerminalNetwork: 'xdai',
  },
  {
    id: 321,
    name: 'KCC',
    coingeckoPlatform: 'kucoin-community-chain',
    nativeCoinIds: ['kucoin-shares'],
    geckoTerminalNetwork: 'kcc',
  },
  {
    id: 201022,
    name: 'FON',
    coingeckoPlatform: null,
    nativeCoinIds: [],
    geckoTerminalNetwork: null,
  },
  {
    id: 5000,
    name: 'Mantle',
    coingeckoPlatform: 'mantle',
    nativeCoinIds: ['mantle'],
    geckoTerminalNetwork: 'mantle',
  },
  {
    id: 204,
    name: 'opBNB',
    coingeckoPlatform: 'opbnb',
    nativeCoinIds: ['binancecoin'],
    geckoTerminalNetwork: 'opbnb',
  },
  {
    id: 42766,
    name: 'ZKFair',
    coingeckoPlatform: 'zkfair',
    nativeCoinIds: ['zkfair'],
    geckoTerminalNetwork: 'zkfair',
  },
  {
    id: 81457,
    name: 'Blast',
    coingeckoPlatform: 'blast',
    nativeCoinIds: ['ethereum'],
    geckoTerminalNetwork: 'blast',
  },
  {
    id: 169,
    name: 'Manta Pacific',
    coingeckoPlatform: 'manta-pacific',
    nativeCoinIds: ['manta-network'],
    geckoTerminalNetwork: 'manta-pacific',
  },
  {
    id: 80094,
    name: 'Berachain',
    coingeckoPlatform: 'berachain',
    nativeCoinIds: ['berachain-bera'],
    geckoTerminalNetwork: 'berachain',
  },
  {
    id: 2741,
    name: 'Abstract',
    coingeckoPlatform: 'abstract',
    nativeCoinIds: ['ethereum'],
    geckoTerminalNetwork: 'abstract',
  },
  {
    id: 177,
    name: 'Hashkey Chain',
    coingeckoPlatform: 'hashkey-chain',
    nativeCoinIds: ['hashkey-chain-hsk'],
    geckoTerminalNetwork: 'hashkey',
  },
  {
    id: 146,
    name: 'Sonic',
    coingeckoPlatform: 'sonic',
    nativeCoinIds: ['sonic-3'],
    geckoTerminalNetwork: 'sonic',
  },
  {
    id: 1514,
    name: 'Story',
    coingeckoPlatform: 'story',
    nativeCoinIds: ['story-2'],
    geckoTerminalNetwork: 'story',
  },
  {
    id: 130,
    name: 'Unichain',
    coingeckoPlatform: 'unichain',
    nativeCoinIds: ['ethereum'],
    geckoTerminalNetwork: 'unichain',
  },
  {
    id: 480,
    name: 'World Chain',
    coingeckoPlatform: 'world-chain',
    nativeCoinIds: ['worldcoin-wld'],
    geckoTerminalNetwork: 'worldchain',
  },
  {
    id: 1868,
    name: 'Soneium',
    coingeckoPlatform: 'soneium',
    nativeCoinIds: ['ethereum'],
    geckoTerminalNetwork: 'soneium',
  },
  {
    id: 48900,
    name: 'Zircuit',
    coingeckoPlatform: 'zircuit',
    nativeCoinIds: ['ethereum'],
    geckoTerminalNetwork: 'zircuit',
  },
  {
    id: 5734951,
    name: 'Jovay',
    coingeckoPlatform: null,
    nativeCoinIds: [],
    geckoTerminalNetwork: null,
  },
  {
    id: 143,
    name: 'Monad',
    coingeckoPlatform: null,
    nativeCoinIds: [],
    geckoTerminalNetwork: null,
  },
];

export const CHAIN_CONFIG_BY_ID = new Map<number, ChainConfig>(
  CHAIN_LIST.map((chain) => [chain.id, chain]),
);

export const GOPLUS_SUPPORTED_CHAIN_IDS = new Set<number>(
  CHAIN_LIST.map((chain) => chain.id),
);

export function isGoPlusSupportedChain(chainId: number): boolean {
  return GOPLUS_SUPPORTED_CHAIN_IDS.has(chainId);
}

export function getChainConfig(chainId: number): ChainConfig | undefined {
  return CHAIN_CONFIG_BY_ID.get(chainId);
}
