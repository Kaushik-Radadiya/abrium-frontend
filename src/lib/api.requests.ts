import { apiClient } from './api.client';
import { BASE_URLS, ensureApiBaseUrlConfigured } from './api.constants';
import { getChainConfig, isGoPlusSupportedChain } from './constant/goPlusChains';
import type {
  ApiResponseEnvelope,
  CatalogChainResponse,
  CatalogTokenResponse,
  CatalogTokensPayload,
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

const COINGECKO_API_BASE_URL = 'https://api.coingecko.com/api/v3';

export async function fetchCoinGeckoTokenImageUrl({
  chainId,
  address,
}: {
  chainId: number;
  address: string;
}): Promise<string | null> {
  if (address === 'native') return null;

  const network = getChainConfig(chainId)?.geckoTerminalNetwork ?? null;
  if (!network) return null;

  try {
    const url = `https://api.geckoterminal.com/api/v2/networks/${network}/tokens/${address.toLowerCase()}`;
    const response = await fetch(url, {
      headers: { Accept: 'application/json;version=20230302' },
      cache: 'no-store',
    });

    if (!response.ok) return null;

    const json = (await response.json()) as {
      data?: { attributes?: { image_url?: string | null } };
    };

    return json.data?.attributes?.image_url ?? null;
  } catch {
    return null;
  }
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
