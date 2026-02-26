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
  const record = payload as Record<string, unknown>;
  return (
    typeof record.success === 'boolean' &&
    typeof record.statusCode === 'number' &&
    'data' in record
  );
}

function unwrapResponseData<T>(
  payload: ApiResponseEnvelope<T> | T,
  fallbackMessage: string,
) {
  if (!isApiResponseEnvelope<T>(payload)) {
    return payload;
  }

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
  const response = await apiClient<ApiResponseEnvelope<TokenRiskResponse> | TokenRiskResponse>(
    `${BASE_URLS.RISK}/token?${params.toString()}`,
    {
      cache: 'no-store',
    },
  );
  return unwrapResponseData(response, 'Risk response was empty');
}

export async function fetchCatalogChains() {
  ensureApiBaseUrlConfigured();
  const response = await apiClient<
    ApiResponseEnvelope<CatalogChainResponse[]> | CatalogChainResponse[]
  >(`${BASE_URLS.CATALOG}/chains`, {
    cache: 'no-store',
  });
  return unwrapResponseData(response, 'Catalog chains response was empty');
}

export async function fetchCatalogTokens(chainId: number) {
  ensureApiBaseUrlConfigured();
  const params = new URLSearchParams({
    chainId: String(chainId),
  });
  const response = await apiClient<
    ApiResponseEnvelope<CatalogTokenResponse[]> | CatalogTokenResponse[]
  >(`${BASE_URLS.CATALOG}/tokens?${params.toString()}`, {
    cache: 'no-store',
  });
  return unwrapResponseData(response, 'Catalog tokens response was empty');
}
