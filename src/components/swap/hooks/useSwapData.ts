'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  createPublicClient,
  erc20Abi,
  formatUnits,
  http,
  isAddress,
} from 'viem';
import {
  baseSepolia,
  mainnet,
  polygon,
  polygonAmoy,
  sepolia,
} from 'viem/chains';
import { SupportedChain, getChainKey } from '@/lib/chains';
import { listTokensForChain, UiToken } from '@/lib/tokens';
import { fetchStargateNetworks, fetchStargateTokens } from '@/lib/stargate';
import { getChainIconUrl } from '@/lib/icons';
import { dedupeTokens } from '@/components/swap/utils';

type ImportedState = Record<number, UiToken[]>;

type RuntimeNetwork = {
  chain: SupportedChain;
  chainKey?: string;
};

type Params = {
  chainId: number;
  staticChains: SupportedChain[];
  walletAddress?: string;
  selectedFromToken?: string;
  selectedToToken?: string;
};

const IMPORT_CACHE_KEY = 'abrium.imported.tokens.v1';
const STARGATE_NETWORKS_CACHE_KEY = 'abrium.stargate.networks.v1';
const STARGATE_TOKENS_CACHE_PREFIX = 'abrium.stargate.tokens.v1';
const TOKEN_METADATA_CACHE_TTL_MS = 30 * 60 * 1000;
const BALANCE_REFRESH_MS = 30_000;
const EMPTY_TOKENS: UiToken[] = [];
const EMPTY_RUNTIME_NETWORKS: RuntimeNetwork[] = [];

type TimedCache<T> = {
  updatedAt: number;
  data: T;
};

function getViemChain(chainId: number) {
  if (chainId === mainnet.id) return mainnet;
  if (chainId === polygon.id) return polygon;
  if (chainId === sepolia.id) return sepolia;
  if (chainId === polygonAmoy.id) return polygonAmoy;
  if (chainId === baseSepolia.id) return baseSepolia;
  return mainnet;
}

function createChainClient(chainId: number, rpcUrl: string) {
  return createPublicClient({
    chain: getViemChain(chainId),
    transport: http(rpcUrl),
  });
}

function readLocalStorageJson<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(key);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function readImportedTokensCache() {
  return readLocalStorageJson<ImportedState>(IMPORT_CACHE_KEY) ?? {};
}

function readTimedLocalCache<T>(key: string, ttlMs: number): T | null {
  const cached = readLocalStorageJson<TimedCache<T>>(key);
  if (!cached || typeof cached !== 'object') return null;

  const updatedAt = cached.updatedAt;
  if (typeof updatedAt !== 'number' || Date.now() - updatedAt > ttlMs) {
    return null;
  }

  return cached.data ?? null;
}

function writeTimedLocalCache<T>(key: string, data: T) {
  if (typeof window === 'undefined') return;

  try {
    const payload: TimedCache<T> = {
      updatedAt: Date.now(),
      data,
    };
    window.localStorage.setItem(key, JSON.stringify(payload));
  } catch {
  }
}

function getStargateTokensCacheKey(chainId: number, chainKey: string) {
  return `${STARGATE_TOKENS_CACHE_PREFIX}.${chainId}.${chainKey.toLowerCase()}`;
}

async function fetchBalancesForTokens(params: {
  chainId: number;
  rpcUrl: string;
  walletAddress: `0x${string}`;
  tokens: UiToken[];
}) {
  const client = createChainClient(params.chainId, params.rpcUrl);
  const next: Record<string, string> = {};

  for (const token of params.tokens) {
    try {
      if (token.address === 'native') {
        const raw = await client.getBalance({
          address: params.walletAddress,
        });
        next[token.address.toLowerCase()] = Number(
          formatUnits(raw, token.decimals),
        ).toFixed(4);
        continue;
      }

      const raw = await client.readContract({
        address: token.address,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [params.walletAddress],
      });

      next[token.address.toLowerCase()] = Number(
        formatUnits(raw, token.decimals),
      ).toFixed(4);
    } catch {
      next[token.address.toLowerCase()] = '0.0000';
    }
  }

  return next;
}

