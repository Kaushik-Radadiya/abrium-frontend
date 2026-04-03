'use client';

import { useCallback, useDeferredValue, useMemo, useState } from 'react';
import { getAddress, isAddress } from 'viem';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { DEFAULT_CHAIN_ID, SUPPORTED_CHAINS } from '@/lib/chains';
import { useTokenRiskMutation } from '@/lib/api-hooks';
import { useSwapData } from '@/hooks/trade/useSwapData';
import { useTokenUsdValue } from '@/hooks/trade/useTokenUsdValue';
import { useSwapQuote } from '@/hooks/trade/useSwapQuote';
import { useCountUpValue } from '@/hooks/trade/useCountUpValue';
import { useFromTokenSync, useToTokenSync } from '@/hooks/trade/useTokenSync';
import { useQuoteReceiveSync } from '@/hooks/trade/useQuoteReceiveSync';
import type { SwapQuoteRequestPayload } from '@/lib/quotes.types';
import {
  resolveSwapperAddress,
  toSmallestUnit,
} from '@/lib/trade/swapUtils';
import { getQuoteErrorMessage } from '@/lib/trade/quoteError';
import { buildSwapQuoteRequest, filterTokens } from '@/lib/trade/workspace';
import type { SecurityLevel } from '@/lib/api';
import type { WalletSelection } from '@/lib/receive-wallet';
import type { SwapWorkspaceViewModel } from '@/types/trade/workspace';

type SelectorTarget = 'from' | 'to' | null;

