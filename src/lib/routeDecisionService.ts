import type { Route } from '@lifi/types';
export type Provider = 'lifi' | 'socket';

export type RouteStep = {
  type: 'swap' | 'bridge';
  protocol: string;
  fromChainId: number;
  toChainId: number;
  fromToken: { address: string; symbol: string; decimals: number };
  toToken: { address: string; symbol: string; decimals: number };
  fromAmount: string;
  toAmount: string;
  estimatedDurationMs: number;
};

export type RouteScoreBreakdown = {
  netValue: number;
  speed: number;
  reliability: number;
  gas: number;
  slippageRisk: number;
};

export type ScoringWeights = {
  netValue: number;
  speed: number;
  reliability: number;
  gas: number;
  slippageRisk: number;
};

export type RouteConstraints = {
  maxSlippage?: number;
  maxDurationMs?: number;
  maxGasFeeUSD?: number;
  maxPriceImpact?: number;
  blockedProtocols?: string[];
};

export type BlockedRoute = {
  route: NormalizedRoute;
  reason: string;
};

export type RankRoutesResult = {
  ranked: NormalizedRoute[];
  blocked: BlockedRoute[];
};

export type NormalizedRoute = {
  routeId: string;
  provider: Provider;
  providerId: string;
  fromChainId: number;
  toChainId: number;
  isCrossChain: boolean;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  minAmountOut: string;
  gasFeeUSD: number;
  bridgeFeeUSD: number;
  protocolFeeUSD: number;
  totalFeeUSD: number;
  netValueUSD: number;
  estimatedDurationMs: number;
  slippage: number;
  priceImpact: number;
  score: number;
  scoreBreakdown: RouteScoreBreakdown;
  explanation: string;
  steps: RouteStep[];
  rawProviderData: Route;
  fetchedAt: number;
};

export const DEFAULT_WEIGHTS: ScoringWeights = {
  netValue: 0.4,
  speed: 0.2,
  reliability: 0.2,
  gas: 0.1,
  slippageRisk: 0.1,
};

export function normalizeQuote(
  raw: Route,
  provider: Provider = 'lifi',
): NormalizedRoute {
  const gasFeeUSD = raw.steps.reduce((sum, step) => {
    const costs = step.estimate?.gasCosts ?? [];
    return sum + costs.reduce((a, c) => a + parseFloat(c.amountUSD ?? '0'), 0);
  }, 0);

  // Only count feeCosts that are NOT already included in toAmount.
  // included=true means LI.FI already deducted it from toAmountUSD → don't subtract again.
  const bridgeFeeUSD =
    raw.fromChainId !== raw.toChainId
      ? raw.steps.reduce((sum, step) => {
          const costs = step.estimate?.feeCosts ?? [];
          return (
            sum +
            costs
              .filter((c) => !c.included)
              .reduce((a, c) => a + parseFloat(c.amountUSD ?? '0'), 0)
          );
        }, 0)
      : 0;

  // toAmountUSD exists on the Route object at runtime but @lifi/types doesn't declare it
  const toAmountUSD = parseFloat(
    (raw as Route & { toAmountUSD?: string }).toAmountUSD ?? '0',
  );
  const totalFeeUSD = gasFeeUSD + bridgeFeeUSD;

  const estimatedDurationMs = raw.steps.reduce(
    (sum, step) => sum + (step.estimate?.executionDuration ?? 0) * 1000,
    0,
  );

  const firstAction = raw.steps[0]?.action;
  const slippage =
    typeof firstAction?.slippage === 'number' ? firstAction.slippage : 0.005;
  const priceImpact = parseFloat(
    raw.steps[0]?.estimate?.toAmountUSD && raw.steps[0]?.estimate?.fromAmountUSD
      ? (
          (parseFloat(raw.steps[0].estimate.fromAmountUSD) -
            parseFloat(raw.steps[0].estimate.toAmountUSD)) /
          parseFloat(raw.steps[0].estimate.fromAmountUSD)
        ).toFixed(6)
      : '0',
  );

  return {
    routeId: buildRouteId(raw, provider),
    provider,
    providerId: raw.id,

    fromChainId: raw.fromChainId,
    toChainId: raw.toChainId,
    isCrossChain: raw.fromChainId !== raw.toChainId,
    fromToken: raw.fromToken.address,
    toToken: raw.toToken.address,

    fromAmount: raw.fromAmount,
    toAmount: raw.toAmount,
    minAmountOut: raw.toAmountMin,

    gasFeeUSD,
    bridgeFeeUSD,
    protocolFeeUSD: 0,
    totalFeeUSD,
    netValueUSD: toAmountUSD - totalFeeUSD,

    estimatedDurationMs,
    slippage,
    priceImpact,

    score: 0,
    scoreBreakdown: {
      netValue: 0,
      speed: 0,
      reliability: 80,
      gas: 0,
      slippageRisk: 0,
    },
    explanation: '',

    steps: raw.steps.map((step) => ({
      type:
        step.action.fromChainId !== step.action.toChainId ? 'bridge' : 'swap',
      protocol: step.toolDetails?.name ?? step.tool,
      fromChainId: step.action.fromChainId,
      toChainId: step.action.toChainId,
      fromToken: {
        address: step.action.fromToken.address,
        symbol: step.action.fromToken.symbol,
        decimals: step.action.fromToken.decimals,
      },
      toToken: {
        address: step.action.toToken.address,
        symbol: step.action.toToken.symbol,
        decimals: step.action.toToken.decimals,
      },
      fromAmount: step.action.fromAmount,
      toAmount: step.estimate?.toAmount ?? '0',
      estimatedDurationMs: (step.estimate?.executionDuration ?? 0) * 1000,
    })),

    rawProviderData: raw,
    fetchedAt: Date.now(),
  };
}

