import { SupportedChain } from '@/lib/chains';
import { UiToken } from '@/lib/tokens';

type StargateNetwork = {
  chain: SupportedChain;
  chainKey: string;
};

const BASE_URL =
  process.env.NEXT_PUBLIC_STARGATE_BASE_URL ??
  'https://stargate.finance/api/v1';

function asArray(value: unknown) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    if (Array.isArray(record.chains)) return record.chains;
    if (Array.isArray(record.tokens)) return record.tokens;
    if (Array.isArray(record.data)) return record.data;
  }
  return [];
}

function getString(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return null;
}

function getNumber(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim()) {
      const num = Number(value);
      if (Number.isFinite(num)) return num;
    }
  }
}
function getStringList(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (!Array.isArray(value)) continue;
    const urls = value.filter(
      (item): item is string => typeof item === 'string' && Boolean(item),
    );
    if (urls.length > 0) return urls;
  }
  return [];
}

export async function fetchStargateNetworks(): Promise<StargateNetwork[]> {
  const response = await fetch(`${BASE_URL}/chains`, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Stargate chains fetch failed: ${response.status}`);
  }

  const payload = (await response.json()) as unknown;
  const list = asArray(payload);

  const networks: StargateNetwork[] = list
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return null;
      const record = entry as Record<string, unknown>;
      const id = getNumber(record, ['chainId', 'chain_id', 'id']);
      const name = getString(record, ['name', 'chainName']);
      const chainKey = getString(record, ['chainKey', 'key', 'slug']);
      if (!id || !name || !chainKey) return null;

      const rpcUrls = getStringList(record, [
        'rpcUrls',
        'rpc',
        'publicRpcUrls',
      ]);
      const explorer =
        getString(record, ['explorerUrl', 'scanUrl', 'blockExplorer']) ?? '';
      const nativeSymbol =
        getString(record, ['nativeSymbol', 'nativeTokenSymbol', 'gasSymbol']) ??
        'NATIVE';

      return {
        chain: {
          id,
          name,
          rpcUrls,
          explorerUrl: explorer,
          nativeSymbol,
          scope: 'production',
        },
        chainKey,
      } satisfies StargateNetwork;
    })
    .filter(Boolean) as unknown as StargateNetwork[];

  return networks;
}

export async function fetchStargateTokens(params: {
  chainId: number;
  chainKey: string;
}): Promise<UiToken[]> {
  const response = await fetch(`${BASE_URL}/tokens`, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Stargate tokens fetch failed: ${response.status}`);
  }

  const payload = (await response.json()) as unknown;
  const list = asArray(payload);
  const tokens: UiToken[] = [];

  for (const entry of list) {
    if (!entry || typeof entry !== 'object') continue;
    const record = entry as Record<string, unknown>;
    const address = getString(record, [
      'address',
      'tokenAddress',
      'contractAddress',
    ]);
    const symbol = getString(record, ['symbol']);
    const name = getString(record, ['name']);
    const decimals = getNumber(record, ['decimals']);
    const logoURI =
      getString(record, ['logoURI', 'logoUrl', 'icon']) ?? undefined;
    const tokenChainKey = getString(record, ['chainKey']);

    if (!address || !symbol || !name || decimals === null || !tokenChainKey)
      continue;
    if (tokenChainKey.toLowerCase() !== params.chainKey.toLowerCase()) continue;

    const lowered = address.toLowerCase();
    if (
      lowered === 'native' ||
      lowered === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
    ) {
      tokens.push({
        chainId: params.chainId,
        address: 'native',
        symbol,
        name,
        decimals: decimals as number,
        logoURI,
      });
      continue;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) continue;

    tokens.push({
      chainId: params.chainId,
      address: address as `0x${string}`,
      symbol,
      name,
      decimals: decimals as number,
      logoURI,
    });
  }

  return tokens;
}
