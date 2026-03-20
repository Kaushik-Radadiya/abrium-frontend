import { UiToken } from '@/lib/tokens';
import type { SwapQuoteRequestPayload } from '@/lib/quotes.types';

export function dedupeTokens(tokens: UiToken[]) {
  const map = new Map<string, UiToken>();
  for (const token of tokens) {
    map.set(token.address.toLowerCase(), token);
  }
  return Array.from(map.values());
}

export function filterTokens(tokens: UiToken[], query: string) {
  const value = query.trim().toLowerCase();
  if (!value) return tokens;
  return tokens.filter(
    (token) =>
      token.symbol.toLowerCase().includes(value) ||
      token.name.toLowerCase().includes(value) ||
      token.address.toLowerCase().includes(value),
  );
}

type BuildSwapQuoteRequestParams = {
  amount: string;
  fromChainId: number;
  fromTokenAddress: string;
  toChainId: number;
  toTokenAddress: string;
  receiveWalletAddress?: string | null;
  swapperAddress: string;
};

export function buildSwapQuoteRequest({
  amount,
  fromChainId,
  fromTokenAddress,
  toChainId,
  toTokenAddress,
  receiveWalletAddress,
  swapperAddress,
}: BuildSwapQuoteRequestParams): SwapQuoteRequestPayload {
  return {
    amount,
    recipient: receiveWalletAddress ?? swapperAddress,
    swapper: swapperAddress,
    tokenIn: fromTokenAddress,
    tokenInChainId: fromChainId,
    tokenOut: toTokenAddress,
    tokenOutChainId: toChainId,
  };
}
