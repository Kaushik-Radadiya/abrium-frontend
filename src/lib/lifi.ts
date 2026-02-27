import { createConfig, getQuote, HTTPError } from '@lifi/sdk';
import type { LiFiStep, Step } from '@lifi/types';

const LIFI_API_KEY = process.env.NEXT_PUBLIC_LIFI_API_KEY ?? '';
const LIFI_INTEGRATOR =
  process.env.NEXT_PUBLIC_LIFI_INTEGRATOR ?? 'Abrium-codenova';
const LIFI_API_URL =
  process.env.NEXT_PUBLIC_LIFI_BASE_URL ?? 'https://li.quest/v1';

createConfig({
  integrator: LIFI_INTEGRATOR,
  ...(LIFI_API_KEY ? { apiKey: LIFI_API_KEY } : {}),
  apiUrl: LIFI_API_URL,
});
import type {
  SwapQuoteRequestPayload,
  SwapQuoteResponsePayload,
} from './quotes.types';

export class LiFiQuoteError extends Error {
  status: number | null;
  noRouteFound: boolean;

  constructor(
    message: string,
    status: number | null = null,
    noRouteFound = false,
  ) {
    super(message);
    this.name = 'LiFiQuoteError';
    this.status = status;
    this.noRouteFound = noRouteFound;
  }
}

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const NO_ROUTES_CODE = 1002;

function toApiTokenAddress(token: string): string {
  return token === 'native' ? ZERO_ADDRESS : token.toLowerCase();
}

function normalizeSlippage(raw?: number): number | undefined {
  if (!raw || !Number.isFinite(raw) || raw <= 0) return undefined;
  return raw > 0.05 ? raw / 100 : raw;
}

function sumBigIntStrings(values: Array<string | undefined>): string {
  let total = BigInt(0);
  for (const v of values) {
    if (!v) continue;
    try {
      total += BigInt(v);
    } catch {
    }
  }
  return total.toString();
}

function sumUsdStrings(values: Array<string | undefined>): number {
  return values.reduce<number>((acc, v) => {
    if (!v) return acc;
    const n = Number(v);
    return Number.isFinite(n) ? acc + n : acc;
  }, 0);
}

function mapSdkQuote(
  step: LiFiStep | Step,
  swapper: string,
): SwapQuoteResponsePayload {
  const gasCosts = step.estimate?.gasCosts ?? [];
  const gasFeeUSDNumber = sumUsdStrings(gasCosts.map((c) => c.amountUSD));

  const fromUSD = Number(step.estimate?.fromAmountUSD ?? 0);
  const toUSD = Number(step.estimate?.toAmountUSD ?? 0);
  const priceImpact =
    Number.isFinite(fromUSD) && Number.isFinite(toUSD) && fromUSD > 0
      ? Number((((fromUSD - toUSD) / fromUSD) * 100).toFixed(4))
      : null;

  const includedSteps = 'includedSteps' in step ? step.includedSteps : [step];
  const route = [
    includedSteps.map((s) => ({
      id: s.id,
      type: s.type,
      tool: s.tool,
      fromToken: s.action.fromToken.address,
      toToken: s.action.toToken.address,
      fromAmount: s.action.fromAmount,
      toAmount: s.estimate?.toAmount ?? '0',
      toAmountMin: s.estimate?.toAmountMin ?? '0',
      approvalAddress: s.estimate?.approvalAddress ?? '',
    })),
  ];

  const toAmount = step.estimate?.toAmount ?? '0';
  const toAmountMin = step.estimate?.toAmountMin ?? '0';

  return {
    chainId: step.action.fromChainId,
    swapper,
    route,
    input: {
      amount: step.action.fromAmount,
      token: step.action.fromToken.address,
      chainId: step.action.fromChainId,
    },
    output: {
      amount: toAmount,
      token: step.action.toToken.address,
      chainId: step.action.toChainId,
      recipient: step.action.toAddress ?? swapper,
    },
    slippage:
      typeof step.action.slippage === 'number'
        ? Number((step.action.slippage * 100).toFixed(4))
        : null,
    priceImpact,
    gasFee: sumBigIntStrings(gasCosts.map((c) => c.amount)),
    gasFeeUSD: Number.isFinite(gasFeeUSDNumber)
      ? gasFeeUSDNumber.toFixed(6)
      : null,
    gasUseEstimate: sumBigIntStrings(gasCosts.map((c) => c.estimate)),
    routeString: includedSteps.map((s) => `${s.type}:${s.tool}`).join(' -> '),
    blockNumber: null,
    quoteId: step.id,
    aggregatedOutputs: [
      {
        amount: toAmount,
        token: step.action.toToken.address,
        recipient: step.action.toAddress ?? swapper,
        bps: 10_000,
        minAmount: toAmountMin,
      },
    ],
    lifi: {
      id: step.id,
      tool: step.tool,
      executionDuration: step.estimate?.executionDuration ?? 0,
    },
  };
}

export async function fetchSwapQuote(
  payload: SwapQuoteRequestPayload,
): Promise<SwapQuoteResponsePayload> {
  const slippage = normalizeSlippage(payload.slippage);

  try {
    const step = await getQuote({
      fromChain: payload.tokenInChainId,
      toChain: payload.tokenOutChainId,
      fromToken: toApiTokenAddress(payload.tokenIn),
      toToken: toApiTokenAddress(payload.tokenOut),
      fromAmount: payload.amount,
      fromAddress: payload.swapper,
      toAddress: payload.swapper,
      ...(slippage !== undefined ? { slippage } : {}),
    });

    return mapSdkQuote(step, payload.swapper);
  } catch (err) {
    if (err instanceof HTTPError) {
      await err.buildAdditionalDetails().catch(() => {});
      const code = err.responseBody?.code;
      const noRouteFound = err.status === 404 && code === NO_ROUTES_CODE;
      throw new LiFiQuoteError(
        err.responseBody?.message ?? `LI.FI API error (HTTP ${err.status})`,
        err.status,
        noRouteFound,
      );
    }

    throw new LiFiQuoteError(
      err instanceof Error ? err.message : 'Unknown error fetching quote',
    );
  }
}
