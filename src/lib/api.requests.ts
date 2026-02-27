import { apiClient } from './api.client';
import { BASE_URLS, ensureApiBaseUrlConfigured } from './api.constants';
import type {
  ApiResponseEnvelope,
  CatalogChainResponse,
  CatalogTokenResponse,
  TokenRiskResponse,
} from './api.types';

function isApiResponseEnvelope<T>(
  payload: unknown,
): payload is ApiResponseEnvelope<T> {
  if (!payload || typeof payload !== 'object') return false;
  const r = payload as Record<string, unknown>;
  return (
    typeof r.success === 'boolean' &&
    typeof r.statusCode === 'number' &&
    'data' in r
  );
}

function unwrapResponseData<T>(
  payload: ApiResponseEnvelope<T> | T,
  fallbackMessage: string,
) {
  if (!isApiResponseEnvelope<T>(payload)) return payload;
  if (payload.data === null || payload.data === undefined) {
    throw new Error(payload.message || fallbackMessage);
  }
  return payload.data;
}

export async function fetchTokenRisk(chainId: number, tokenAddress: string) {
  ensureApiBaseUrlConfigured();
  const params = new URLSearchParams({
    chainId: String(chainId),
    tokenAddress,
  });
  const response = await apiClient<
    ApiResponseEnvelope<TokenRiskResponse> | TokenRiskResponse
  >(`${BASE_URLS.RISK}/token?${params.toString()}`, { cache: 'no-store' });
  return unwrapResponseData(response, 'Risk response was empty');
}

export async function fetchCatalogChains() {
  ensureApiBaseUrlConfigured();
  const response = await apiClient<
    ApiResponseEnvelope<CatalogChainResponse[]> | CatalogChainResponse[]
  >(`${BASE_URLS.CATALOG}/chains`, { cache: 'no-store' });
  return unwrapResponseData(response, 'Catalog chains response was empty');
}

export async function fetchCatalogTokens(chainId: number) {
  ensureApiBaseUrlConfigured();
  const params = new URLSearchParams({ chainId: String(chainId) });
  const response = await apiClient<
    ApiResponseEnvelope<CatalogTokenResponse[]> | CatalogTokenResponse[]
  >(`${BASE_URLS.CATALOG}/tokens?${params.toString()}`, { cache: 'no-store' });
  return unwrapResponseData(response, 'Catalog tokens response was empty');
}

const COINGECKO_API_BASE_URL = 'https://api.coingecko.com/api/v3';

const COINGECKO_PLATFORM_BY_CHAIN_ID: Record<number, string> = {
  1: 'ethereum',
  137: 'polygon-pos',
  8453: 'base',
};

const COINGECKO_NATIVE_COIN_IDS_BY_CHAIN_ID: Record<number, string[]> = {
  1: ['ethereum'],
  137: ['polygon-ecosystem-token', 'matic-network'],
  8453: ['ethereum'],
  11155111: ['ethereum'],
  80002: ['polygon-ecosystem-token', 'matic-network'],
  84532: ['ethereum'],
};

async function readCoinGeckoUsdValue(
  url: URL,
  key: string,
): Promise<number | null> {
  const response = await fetch(url.toString(), { cache: 'no-store' });
  if (!response.ok) throw new Error('Unable to fetch token USD price');

  const payload = (await response.json()) as Record<
    string,
    { usd?: number } | undefined
  >;
  const usd = payload[key]?.usd;
  return typeof usd === 'number' && Number.isFinite(usd) ? usd : null;
}

export async function fetchTokenUsdPrice({
  chainId,
  tokenAddress,
}: {
  chainId: number;
  tokenAddress: string;
}): Promise<number | null> {
  if (tokenAddress === 'native') {
    const coinIds = COINGECKO_NATIVE_COIN_IDS_BY_CHAIN_ID[chainId];
    if (!coinIds?.length) return null;

    for (const coinId of coinIds) {
      const url = new URL(`${COINGECKO_API_BASE_URL}/simple/price`);
      url.searchParams.set('ids', coinId);
      url.searchParams.set('vs_currencies', 'usd');
      const usd = await readCoinGeckoUsdValue(url, coinId);
      if (usd !== null) return usd;
    }
    return null;
  }

  const platform = COINGECKO_PLATFORM_BY_CHAIN_ID[chainId];
  if (!platform) return null;

  const normalizedAddress = tokenAddress.toLowerCase();
  const url = new URL(
    `${COINGECKO_API_BASE_URL}/simple/token_price/${platform}`,
  );
  url.searchParams.set('contract_addresses', normalizedAddress);
  url.searchParams.set('vs_currencies', 'usd');
  return readCoinGeckoUsdValue(url, normalizedAddress);
}
