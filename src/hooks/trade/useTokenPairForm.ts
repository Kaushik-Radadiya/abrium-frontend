'use client';

import {
  useCallback,
  useDeferredValue,
  useMemo,
  useState,
} from 'react';
import { getAddress, isAddress } from 'viem';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { DEFAULT_CHAIN_ID, SUPPORTED_CHAINS } from '@/lib/chains';
import { useTokenRiskMutation } from '@/lib/api-hooks';
import { useSwapData } from '@/hooks/trade/useSwapData';
import { useTokenUsdValue } from '@/hooks/trade/useTokenUsdValue';
import {
  useFromTokenSync,
  useToTokenSync,
} from '@/hooks/trade/useTokenSync';
import {
  resolveSwapperAddress,
  toSmallestUnit,
} from '@/lib/trade/swapUtils';
import { filterTokens } from '@/lib/trade/workspace';
import type { SecurityLevel } from '@/lib/api';
import type { WalletSelection } from '@/lib/receive-wallet';

type SelectorTarget = 'from' | 'to' | null;

type Params = {
  /** Called when the token pair changes (token select, flip, open selector).
   *  Use this to reset mode-specific state like hasReviewedQuote or limitPrice. */
  onInvalidate?: () => void;
};

export function useTokenPairForm({ onInvalidate }: Params = {}) {
  const { primaryWallet, user, setShowAuthFlow } = useDynamicContext();
  const walletAddress = primaryWallet?.address;

  const [fromChainId, setFromChainId] = useState(DEFAULT_CHAIN_ID);
  const [toChainId, setToChainId] = useState(DEFAULT_CHAIN_ID);
  const [fromAmount, setFromAmount] = useState('0.0');
  const [toAmount, setToAmount] = useState('0.0');
  const [fromToken, setFromToken] = useState<string>('native');
  const [toToken, setToToken] = useState<string>('');
  const [selectorTarget, setSelectorTarget] = useState<SelectorTarget>(null);
  const [networkMenuOpen, setNetworkMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [valueMode, setValueMode] = useState<'token' | 'usd'>('token');
  const [fromUsdInput, setFromUsdInput] = useState('');
  const [showDangerModal, setShowDangerModal] = useState(false);
  const [dangerProceedAccepted, setDangerProceedAccepted] = useState(false);
  const [receiveWalletSelection, setReceiveWalletSelection] =
    useState<WalletSelection | null>(null);

  const receiveWalletAddress = receiveWalletSelection?.address ?? null;

  const {
    chainTokens: fromChainTokens,
    selectedChainKey: fromSelectedChainKey,
    selectedChainIcon: fromSelectedChainIcon,
    uniqueRuntimeNetworks: fromRuntimeNetworks,
    loadingDynamicTokens: fromLoadingDynamicTokens,
    importTokenByAddress: importFromTokenByAddress,
  } = useSwapData({ chainId: fromChainId, staticChains: SUPPORTED_CHAINS });

  const {
    chainTokens: toChainTokens,
    selectedChainKey: toSelectedChainKey,
    selectedChainIcon: toSelectedChainIcon,
    uniqueRuntimeNetworks: toRuntimeNetworks,
    loadingDynamicTokens: toLoadingDynamicTokens,
    importTokenByAddress: importToTokenByAddress,
  } = useSwapData({ chainId: toChainId, staticChains: SUPPORTED_CHAINS });

  const {
    mutateAsync: checkTokenRisk,
    data: risk,
    error: riskMutationError,
    reset: resetRiskCheck,
  } = useTokenRiskMutation();

  const riskError =
    riskMutationError instanceof Error ? riskMutationError.message : null;

  const clearRiskState = useCallback(() => {
    setShowDangerModal(false);
    setDangerProceedAccepted(false);
    resetRiskCheck();
  }, [resetRiskCheck]);

  useFromTokenSync(fromChainTokens, fromToken, setFromToken);
  useToTokenSync(toChainTokens, toToken, setToToken, clearRiskState);

  const selectedFromToken = useMemo(
    () => fromChainTokens.find((t) => t.address === fromToken),
    [fromChainTokens, fromToken],
  );

  const selectedToToken = useMemo(
    () => toChainTokens.find((t) => t.address === toToken),
    [toChainTokens, toToken],
  );

  const hasTokenSelection = Boolean(selectedFromToken && selectedToToken);

  const hasBlockingRisk = useMemo(
    () => Boolean(risk && risk.securityLevel === 'danger'),
    [risk],
  );

  const shouldEnforceDangerGuard = hasBlockingRisk && !dangerProceedAccepted;

  const receiveRiskLevel = useMemo<SecurityLevel | null>(() => {
    if (riskError) return 'caution';
    if (!risk) return null;
    return risk.securityLevel;
  }, [risk, riskError]);

  const hasReviewed = useMemo(() => Boolean(risk), [risk]);

  // Token selector modal context
  const activeChainTokens =
    selectorTarget === 'to' ? toChainTokens : fromChainTokens;
  const activeLoadingDynamicTokens =
    selectorTarget === 'to' ? toLoadingDynamicTokens : fromLoadingDynamicTokens;
  const activeImportTokenByAddress =
    selectorTarget === 'to' ? importToTokenByAddress : importFromTokenByAddress;
  const activeChainId = selectorTarget === 'to' ? toChainId : fromChainId;
  const activeSelectedChainIcon =
    selectorTarget === 'to' ? toSelectedChainIcon : fromSelectedChainIcon;
  const activeSelectedChainKey =
    selectorTarget === 'to' ? toSelectedChainKey : fromSelectedChainKey;
  const runtimeNetworks =
    fromRuntimeNetworks.length > 0 ? fromRuntimeNetworks : toRuntimeNetworks;

  const filteredTokens = useMemo(
    () => filterTokens(activeChainTokens, deferredQuery),
    [deferredQuery, activeChainTokens],
  );

  const activeTokenAddressSet = useMemo(
    () => new Set(activeChainTokens.map((t) => t.address.toLowerCase())),
    [activeChainTokens],
  );

  const importAddress = query.trim();
  const hasTokenWithImportAddress = activeTokenAddressSet.has(
    importAddress.toLowerCase(),
  );
  const canImport = isAddress(importAddress) && !hasTokenWithImportAddress;
  const showImportOption =
    importAddress.length > 0 &&
    filteredTokens.length === 0 &&
    !hasTokenWithImportAddress;

  const normalizedSwapper = useMemo(
    () => resolveSwapperAddress(walletAddress),
    [walletAddress],
  );

  const quoteAmount = useMemo(
    () => toSmallestUnit(fromAmount, selectedFromToken?.decimals),
    [fromAmount, selectedFromToken],
  );

  const { usdValue: fromAmountUsdValue } = useTokenUsdValue({
    chainId: fromChainId,
    tokenAddress: selectedFromToken?.address ?? null,
    amount: fromAmount,
    refetchIntervalMs: 60_000,
  });

  const { usdValue: fromOneTokenUsd } = useTokenUsdValue({
    chainId: fromChainId,
    tokenAddress: selectedFromToken?.address ?? null,
    amount: '1',
    refetchIntervalMs: 300_000,
  });

  const { usdValue: toAmountUsdValue } = useTokenUsdValue({
    chainId: toChainId,
    tokenAddress: selectedToToken?.address ?? null,
    amount: toAmount,
    refetchIntervalMs: 60_000,
  });

  // ── Handlers ────────────────────────────────────────────────────────────────

  const onFromAmountChange = useCallback((value: string) => {
    setFromAmount(value);
    const isEmpty =
      value.trim() === '' || value.trim() === '0' || value.trim() === '0.0';
    if (isEmpty) setToAmount('0.0');
  }, []);

  const onFromUsdChange = useCallback(
    (value: string) => {
      setFromUsdInput(value);
      const numeric = Number(value);
      if (!fromOneTokenUsd || fromOneTokenUsd <= 0 || Number.isNaN(numeric)) {
        setFromAmount('0.0');
        setToAmount('0.0');
        return;
      }
      const tokenAmount = numeric / fromOneTokenUsd;
      const tokenDecimals = selectedFromToken?.decimals ?? 6;
      const normalized = Number.isFinite(tokenAmount)
        ? parseFloat(tokenAmount.toFixed(tokenDecimals)).toString()
        : '0.0';
      setFromAmount(normalized);
    },
    [fromOneTokenUsd, selectedFromToken?.decimals],
  );

  const onToggleFromValueMode = useCallback(
    (currentFromAmountUsdValue: number | null | undefined) => {
      const nextMode = valueMode === 'token' ? 'usd' : 'token';
      if (nextMode === 'usd') {
        if (
          currentFromAmountUsdValue &&
          Number.isFinite(currentFromAmountUsdValue)
        ) {
          setFromUsdInput(currentFromAmountUsdValue.toFixed(2));
        } else {
          setFromUsdInput('');
        }
      }
      setValueMode(nextMode);
    },
    [valueMode],
  );

  const onFlipTokens = useCallback(async () => {
    if (!toToken) return;
    onInvalidate?.();
    clearRiskState();
    setFromChainId(toChainId);
    setToChainId(fromChainId);
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount('0.0');
    setValueMode('token');
    setFromUsdInput('');
    try {
      await checkTokenRisk({ chainId: fromChainId, tokenAddress: fromToken });
    } catch {}
  }, [
    checkTokenRisk,
    clearRiskState,
    fromChainId,
    fromToken,
    onInvalidate,
    toAmount,
    toChainId,
    toToken,
  ]);

  const onSelectToken = useCallback(
    async (address: string) => {
      if (selectorTarget === 'to') clearRiskState();
      onInvalidate?.();

      if (selectorTarget === 'from') {
        setFromToken(address);
        setFromAmount('0.0');
        setToAmount('0.0');
        setValueMode('token');
        setFromUsdInput('');
      }
      if (selectorTarget === 'to') {
        setToToken(address);
        setToAmount('0.0');
      }
      setSelectorTarget(null);
      setNetworkMenuOpen(false);
      setQuery('');
      setImportError(null);

      if (selectorTarget !== 'to') return;
      try {
        await checkTokenRisk({ chainId: toChainId, tokenAddress: address });
      } catch {}
    },
    [checkTokenRisk, clearRiskState, onInvalidate, selectorTarget, toChainId],
  );

  const onQueryChange = useCallback((value: string) => {
    setQuery(value);
    setImportError(null);
  }, []);

  const onImportToken = useCallback(async () => {
    if (!isAddress(importAddress)) {
      setImportError('Enter a valid 0x token contract address.');
      return;
    }
    setImporting(true);
    setImportError(null);
    try {
      const checksummedAddress = getAddress(importAddress);
      const imported = await activeImportTokenByAddress(checksummedAddress);
      await onSelectToken(imported.address);
    } catch (err) {
      setImportError(
        err instanceof Error && err.message
          ? err.message
          : 'Token not found or invalid token address.',
      );
    } finally {
      setImporting(false);
    }
  }, [activeImportTokenByAddress, importAddress, onSelectToken]);

  const onModalChainSelect = useCallback(
    (nextChainId: number) => {
      setQuery('');
      setImportError(null);
      if (selectorTarget === 'from') setFromChainId(nextChainId);
      if (selectorTarget === 'to') setToChainId(nextChainId);
    },
    [selectorTarget],
  );

  const openSelector = useCallback(
    (target: Exclude<SelectorTarget, null>) => {
      onInvalidate?.();
      setQuery('');
      setImportError(null);
      setNetworkMenuOpen(false);
      setSelectorTarget(target);
    },
    [onInvalidate],
  );

  const closeSelector = useCallback(() => {
    setSelectorTarget(null);
    setNetworkMenuOpen(false);
  }, []);

  const onDangerGoBack = useCallback(() => {
    setToToken('');
    setToAmount('0.0');
    clearRiskState();
  }, [clearRiskState]);

  const onDangerProceedAnyway = useCallback(() => {
    setDangerProceedAccepted(true);
    setShowDangerModal(false);
  }, []);

  return {
    // wallet
    primaryWallet,
    user,
    walletAddress,
    setShowAuthFlow,
    normalizedSwapper,

    // token pair
    fromChainId,
    toChainId,
    fromAmount,
    toAmount,
    setToAmount,
    fromToken,
    toToken,
    selectedFromToken,
    selectedToToken,
    hasTokenSelection,
    quoteAmount,

    // value mode
    valueMode,
    fromUsdInput,
    receiveWalletSelection,
    setReceiveWalletSelection,
    receiveWalletAddress,

    // risk
    risk,
    receiveRiskLevel,
    hasReviewed,
    hasBlockingRisk,
    shouldEnforceDangerGuard,
    showDangerModal,
    setShowDangerModal,

    // chain display
    fromSelectedChainIcon,
    toSelectedChainIcon,

    // USD values
    fromAmountUsdValue,
    fromOneTokenUsd,
    toAmountUsdValue,

    // selector modal
    query,
    isSelectorOpen: Boolean(selectorTarget),
    activeChainId,
    activeSelectedChainIcon,
    activeSelectedChainKey,
    runtimeNetworks,
    filteredTokens,
    networkMenuOpen,
    setNetworkMenuOpen,
    showImportOption,
    canImport,
    importing,
    importAddress,
    importError,
    activeLoadingDynamicTokens,

    // handlers
    onFromAmountChange,
    onFromUsdChange,
    onToggleFromValueMode,
    onFlipTokens,
    onSelectToken,
    onQueryChange,
    onImportToken,
    onModalChainSelect,
    openSelector,
    closeSelector,
    onDangerGoBack,
    onDangerProceedAnyway,

    // chain data (for token panel display)
    fromSelectedChainKey,
    toSelectedChainKey,
  };
}

export type TokenPairFormState = ReturnType<typeof useTokenPairForm>;
