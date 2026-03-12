import { apiClient } from './api.client';
import { BASE_URLS, ensureApiBaseUrlConfigured } from './api.constants';
import { getChainConfig, isGoPlusSupportedChain } from './constant/goPlusChains';
import type {
  ApiResponseEnvelope,
  CatalogChainResponse,
  CatalogTokenResponse,
  CatalogTokensPayload,
  TokenRiskResponse,
  UserInfoResponse,
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
  const chains = unwrapResponseData(response, 'Catalog chains response was empty');
  if (!Array.isArray(chains)) return chains;
  return chains.filter((chain) => isGoPlusSupportedChain(chain.id));
}

export async function fetchCatalogTokens(chainId: number): Promise<{
  tokens: CatalogTokenResponse[];
  securitySyncing: boolean;
}> {
  ensureApiBaseUrlConfigured();
  const params = new URLSearchParams({ chainId: String(chainId) });
  const response = await apiClient<
    | ApiResponseEnvelope<CatalogTokensPayload>
    | ApiResponseEnvelope<CatalogTokenResponse[]>
    | CatalogTokensPayload
    | CatalogTokenResponse[]
  >(`${BASE_URLS.CATALOG}/tokens?${params.toString()}`, { cache: 'no-store' });

  // Unwrap envelope if present
  const data = isApiResponseEnvelope<CatalogTokensPayload | CatalogTokenResponse[]>(response)
    ? response.data
    : response;

  if (!data) throw new Error('Catalog tokens response was empty');

  if (data && !Array.isArray(data) && 'tokens' in data) {
    return { tokens: data.tokens, securitySyncing: data.securitySyncing ?? false };
  }

  // Legacy shape: plain array (backwards compat)
  const tokens = Array.isArray(data) ? data : [];
  return { tokens, securitySyncing: false };
}

export async function fetchUserInfo(walletAddress: string) {
  ensureApiBaseUrlConfigured();
  const params = new URLSearchParams({ walletAddress });
  const response = await apiClient<
    ApiResponseEnvelope<UserInfoResponse | null> | UserInfoResponse | null
  >(`${BASE_URLS.USER}/info?${params.toString()}`, { cache: 'no-store' });

  if (isApiResponseEnvelope<UserInfoResponse | null>(response)) {
    return response.data;
  }

  return response;
}

const COINGECKO_API_BASE_URL = 'https://api.coingecko.com/api/v3';

type ImportTokenApiResponse = {
  chainId: number;
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoUri?: string | null;
};

export async function importCatalogToken(
  chainId: number,
  address: string,
): Promise<CatalogTokenResponse> {
  ensureApiBaseUrlConfigured();
  const response = await apiClient<
    ApiResponseEnvelope<ImportTokenApiResponse>
  >(`${BASE_URLS.CATALOG}/import-token`, {
    method: 'POST',
    body: JSON.stringify({ chainId, address }),
    cache: 'no-store',
  });
  const data = unwrapResponseData(response, 'Import token response was empty');
  return {
    chainId: data.chainId,
    address: data.address as `0x${string}`,
    symbol: data.symbol,
    name: data.name,
    decimals: data.decimals,
    ...(data.logoUri ? { logoURI: data.logoUri } : {}),
  };
}

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
    const coinIds = getChainConfig(chainId)?.nativeCoinIds ?? [];
    if (!coinIds.length) return null;

    for (const coinId of coinIds) {
      const url = new URL(`${COINGECKO_API_BASE_URL}/simple/price`);
      url.searchParams.set('ids', coinId);
      url.searchParams.set('vs_currencies', 'usd');
      const usd = await readCoinGeckoUsdValue(url, coinId);
      if (usd !== null) return usd;
    }
    return null;
  }

  const platform = getChainConfig(chainId)?.coingeckoPlatform ?? null;
  if (!platform) return null;

  const normalizedAddress = tokenAddress.toLowerCase();
  const url = new URL(
    `${COINGECKO_API_BASE_URL}/simple/token_price/${platform}`,
  );
  url.searchParams.set('contract_addresses', normalizedAddress);
  url.searchParams.set('vs_currencies', 'usd');
  return readCoinGeckoUsdValue(url, normalizedAddress);
}
