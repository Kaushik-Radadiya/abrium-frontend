export type RiskAlertLevel = 'info' | 'warning' | 'error';
export type RiskDecision = 'ALLOW' | 'WARN' | 'BLOCK';

export type TokenRiskBadge = {
  id: string;
  label: string;
  detail: string;
  level: RiskAlertLevel;
};

export type TokenRiskMetrics = {
  buyTaxPercent: number | null;
  sellTaxPercent: number | null;
  maxDexLiquidityUsd: number | null;
  ownershipAbandoned: boolean;
};

export type TokenRiskResponse = {
  decision: RiskDecision;
  score: number | null;
  flags: string[];
  criticalFlags: string[];
  warningFlags: string[];
  trustSignals: string[];
  reasons: string[];
  badges: TokenRiskBadge[];
  metrics: TokenRiskMetrics;
  alertLevel: RiskAlertLevel;
  alertTitle: string;
  alertMessage: string;
};

export type CatalogChainResponse = {
  id: number;
  chainKey: string;
  name: string;
  rpcUrls: string[];
  explorerUrl: string;
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

export type ApiResponseEnvelope<T> = {
  error: boolean;
  success: boolean;
  message: string;
  statusCode: number;
  data: T | null;
};
