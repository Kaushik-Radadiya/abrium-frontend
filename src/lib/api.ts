export type RiskAlertLevel = 'info' | 'warning' | 'error';

export type TokenRiskResponse = {
  alertLevel: RiskAlertLevel;
  alertTitle: string;
  alertMessage: string;
};

export type SimulationWarning = {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
};

export type SimulationResponse = {
  summary: string;
  revertLikelihood: 'low' | 'medium' | 'high';
  approvalRisk: 'low' | 'medium' | 'high';
  mevProtectedRpcUsed: string | null;
  warnings: SimulationWarning[];
};

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function fetchTokenRisk(chainId: number, tokenAddress: string) {
  if (!apiBase) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL is not configured');
  }
  const response = await fetch(
    `${apiBase}/risk/token?chainId=${chainId}&tokenAddress=${tokenAddress}`,
    { cache: 'no-store' },
  );
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as
      | { error?: string }
      | null;
    throw new Error(body?.error || 'Failed to fetch token risk');
  }

  return (await response.json()) as TokenRiskResponse;
}

export async function simulateSwap(payload: {
  chainId: number;
  fromToken: string;
  toToken: string;
  amount: string;
  walletAddress?: string;
}) {
  if (!apiBase) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL is not configured');
  }

  const response = await fetch(`${apiBase}/security/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Failed to run simulation');
  }

  return (await response.json()) as SimulationResponse;
}
