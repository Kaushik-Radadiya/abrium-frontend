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
  score: number;
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

export type ApiResponseEnvelope<T> = {
  error: boolean;
  success: boolean;
  message: string;
  statusCode: number;
  data: T | null;
};