export function scoreRoute(
  route: NormalizedRoute,
  allRoutes: NormalizedRoute[],
  weights: ScoringWeights = DEFAULT_WEIGHTS,
  reliabilityData?: Record<Provider, number>,
): NormalizedRoute {
  const norm = (
    val: number,
    all: number[],
    dir: 'higher' | 'lower',
  ): number => {
    const min = Math.min(...all);
    const max = Math.max(...all);
    if (max === min) return 100;
    const n = (val - min) / (max - min);
    return Math.round((dir === 'higher' ? n : 1 - n) * 100);
  };

  const breakdown: RouteScoreBreakdown = {
    netValue: norm(
      route.netValueUSD,
      allRoutes.map((r) => r.netValueUSD),
      'higher',
    ),
    speed: norm(
      route.estimatedDurationMs,
      allRoutes.map((r) => r.estimatedDurationMs),
      'lower',
    ),
    reliability: reliabilityData?.[route.provider] ?? 80,
    gas: norm(
      route.gasFeeUSD,
      allRoutes.map((r) => r.gasFeeUSD),
      'lower',
    ),
    slippageRisk: norm(
      route.slippage,
      allRoutes.map((r) => r.slippage),
      'lower',
    ),
  };

  const score = Math.round(
    breakdown.netValue * weights.netValue +
      breakdown.speed * weights.speed +
      breakdown.reliability * weights.reliability +
      breakdown.gas * weights.gas +
      breakdown.slippageRisk * weights.slippageRisk,
  );

  return { ...route, score, scoreBreakdown: breakdown };
}

export function rankRoutes(
  routes: NormalizedRoute[],
  constraints?: RouteConstraints,
  weights?: ScoringWeights,
  reliabilityData?: Record<Provider, number>,
): RankRoutesResult {
  const ranked: NormalizedRoute[] = [];
  const blocked: BlockedRoute[] = [];

  for (const r of routes) {
    const blockReason = getBlockReason(r, constraints);
    if (blockReason) {
      blocked.push({ route: r, reason: blockReason });
    } else {
      ranked.push(r);
    }
  }

  if (ranked.length === 0) return { ranked: [], blocked };

  const scored = ranked.map((r) =>
    scoreRoute(r, ranked, weights, reliabilityData),
  );

  return {
    ranked: scored.sort((a, b) => b.score - a.score),
    blocked,
  };
}

function getBlockReason(
  r: NormalizedRoute,
  constraints?: RouteConstraints,
): string | null {
  if (constraints?.maxSlippage && r.slippage > constraints.maxSlippage)
    return `Slippage too high (${(r.slippage * 100).toFixed(1)}% > max ${(constraints.maxSlippage * 100).toFixed(1)}%)`;

  if (
    constraints?.maxDurationMs &&
    r.estimatedDurationMs > constraints.maxDurationMs
  )
    return `Route too slow (${Math.round(r.estimatedDurationMs / 60_000)} min > max ${Math.round(constraints.maxDurationMs / 60_000)} min)`;

  if (constraints?.maxGasFeeUSD && r.gasFeeUSD > constraints.maxGasFeeUSD)
    return `Gas too high ($${r.gasFeeUSD.toFixed(2)} > max $${constraints.maxGasFeeUSD.toFixed(2)})`;

  if (
    constraints?.maxPriceImpact &&
    Math.abs(r.priceImpact) > constraints.maxPriceImpact
  )
    return `Price impact too high (${(r.priceImpact * 100).toFixed(1)}%)`;

  if (
    constraints?.blockedProtocols?.some((p) =>
      r.steps.some((s) => s.protocol === p),
    )
  )
    return `Route uses a blocked protocol`;

  // Oracle sanity: >50% price impact means the token has near-zero liquidity or bad pricing
  if (r.priceImpact > 0.5)
    return `Extreme price impact (${(r.priceImpact * 100).toFixed(1)}%) — token likely has very low liquidity`;

  return null;
}

export function explainRoute(route: NormalizedRoute, rank: number): string {
  const parts: string[] = [];

  if (rank === 0) parts.push('Best overall route.');

  if (route.scoreBreakdown.netValue >= 80)
    parts.push('Gives you the most output after all fees.');

  if (route.estimatedDurationMs < 60_000) {
    parts.push('Settles in under 1 min.');
  } else if (route.isCrossChain) {
    const mins = Math.round(route.estimatedDurationMs / 60_000);
    parts.push(`Bridge takes ~${mins} min.`);
  }

  if (route.gasFeeUSD < 0.5) {
    parts.push('Very low gas cost.');
  } else if (route.gasFeeUSD > 15) {
    parts.push(`Gas is high ($${route.gasFeeUSD.toFixed(2)}).`);
  }

  if (route.slippage <= 0.003) {
    parts.push('Tight slippage — deep liquidity.');
  } else if (route.slippage > 0.02) {
    parts.push(`${(route.slippage * 100).toFixed(1)}% slippage set.`);
  }

  const protocols = [...new Set(route.steps.map((s) => s.protocol))];
  parts.push(`Path: ${protocols.join(' → ')}.`);

  return parts.join(' ');
}

function buildRouteId(raw: Route, provider: Provider): string {
  const key = `${provider}:${raw.fromChainId}:${raw.toChainId}:${raw.fromToken.address}:${raw.toToken.address}:${raw.fromAmount}:${raw.id}`;
  let hash = 5381;
  for (let i = 0; i < key.length; i++) {
    hash = ((hash << 5) + hash) ^ key.charCodeAt(i);
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}
