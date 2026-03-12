export const RECENT_RECEIVE_ADDRESSES_KEY =
  'abrium.recent.receive-addresses.v1';
export const MAX_RECENT_RECEIVE_ADDRESSES = 5;

export type WalletSelection = {
  id: string;
  address: string;
  icon?: string;
  label: string;
  kind: 'wallet' | 'custom';
};

export function readRecentReceiveAddresses() {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(RECENT_RECEIVE_ADDRESSES_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((value): value is string => typeof value === 'string');
  } catch {
    return [];
  }
}

export function persistCustomReceiveAddress(
  address: string,
  currentAddresses: string[],
) {
  const nextRecentAddresses = [
    address,
    ...currentAddresses.filter((value) => value !== address),
  ].slice(0, MAX_RECENT_RECEIVE_ADDRESSES);

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(
      RECENT_RECEIVE_ADDRESSES_KEY,
      JSON.stringify(nextRecentAddresses),
    );
  }

  return {
    nextRecentAddresses,
    walletSelection: {
      id: `custom:${address.toLowerCase()}`,
      address,
      label: 'Wallet address',
      kind: 'custom',
    } satisfies WalletSelection,
  };
}
