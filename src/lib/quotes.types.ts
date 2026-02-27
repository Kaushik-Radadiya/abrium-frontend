export type SwapQuoteRequestPayload = {
  amount: string;
  swapper: string;
  tokenIn: string;
  tokenInChainId: number;
  tokenOut: string;
  tokenOutChainId: number;
  slippage?: number;
};

export type SwapQuoteRouteStep = {
  id: string;
  type: string;
  tool: string;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  toAmountMin: string;
  approvalAddress: string;
};

export type SwapQuoteResponsePayload = {
  chainId: number;
  swapper: string;
  route: SwapQuoteRouteStep[][];
  input: {
    amount: string;
    token: string;
    chainId: number;
  };
  output: {
    amount: string;
    token: string;
    chainId: number;
    recipient: string;
  };
  slippage: number | null;
  priceImpact: number | null;
  gasFee: string | null;
  gasFeeUSD: string | null;
  gasUseEstimate: string | null;
  routeString: string;
  blockNumber: string | null;
  quoteId: string;
  aggregatedOutputs: Array<{
    amount: string;
    token: string;
    recipient: string;
    bps: number;
    minAmount: string;
  }>;
  lifi: {
    id: string;
    tool: string;
    executionDuration: number;
  };
};