export function useSwapWorkspace(): SwapWorkspaceViewModel {
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
  const [hasReviewedQuote, setHasReviewedQuote] = useState(false);
  const [receiveWalletSelection, setReceiveWalletSelection] =
    useState<WalletSelection | null>(null);
  const [limitPrice, setLimitPrice] = useState('');
  const receiveWalletAddress = receiveWalletSelection?.address ?? null;

  const {
    chainTokens: fromChainTokens,
    selectedChainKey: fromSelectedChainKey,
    selectedChainIcon: fromSelectedChainIcon,
    uniqueRuntimeNetworks: fromRuntimeNetworks,
    loadingDynamicTokens: fromLoadingDynamicTokens,
    importTokenByAddress: importFromTokenByAddress,
  } = useSwapData({
    chainId: fromChainId,
    staticChains: SUPPORTED_CHAINS,
  });

  const {
    chainTokens: toChainTokens,
    selectedChainKey: toSelectedChainKey,
    selectedChainIcon: toSelectedChainIcon,
    uniqueRuntimeNetworks: toRuntimeNetworks,
    loadingDynamicTokens: toLoadingDynamicTokens,
    importTokenByAddress: importToTokenByAddress,
  } = useSwapData({
    chainId: toChainId,
    staticChains: SUPPORTED_CHAINS,
  });

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

  const filteredTokens = useMemo(() => {
    return filterTokens(activeChainTokens, deferredQuery);
  }, [deferredQuery, activeChainTokens]);

  const activeTokenAddressSet = useMemo(
    () => new Set(activeChainTokens.map((token) => token.address.toLowerCase())),
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

  const currentQuoteRequest = useMemo<SwapQuoteRequestPayload | null>(() => {
    if (
      !hasReviewed ||
      !selectedFromToken ||
      !selectedToToken ||
      !quoteAmount ||
      shouldEnforceDangerGuard
    ) {
      return null;
    }
    return buildSwapQuoteRequest({
      amount: quoteAmount,
      fromChainId,
      fromTokenAddress: selectedFromToken.address,
      toChainId,
      toTokenAddress: selectedToToken.address,
      receiveWalletAddress,
      swapperAddress: normalizedSwapper,
    });
  }, [
    fromChainId,
    hasReviewed,
    normalizedSwapper,
    quoteAmount,
    receiveWalletAddress,
    selectedFromToken,
    selectedToToken,
    shouldEnforceDangerGuard,
    toChainId,
  ]);

  const quoteRequest = hasReviewedQuote ? currentQuoteRequest : null;

  const {
    data: quote,
    error: quoteError,
    isFetching: isQuoteFetching,
  } = useSwapQuote({
    request: quoteRequest,
  });

  const quoteErrorMessage = useMemo(
    () => getQuoteErrorMessage(quoteError),
    [quoteError],
  );

  const shouldShowQuote =
    hasTokenSelection &&
    hasReviewed &&
    hasReviewedQuote &&
    !quoteErrorMessage &&
    !shouldEnforceDangerGuard;

  const animatedToAmount = useCountUpValue(toAmount, {
    enabled: shouldShowQuote && !isQuoteFetching,
    durationMs: 800,
    maxDecimals: selectedToToken?.decimals ?? 6,
  });

  useQuoteReceiveSync(
    shouldShowQuote ? quote : null,
    selectedToToken,
    setToAmount,
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

  const priceImpact = useMemo(() => {
    if (!shouldShowQuote || isQuoteFetching || !quote) return undefined;

    const fromUSD = fromAmountUsdValue;
    const toUSD = toAmountUsdValue;
    if (!fromUSD || !toUSD || fromUSD <= 0) return undefined;

    const diff = toUSD - fromUSD;
    const pct = (diff / fromUSD) * 100;
    const pctSign = diff < 0 ? '-' : '';
    const toUSDDecimals =
      toUSD >= 0.01 ? 2 : Math.ceil(-Math.log10(Math.abs(toUSD))) + 1;
    const absDiff = Math.abs(diff);
    const diffDecimals =
      absDiff === 0
        ? 2
        : absDiff >= 0.01
          ? 2
          : Math.ceil(-Math.log10(absDiff)) + 1;
    const diffSign = diff < 0 ? '-' : '+';

    return {
      usdLabel: `~$${toUSD.toFixed(toUSDDecimals)}`,
      pctLabel: `(${pctSign}${Math.abs(pct).toFixed(2)}%)`,
      dollarTooltip: `(${diffSign}$${absDiff.toFixed(diffDecimals)})`,
    };
  }, [
    fromAmountUsdValue,
    isQuoteFetching,
    quote,
    shouldShowQuote,
    toAmountUsdValue,
  ]);

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

  const onToggleFromValueMode = useCallback(() => {
    const nextMode = valueMode === 'token' ? 'usd' : 'token';

    if (nextMode === 'usd') {
      if (fromAmountUsdValue && Number.isFinite(fromAmountUsdValue)) {
        setFromUsdInput(fromAmountUsdValue.toFixed(2));
      } else {
        setFromUsdInput('');
      }
    }

    setValueMode(nextMode);
  }, [fromAmountUsdValue, valueMode]);

  const onFlipTokens = useCallback(async () => {
    if (!toToken) return;

    setHasReviewedQuote(false);
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
      await checkTokenRisk({
        chainId: fromChainId,
        tokenAddress: fromToken,
      });
    } catch {}
  }, [
    checkTokenRisk,
    clearRiskState,
    fromChainId,
    fromToken,
    toAmount,
    toChainId,
    toToken,
  ]);

  const onSelectToken = useCallback(
    async (address: string) => {
      if (selectorTarget === 'to') clearRiskState();
      setHasReviewedQuote(false);

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
        await checkTokenRisk({
          chainId: toChainId,
          tokenAddress: address,
        });
      } catch {}
    },
    [checkTokenRisk, clearRiskState, selectorTarget, toChainId],
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

  const onPrimaryAction = useCallback(() => {
    if (!primaryWallet) {
      setShowAuthFlow(true);
      return;
    }

    if (!selectedFromToken || !selectedToToken) return;

    if (shouldEnforceDangerGuard) {
      setShowDangerModal(true);
      return;
    }

    if (!currentQuoteRequest) {
      setHasReviewedQuote(false);
      return;
    }

    setHasReviewedQuote(true);
  }, [
    currentQuoteRequest,
    primaryWallet,
    selectedFromToken,
    selectedToToken,
    setShowAuthFlow,
    shouldEnforceDangerGuard,
  ]);

  const onDangerGoBack = useCallback(() => {
    setToToken('');
    setToAmount('0.0');
    clearRiskState();
  }, [clearRiskState]);

  const onDangerProceedAnyway = useCallback(() => {
    setDangerProceedAccepted(true);
    setShowDangerModal(false);
  }, []);

  const onModalChainSelect = useCallback(
    (nextChainId: number) => {
      setQuery('');
      setImportError(null);
      if (selectorTarget === 'from') setFromChainId(nextChainId);
      if (selectorTarget === 'to') setToChainId(nextChainId);
    },
    [selectorTarget],
  );

  const openSelector = useCallback((target: Exclude<SelectorTarget, null>) => {
    setHasReviewedQuote(false);
    setQuery('');
    setImportError(null);
    setNetworkMenuOpen(false);
    setSelectorTarget(target);
  }, []);

  const closeSelector = useCallback(() => {
    setSelectorTarget(null);
    setNetworkMenuOpen(false);
  }, []);

  const isSelectorOpen = Boolean(selectorTarget);
  const receiveValueMode = selectedToToken ? valueMode : 'token';

  const primaryActionDisabled =
    primaryWallet
      ? !hasTokenSelection || isQuoteFetching || Boolean(quoteErrorMessage)
      : false;

  const primaryActionLabel =
    primaryWallet || user
      ? isQuoteFetching
        ? 'Fetching Quote...'
        : quoteErrorMessage
          ? 'No Route Available'
          : 'Review Swap'
      : 'Connect Wallet';

  return {
    fromAmount,
    fromUsdInput,
    sendAmount: valueMode === 'token' ? fromAmount : fromUsdInput,
    toAmount,
    animatedToAmount,
    valueMode,
    receiveValueMode,
    limitPrice,
    setLimitPrice,

    selectedFromToken,
    selectedToToken,
    fromSelectedChainIcon,
    toSelectedChainIcon,

    fromAmountUsdValue,
    toAmountUsdValue,
    priceImpact,

    selectorTarget,
    isSelectorOpen,
    openSelector,
    closeSelector,
    query,
    onQueryChange,
    activeChainId,
    activeSelectedChainIcon,
    activeSelectedChainKey,
    networkMenuOpen,
    setNetworkMenuOpen,
    runtimeNetworks,
    filteredTokens,
    onModalChainSelect,
    onSelectToken,
    activeLoadingDynamicTokens,
    showImportOption,
    canImport,
    importing,
    importAddress,
    onImportToken,
    importError,

    onFromAmountChange,
    onFromUsdChange,
    onToggleFromValueMode,
    onFlipTokens,

    receiveWalletSelection,
    setReceiveWalletSelection,
    isQuoteFetching,
    shouldShowQuote,
    quoteErrorMessage,
    receiveRiskLevel,
    risk: risk
      ? {
          securityLevel: risk.securityLevel,
          reasons: risk.reasons,
        }
      : null,
    shouldEnforceDangerGuard,

    primaryActionLabel,
    primaryActionDisabled,
    onPrimaryAction,

    showDangerModal,
    setShowDangerModal,
    onDangerGoBack,
    onDangerProceedAnyway,
  };
}
