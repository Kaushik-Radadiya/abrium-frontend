import { UiToken } from '@/lib/tokens';

export function dedupeTokens(tokens: UiToken[]) {
  const map = new Map<string, UiToken>();
  for (const token of tokens) {
    map.set(token.address.toLowerCase(), token);
  }
  return Array.from(map.values());
}

export function shortAddress(value: string) {
  if (value === 'native') return 'native';
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

export function displayBalance(value?: string) {
  if (!value) return '0.0000';
  return value;
}
