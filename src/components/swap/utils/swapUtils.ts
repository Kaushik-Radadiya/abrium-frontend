import { formatUnits, getAddress, isAddress, parseUnits } from 'viem';
import type { UiToken } from '@/lib/tokens';

export const FALLBACK_SWAPPER_ADDRESS =
  '0x000000000000000000000000000000000000dEaD';

export function sortTokensByBalance(
  chainTokens: UiToken[],
  balances: Record<string, string>,
): UiToken[] {
  if (chainTokens.length <= 1) return chainTokens;

  const originalIndex = new Map(
    chainTokens.map(
      (token, index) => [token.address.toLowerCase(), index] as const,
    ),
  );

  const getNumericBalance = (address: string) => {
    const raw = balances[address.toLowerCase()] ?? '0';
    const value = Number(raw);
    return Number.isFinite(value) ? value : 0;
  };

  return [...chainTokens].sort((left, right) => {
    const leftBalance = getNumericBalance(left.address);
    const rightBalance = getNumericBalance(right.address);
    const leftHasBalance = leftBalance > 0 ? 1 : 0;
    const rightHasBalance = rightBalance > 0 ? 1 : 0;

    if (leftHasBalance !== rightHasBalance)
      return rightHasBalance - leftHasBalance;
    if (leftBalance !== rightBalance) return rightBalance - leftBalance;

    return (
      (originalIndex.get(left.address.toLowerCase()) ?? 0) -
      (originalIndex.get(right.address.toLowerCase()) ?? 0)
    );
  });
}

export function toSmallestUnit(
  value: string,
  decimals?: number,
): string | null {
  if (decimals === undefined) return null;
  const normalized = value.trim();
  if (!normalized) return null;
  try {
    const parsed = parseUnits(normalized, decimals);
    if (parsed <= BigInt(0)) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

export function formatAmountFromSmallest(
  value: string,
  decimals: number,
): string {
  try {
    const formatted = formatUnits(BigInt(value), decimals);
    if (!formatted.includes('.')) return formatted;
    const [whole, fraction = ''] = formatted.split('.');
    const trimmed = fraction.replace(/0+$/, '').slice(0, 8);
    return trimmed ? `${whole}.${trimmed}` : whole;
  } catch {
    return '0';
  }
}

export function resolveSwapperAddress(walletAddress?: string): string {
  if (walletAddress && isAddress(walletAddress)) {
    return getAddress(walletAddress);
  }
  return FALLBACK_SWAPPER_ADDRESS;
}
