'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createPublicClient,
  erc20Abi,
  formatUnits,
  http,
  isAddress,
} from 'viem';
import { baseSepolia, mainnet, polygon, polygonAmoy, sepolia } from 'viem/chains';
import {
  SupportedChain,
  getChainKey,
} from '@/lib/chains';
import { listTokensForChain, UiToken } from '@/lib/tokens';
import { fetchTokenRisk, TokenRiskResponse } from '@/lib/api';
import { fetchStargateNetworks, fetchStargateTokens } from '@/lib/stargate';
import { getChainIconUrl } from '@/lib/icons';
import { dedupeTokens } from '@/components/swap/utils';

type ImportedState = Record<number, UiToken[]>;

type RuntimeNetwork = {
  chain: SupportedChain;
  chainKey?: string;
};

type TokenMetadataCachePayload = {
  tokensByChain: Record<number, UiToken[]>;
  updatedAtByChain: Record<number, number>;
};

type Params = {
  chainId: number;
  staticChains: SupportedChain[];
  walletAddress?: string;
  selectedToToken?: string;
};

const IMPORT_CACHE_KEY = 'abrium.imported.tokens.v1';
const TOKEN_METADATA_CACHE_KEY = 'abrium.token.metadata.cache.v1';
const TOKEN_METADATA_CACHE_TTL_MS = 30 * 60 * 1000;
const BALANCE_REFRESH_MS = 30_000;
const MAX_BALANCE_TOKENS = 30;
const EMPTY_TOKENS: UiToken[] = [];

function getViemChain(chainId: number) {
  if (chainId === mainnet.id) return mainnet;
  if (chainId === polygon.id) return polygon;
  if (chainId === sepolia.id) return sepolia;
  if (chainId === polygonAmoy.id) return polygonAmoy;
  if (chainId === baseSepolia.id) return baseSepolia;
  return mainnet;
}

function resolveChainKey(chainId: number, chainKey?: string) {
  return chainKey ?? getChainKey(chainId);
}

