export type RiskDecision = 'ALLOW' | 'WARN' | 'BLOCK';
export type SecurityLevel = 'verified' | 'caution' | 'danger';

export type TokenRiskResponse = {
  decision: RiskDecision;
  securityLevel: SecurityLevel;
  criticalFlags: string[];
  reasons: string[];
};

export type CatalogChainResponse = {
  id: number;
  chainKey: string;
  name: string;
  nativeSymbol: string;
  logoURI?: string;
  scope: 'production' | 'development';
};

export type CatalogTokenResponse = {
  chainId: number;
  address: `0x${string}` | 'native';
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
};

export type CatalogTokensPayload = {
  tokens: CatalogTokenResponse[];
  securitySyncing: boolean;
};

export type UserInfoResponse = {
  isVerified?: boolean;
  is_verified?: boolean;
  wealthTier?: number;
  wealth_tier?: number;
};

export type ApiResponseEnvelope<T> = {
  error: boolean;
  success: boolean;
  message: string;
  statusCode: number;
  data: T | null;
};
