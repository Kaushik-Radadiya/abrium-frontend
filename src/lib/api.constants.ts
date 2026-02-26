export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

const withBaseUrl = (path: string) => `${API_BASE_URL}${path}`;

export const BASE_URLS = {
  CATALOG: withBaseUrl('/catalog'),
  RISK: withBaseUrl('/risk'),
} as const;

export function ensureApiBaseUrlConfigured() {
  if (!API_BASE_URL) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL is not configured');
  }
}