export function useSwapData({
  chainId,
  staticChains,
  walletAddress,
  selectedFromToken,
  selectedToToken,
}: Params) {
  const [importedByChain, setImportedByChain] = useState<ImportedState>(
    readImportedTokensCache,
  );
  const [balances, setBalances] = useState<Record<string, string>>({});
  const [preferredRpcByChain, setPreferredRpcByChain] = useState<
    Record<number, string>
  >({});

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(
      IMPORT_CACHE_KEY,
      JSON.stringify(importedByChain),
    );
  }, [importedByChain]);

  const cachedRuntimeNetworks = useMemo(
    () =>
      readTimedLocalCache<RuntimeNetwork[]>(
        STARGATE_NETWORKS_CACHE_KEY,
        TOKEN_METADATA_CACHE_TTL_MS,
      ) ?? EMPTY_RUNTIME_NETWORKS,
    [],
  );

  const { data: dynamicRuntimeNetworks = cachedRuntimeNetworks } = useQuery({
    queryKey: ['stargate', 'networks'],
    queryFn: async () => {
      const networks = await fetchStargateNetworks();
      writeTimedLocalCache(STARGATE_NETWORKS_CACHE_KEY, networks);
      return networks;
    },
    initialData:
      cachedRuntimeNetworks.length > 0 ? cachedRuntimeNetworks : undefined,
    staleTime: TOKEN_METADATA_CACHE_TTL_MS,
    gcTime: TOKEN_METADATA_CACHE_TTL_MS * 2,
    retry: 1,
  });

  const uniqueRuntimeNetworks = useMemo(() => {
    const allowedChainIds = new Set(staticChains.map((chain) => chain.id));
    const map = new Map<number, RuntimeNetwork>();

    for (const chain of staticChains) {
      map.set(chain.id, { chain });
    }

    for (const network of dynamicRuntimeNetworks) {
      if (!allowedChainIds.has(network.chain.id)) continue;
      const existing = map.get(network.chain.id);
      if (!existing || (!existing.chainKey && network.chainKey)) {
        map.set(network.chain.id, network);
      }
    }

    return Array.from(map.values());
  }, [staticChains, dynamicRuntimeNetworks]);

  const selectedRuntimeNetwork = useMemo(() => {
    return uniqueRuntimeNetworks.find(
      (network) => network.chain.id === chainId,
    );
  }, [uniqueRuntimeNetworks, chainId]);

  const selectedNetwork = selectedRuntimeNetwork?.chain;

  const selectedRpcUrls = useMemo(() => {
    const dynamicUrls = selectedNetwork?.rpcUrls ?? [];
    const staticUrls =
      staticChains.find((chain) => chain.id === chainId)?.rpcUrls ?? [];
    return Array.from(new Set([...dynamicUrls, ...staticUrls].filter(Boolean)));
  }, [selectedNetwork, staticChains, chainId]);

  const orderedRpcUrls = useMemo(() => {
    const preferred = preferredRpcByChain[chainId];
    if (!preferred) return selectedRpcUrls;
    return [preferred, ...selectedRpcUrls.filter((url) => url !== preferred)];
  }, [chainId, preferredRpcByChain, selectedRpcUrls]);

  const selectedChainKey = useMemo(() => {
    return selectedRuntimeNetwork?.chainKey ?? getChainKey(chainId);
  }, [chainId, selectedRuntimeNetwork]);

  const selectedChainIcon = useMemo(() => {
    if (!selectedChainKey) return null;
    return getChainIconUrl(selectedChainKey);
  }, [selectedChainKey]);

  const stargateTokensCacheKey = useMemo(() => {
    if (!selectedChainKey) return null;
    return getStargateTokensCacheKey(chainId, selectedChainKey);
  }, [chainId, selectedChainKey]);

  const cachedDynamicTokensForChain = useMemo(() => {
    if (!stargateTokensCacheKey) return EMPTY_TOKENS;
    return (
      readTimedLocalCache<UiToken[]>(
        stargateTokensCacheKey,
        TOKEN_METADATA_CACHE_TTL_MS,
      ) ?? EMPTY_TOKENS
    );
  }, [stargateTokensCacheKey]);

  const {
    data: dynamicTokensForChain = cachedDynamicTokensForChain,
    isLoading: loadingDynamicTokens,
  } = useQuery({
    queryKey: ['stargate', 'tokens', chainId, selectedChainKey],
    queryFn: async () => {
      if (!selectedChainKey) return EMPTY_TOKENS;
      const tokens = await fetchStargateTokens({
        chainId,
        chainKey: selectedChainKey,
      });
      const dedupedTokens = dedupeTokens(tokens);
      if (stargateTokensCacheKey) {
        writeTimedLocalCache(stargateTokensCacheKey, dedupedTokens);
      }
      return dedupedTokens;
    },
    enabled: Boolean(selectedChainKey),
    initialData:
      cachedDynamicTokensForChain.length > 0
        ? cachedDynamicTokensForChain
        : undefined,
    staleTime: TOKEN_METADATA_CACHE_TTL_MS,
    gcTime: TOKEN_METADATA_CACHE_TTL_MS * 2,
    retry: 1,
  });
  const dynamicTokensCount = dynamicTokensForChain.length;

  const curatedTokens = useMemo(() => {
    if (dynamicTokensCount > 0) return dynamicTokensForChain;
    return listTokensForChain(chainId);
  }, [chainId, dynamicTokensCount, dynamicTokensForChain]);

  const importedTokens = useMemo(
    () => importedByChain[chainId] ?? EMPTY_TOKENS,
    [importedByChain, chainId],
  );

  const chainTokens = useMemo(
    () => dedupeTokens([...curatedTokens, ...importedTokens]),
    [curatedTokens, importedTokens],
  );

  const selectedBalanceTokens = useMemo(() => {
    const byAddress = new Map(
      chainTokens.map((token) => [token.address.toLowerCase(), token] as const),
    );
    const trackedAddresses = Array.from(
      new Set(
        [selectedFromToken, selectedToToken]
          .filter((value): value is string => Boolean(value))
          .map((value) => value.toLowerCase()),
      ),
    );

    return trackedAddresses
      .map((address) => byAddress.get(address))
      .filter((token): token is UiToken => Boolean(token));
  }, [chainTokens, selectedFromToken, selectedToToken]);

  useEffect(() => {
    let cancelled = false;

    async function loadBalances() {
      if (!walletAddress || !isAddress(walletAddress)) {
        if (!cancelled) setBalances({});
        return;
      }

      if (selectedBalanceTokens.length === 0) {
        if (!cancelled) setBalances({});
        return;
      }

      if (orderedRpcUrls.length === 0) return;

      let activeRpcUrl: string | null = null;
      for (const rpcUrl of orderedRpcUrls) {
        const probeClient = createChainClient(chainId, rpcUrl);
        try {
          await probeClient.getBlockNumber();
          activeRpcUrl = rpcUrl;
          setPreferredRpcByChain((prev) =>
            prev[chainId] === rpcUrl ? prev : { ...prev, [chainId]: rpcUrl },
          );
          break;
        } catch {}
      }

      if (!activeRpcUrl) {
        if (!cancelled) {
          const zeroBalances = selectedBalanceTokens.reduce<Record<string, string>>(
            (acc, token) => {
              acc[token.address.toLowerCase()] = '0.0000';
              return acc;
            },
            {},
          );
          setBalances(zeroBalances);
        }
        return;
      }

      const next = await fetchBalancesForTokens({
        chainId,
        rpcUrl: activeRpcUrl,
        walletAddress: walletAddress as `0x${string}`,
        tokens: selectedBalanceTokens,
      });

      if (!cancelled) {
        setBalances(next);
      }
    }

    void loadBalances();

    if (
      !walletAddress ||
      !isAddress(walletAddress) ||
      selectedBalanceTokens.length === 0 ||
      orderedRpcUrls.length === 0
    ) {
      return () => {
        cancelled = true;
      };
    }

    const intervalId = window.setInterval(() => {
      void loadBalances();
    }, BALANCE_REFRESH_MS);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [walletAddress, chainId, orderedRpcUrls, selectedBalanceTokens]);

  const importTokenByAddress = useCallback(
    async (address: `0x${string}`) => {
      if (orderedRpcUrls.length === 0) {
        throw new Error('No RPC network configured');
      }

      let symbol: string | undefined;
      let name: string | undefined;
      let decimals: number | undefined;
      let lastError = 'RPC request failed';

      for (const rpcUrl of orderedRpcUrls) {
        try {
          const client = createChainClient(chainId, rpcUrl);
          const [nextSymbol, nextName, nextDecimals] = await Promise.all([
            client.readContract({
              address,
              abi: erc20Abi,
              functionName: 'symbol',
            }),
            client.readContract({
              address,
              abi: erc20Abi,
              functionName: 'name',
            }),
            client.readContract({
              address,
              abi: erc20Abi,
              functionName: 'decimals',
            }),
          ]);

          symbol = nextSymbol;
          name = nextName;
          decimals = nextDecimals;
          break;
        } catch (error) {
          lastError =
            error instanceof Error ? error.message : 'RPC request failed';
        }
      }

      if (!symbol || !name || decimals === undefined) {
        throw new Error(lastError);
      }

      const importedToken: UiToken = {
        chainId,
        address,
        symbol,
        name,
        decimals,
      };

      setImportedByChain((prev) => {
        const chainList = prev[chainId] ?? [];
        return {
          ...prev,
          [chainId]: dedupeTokens([...chainList, importedToken]),
        };
      });

      return importedToken;
    },
    [chainId, orderedRpcUrls],
  );

  return {
    chainTokens,
    selectedNetwork,
    selectedChainKey,
    selectedChainIcon,
    uniqueRuntimeNetworks,
    loadingDynamicTokens,
    balances,
    importTokenByAddress,
  };
}