export function useSwapData({
  chainId,
  staticChains,
  walletAddress,
  selectedToToken,
}: Params) {
  const [importedByChain, setImportedByChain] = useState<ImportedState>({});
  const [dynamicTokensByChain, setDynamicTokensByChain] = useState<
    Record<number, UiToken[]>
  >({});
  const [dynamicTokensUpdatedAtByChain, setDynamicTokensUpdatedAtByChain] =
    useState<Record<number, number>>({});
  const [runtimeNetworks, setRuntimeNetworks] = useState<RuntimeNetwork[]>(
    staticChains.map((chain) => ({ chain })),
  );

  const [balances, setBalances] = useState<Record<string, string>>({});
  const [loadingDynamicTokens, setLoadingDynamicTokens] = useState(false);
  const [risk, setRisk] = useState<TokenRiskResponse | null>(null);
  const [riskError, setRiskError] = useState<string | null>(null);
  const [preferredRpcByChain, setPreferredRpcByChain] = useState<
    Record<number, string>
  >({});

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = window.localStorage.getItem(IMPORT_CACHE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as ImportedState;
      setImportedByChain(parsed);
    } catch {
      setImportedByChain({});
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(
      IMPORT_CACHE_KEY,
      JSON.stringify(importedByChain),
    );
  }, [importedByChain]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = window.localStorage.getItem(TOKEN_METADATA_CACHE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as TokenMetadataCachePayload;
      const now = Date.now();
      const nextTokens: Record<number, UiToken[]> = {};
      const nextUpdatedAt: Record<number, number> = {};

      for (const [chainKey, tokens] of Object.entries(
        parsed.tokensByChain ?? {},
      )) {
        const chain = Number(chainKey);
        if (!Number.isFinite(chain) || !Array.isArray(tokens)) continue;

        const updatedAt = parsed.updatedAtByChain?.[chain] ?? 0;
        if (now - updatedAt > TOKEN_METADATA_CACHE_TTL_MS) continue;

        nextTokens[chain] = tokens;
        nextUpdatedAt[chain] = updatedAt;
      }

      setDynamicTokensByChain((prev) => ({ ...prev, ...nextTokens }));
      setDynamicTokensUpdatedAtByChain((prev) => ({
        ...prev,
        ...nextUpdatedAt,
      }));
    } catch {
      // ignore invalid cache payload
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const payload: TokenMetadataCachePayload = {
      tokensByChain: dynamicTokensByChain,
      updatedAtByChain: dynamicTokensUpdatedAtByChain,
    };

    window.localStorage.setItem(
      TOKEN_METADATA_CACHE_KEY,
      JSON.stringify(payload),
    );
  }, [dynamicTokensByChain, dynamicTokensUpdatedAtByChain]);

  useEffect(() => {
    let cancelled = false;

    void fetchStargateNetworks()
      .then((networks) => {
        if (cancelled || networks.length === 0) return;
        setRuntimeNetworks((prev) => [...prev, ...networks]);
      })
      .catch(() => {
        // keep static fallback
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const uniqueRuntimeNetworks = useMemo(() => {
    const allowedChainIds = new Set(staticChains.map((chain) => chain.id));
    const map = new Map<number, RuntimeNetwork>();
    for (const network of runtimeNetworks) {
      if (!allowedChainIds.has(network.chain.id)) continue;
      const existing = map.get(network.chain.id);
      if (!existing || (!existing.chainKey && network.chainKey)) {
        map.set(network.chain.id, network);
      }
    }
    return Array.from(map.values());
  }, [runtimeNetworks, staticChains]);

  const selectedNetwork = useMemo(() => {
    return uniqueRuntimeNetworks.find((network) => network.chain.id === chainId)
      ?.chain;
  }, [uniqueRuntimeNetworks, chainId]);

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
    return resolveChainKey(
      chainId,
      uniqueRuntimeNetworks.find((network) => network.chain.id === chainId)
        ?.chainKey,
    );
  }, [uniqueRuntimeNetworks, chainId]);

  const selectedChainIcon = useMemo(() => {
    if (!selectedChainKey) return null;
    return getChainIconUrl(selectedChainKey);
  }, [selectedChainKey]);

  useEffect(() => {
    if (!selectedChainKey) return;

    const hasTokens = Boolean(dynamicTokensByChain[chainId]?.length);
    const cachedAt = dynamicTokensUpdatedAtByChain[chainId] ?? 0;
    const hasFreshCache =
      hasTokens && Date.now() - cachedAt < TOKEN_METADATA_CACHE_TTL_MS;
    if (hasFreshCache) return;

    let cancelled = false;
    setLoadingDynamicTokens(true);

    void fetchStargateTokens({ chainId, chainKey: selectedChainKey })
      .then((tokens) => {
        if (cancelled || tokens.length === 0) return;
        setDynamicTokensByChain((prev) => ({
          ...prev,
          [chainId]: dedupeTokens(tokens),
        }));
        setDynamicTokensUpdatedAtByChain((prev) => ({
          ...prev,
          [chainId]: Date.now(),
        }));
      })
      .catch(() => {
        // keep curated fallback
      })
      .finally(() => {
        if (!cancelled) setLoadingDynamicTokens(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    selectedChainKey,
    chainId,
    dynamicTokensByChain,
    dynamicTokensUpdatedAtByChain,
  ]);

  const curatedTokens = useMemo(() => {
    const dynamic = dynamicTokensByChain[chainId];
    if (dynamic && dynamic.length > 0) return dynamic;
    return listTokensForChain(chainId);
  }, [chainId, dynamicTokensByChain]);

  const importedTokens = useMemo(
    () => importedByChain[chainId] ?? EMPTY_TOKENS,
    [importedByChain, chainId],
  );

  const chainTokens = useMemo(
    () => dedupeTokens([...curatedTokens, ...importedTokens]),
    [curatedTokens, importedTokens],
  );

  const tokenKeys = useMemo(
    () => chainTokens.map((token) => token.address.toLowerCase()).join(','),
    [chainTokens],
  );

  useEffect(() => {
    if (!walletAddress || !isAddress(walletAddress)) {
      setBalances({});
      return;
    }

    if (orderedRpcUrls.length === 0) return;
    const activeWalletAddress = walletAddress;

    let cancelled = false;

    async function loadBalances() {
      const next: Record<string, string> = {};
      const balanceTokens = chainTokens.slice(0, MAX_BALANCE_TOKENS);
      let activeRpcUrl: string | null = null;

      for (const rpcUrl of orderedRpcUrls) {
        const probeClient = createPublicClient({
          chain: getViemChain(chainId),
          transport: http(rpcUrl),
        });

        try {
          await probeClient.getBlockNumber();
          activeRpcUrl = rpcUrl;
          setPreferredRpcByChain((prev) =>
            prev[chainId] === rpcUrl ? prev : { ...prev, [chainId]: rpcUrl },
          );
          break;
        } catch {
          // try next RPC URL
        }
      }

      if (!activeRpcUrl) {
        for (const token of balanceTokens) {
          next[token.address.toLowerCase()] = '0.0000';
        }
        if (!cancelled) setBalances(next);
        return;
      }

      const client = createPublicClient({
        chain: getViemChain(chainId),
        transport: http(activeRpcUrl),
      });

      for (const token of balanceTokens) {
        try {
          if (token.address === 'native') {
            const raw = await client.getBalance({
              address: activeWalletAddress,
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
            args: [activeWalletAddress],
          });

          next[token.address.toLowerCase()] = Number(
            formatUnits(raw, token.decimals),
          ).toFixed(4);
        } catch {
          next[token.address.toLowerCase()] = '0.0000';
        }
      }

      if (!cancelled) {
        setBalances(next);
      }
    }

    void loadBalances();
    const interval = setInterval(() => {
      void loadBalances();
    }, BALANCE_REFRESH_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [walletAddress, chainId, tokenKeys, chainTokens, orderedRpcUrls]);

  useEffect(() => {
    if (!selectedToToken || selectedToToken === 'native') {
      setRisk(null);
      setRiskError(null);
      return;
    }

    let mounted = true;
    void fetchTokenRisk(chainId, selectedToToken)
      .then((response) => {
        if (!mounted) return;
        setRisk(response);
        setRiskError(null);
      })
      .catch((error: unknown) => {
        if (!mounted) return;
        setRisk(null);
        setRiskError(
          error instanceof Error ? error.message : 'Risk lookup failed',
        );
      });

    return () => {
      mounted = false;
    };
  }, [chainId, selectedToToken]);

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
          const client = createPublicClient({
            chain: getViemChain(chainId),
            transport: http(rpcUrl),
          });

          const [nextSymbol, nextName, nextDecimals] = await Promise.all([
            client.readContract({ address, abi: erc20Abi, functionName: 'symbol' }),
            client.readContract({ address, abi: erc20Abi, functionName: 'name' }),
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
    risk,
    riskError,
    importTokenByAddress,
  };
}
