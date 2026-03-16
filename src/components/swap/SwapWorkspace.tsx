'use client';

import { useCallback, useDeferredValue, useMemo, useState } from 'react';
import { ArrowDownUp } from 'lucide-react';
import { getAddress, isAddress } from 'viem';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { DEFAULT_CHAIN_ID, SUPPORTED_CHAINS } from '@/lib/chains';
import { useTokenRiskMutation } from '@/lib/api-hooks';
import { SecurityRiskModal } from '@/components/swap/SecurityRiskModal';
import { SwapTokenPanel } from '@/components/swap/SwapTokenPanel';
import { TokenSelectorModal } from '@/components/swap/TokenSelectorModal';
import { useSwapData } from '@/components/swap/hooks/useSwapData';
import { useTokenUsdValue } from '@/components/swap/hooks/useTokenUsdValue';
import { useSwapQuote } from '@/components/swap/hooks/useSwapQuote';
import { useCountUpValue } from '@/components/swap/hooks/useCountUpValue';
import {
  useFromTokenSync,
  useToTokenSync,
} from '@/components/swap/hooks/useTokenSync';
import { useQuoteReceiveSync } from '@/components/swap/hooks/useQuoteReceiveSync';
import type { SwapQuoteRequestPayload } from '@/lib/quotes.types';
import { Button } from '@/components/ui/Button';
import {
  resolveSwapperAddress,
  sortTokensByBalance,
  toSmallestUnit,
} from '@/components/swap/utils/swapUtils';
import { getQuoteErrorMessage } from '@/components/swap/utils/quoteError';
import { motion, AnimatePresence } from 'framer-motion';
import { formatAmount, formatUsd } from '@/lib/formatAmount';
import type { SecurityLevel } from '@/lib/api';
import type { WalletSelection } from '@/lib/receive-wallet';
import { cn } from '@/lib/utils';

type SelectorTarget = 'from' | 'to' | null;

export function SwapWorkspace() {
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
  const [fromValueMode, setFromValueMode] = useState<'token' | 'usd'>('token');
  const [fromUsdInput, setFromUsdInput] = useState('');
  const [showDangerModal, setShowDangerModal] = useState(false);
  const [dangerProceedAccepted, setDangerProceedAccepted] = useState(false);
  const [hasReviewedQuote, setHasReviewedQuote] = useState(false);
  const [receiveWalletSelection, setReceiveWalletSelection] =
    useState<WalletSelection | null>(null);
  const receiveWalletAddress = receiveWalletSelection?.address ?? null;

  const {
    chainTokens: fromChainTokens,
    selectedChainKey: fromSelectedChainKey,
    selectedChainIcon: fromSelectedChainIcon,
    uniqueRuntimeNetworks: fromRuntimeNetworks,
    loadingDynamicTokens: fromLoadingDynamicTokens,
    balances: fromBalances,
    importTokenByAddress: importFromTokenByAddress,
  } = useSwapData({
    chainId: fromChainId,
    staticChains: SUPPORTED_CHAINS,
    walletAddress,
    selectedFromToken: fromToken,
    selectedToToken: fromToken,
  });

  const {
    chainTokens: toChainTokens,
    selectedChainKey: toSelectedChainKey,
    selectedChainIcon: toSelectedChainIcon,
    uniqueRuntimeNetworks: toRuntimeNetworks,
    loadingDynamicTokens: toLoadingDynamicTokens,
    balances: toBalances,
    importTokenByAddress: importToTokenByAddress,
  } = useSwapData({
    chainId: toChainId,
    staticChains: SUPPORTED_CHAINS,
    walletAddress: receiveWalletAddress ?? walletAddress,
    selectedFromToken: toToken || undefined,
    selectedToToken: toToken || undefined,
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

  // Token selector modal context
  const activeChainTokens =
    selectorTarget === 'to' ? toChainTokens : fromChainTokens;
  const activeBalances = selectorTarget === 'to' ? toBalances : fromBalances;
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

  const sortedTokens = useMemo(
    () => sortTokensByBalance(activeChainTokens, activeBalances),
    [activeChainTokens, activeBalances],
  );

  const filteredTokens = useMemo(() => {
    const value = deferredQuery.trim().toLowerCase();
    if (!value) return sortedTokens;
    return sortedTokens.filter(
      (token) =>
        token.symbol.toLowerCase().includes(value) ||
        token.name.toLowerCase().includes(value) ||
        token.address.toLowerCase().includes(value),
    );
  }, [deferredQuery, sortedTokens]);

  const activeTokenAddressSet = useMemo(
    () =>
      new Set(activeChainTokens.map((token) => token.address.toLowerCase())),
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

  // Quote
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
    return {
      amount: quoteAmount,
      recipient: receiveWalletAddress ?? normalizedSwapper,
      swapper: normalizedSwapper,
      tokenIn: selectedFromToken.address,
      tokenInChainId: fromChainId,
      tokenOut: selectedToToken.address,
      tokenOutChainId: toChainId,
    };
  }, [
    fromChainId,
    shouldEnforceDangerGuard,
    hasReviewed,
    normalizedSwapper,
    quoteAmount,
    receiveWalletAddress,
    selectedFromToken,
    selectedToToken,
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
    maxDecimals: 6,
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

  const priceImpactLabel = useMemo(() => {
    if (!shouldShowQuote || isQuoteFetching || !quote) return undefined;
    const fromUSD = fromAmountUsdValue;
    const toUSD = toAmountUsdValue;
    if (!fromUSD || !toUSD || fromUSD <= 0) return undefined;
    const diff = toUSD - fromUSD;
    const pct = (diff / fromUSD) * 100;
    const pctSign = diff < 0 ? '-' : '';
    const toUSDDecimals =
      toUSD >= 0.01 ? 2 : Math.ceil(-Math.log10(Math.abs(toUSD))) + 1;
    return `$${toUSD.toFixed(toUSDDecimals)} (${pctSign}${Math.abs(pct).toFixed(2)}%)`;
  }, [shouldShowQuote, isQuoteFetching, quote, fromAmountUsdValue, toAmountUsdValue]);

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
      const normalized = Number.isFinite(tokenAmount)
        ? parseFloat(tokenAmount.toFixed(6)).toString()
        : '0.0';
      setFromAmount(normalized);
    },
    [fromOneTokenUsd],
  );

  const onToggleFromValueMode = useCallback(() => {
    setFromValueMode((previous) => {
      if (previous === 'token') {
        if (fromAmountUsdValue && Number.isFinite(fromAmountUsdValue)) {
          setFromUsdInput(String(fromAmountUsdValue));
        } else {
          setFromUsdInput('');
        }
        return 'usd';
      }
      return 'token';
    });
  }, [fromAmountUsdValue]);

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
    setFromValueMode('token');
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
      // Risk data is tied to the "to" token — only clear it when that changes.
      if (selectorTarget === 'to') clearRiskState();
      setHasReviewedQuote(false);

      if (selectorTarget === 'from') {
        // Changing the Send token invalidates any previous quote output
        setFromToken(address);
        setFromAmount('0.0');
        setToAmount('0.0');
      }
      if (selectorTarget === 'to') {
        setToToken(address);
        setToAmount('0.0');
      }
      if (selectorTarget === 'from') {
        setFromValueMode('token');
        setFromUsdInput('');
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
      } catch {
        // handled via mutation error state
      }
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
    setHasReviewedQuote,
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

  const isSelectorOpen = Boolean(selectorTarget);
  return (
    <section className='relative h-full'>
      <AnimatePresence initial={false}>
        {!isSelectorOpen ? (
          <motion.div
            key='swap-ui'
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className='absolute inset-0 flex flex-col gap-4 mx-auto min-[1441px]:min-w-110 xl:max-w-95 min-[1441px]:max-w-max sm:max-w-90 w-full'
          >
            <div className='flex flex-col gap-1'>
              <SwapTokenPanel
                label='Send'
                amount={fromValueMode === 'token' ? fromAmount : fromUsdInput}
                token={selectedFromToken}
                usdValue={fromAmountUsdValue}
                selectedChainIcon={fromSelectedChainIcon}
                onSelectToken={() => openSelector('from')}
                editable
                onAmountChange={
                  fromValueMode === 'token'
                    ? onFromAmountChange
                    : onFromUsdChange
                }
                bottomLabel={
                  fromValueMode === 'usd' && selectedFromToken
                    ? `~${formatAmount(fromAmount)} ${selectedFromToken.symbol}`
                    : undefined
                }
                onToggleValueDisplay={onToggleFromValueMode}
              />

              <Button
                className='-my-5 z-10 relative hover:rotate-180 transition-transform duration-300 size-10 flex items-center justify-center mx-auto rounded-full border border-(--swap-divider-border) bg-(--neutral-background-raised) text-[24px] shadow-[0_0_0_4.5px_var(--swap-panel-bg)]'
                onClick={onFlipTokens}
                aria-label='Swap tokens'
              >
                <ArrowDownUp className='text-(--arrow-icon-btn) size-4' />
              </Button>

              <SwapTokenPanel
                label='Receive'
                amount={animatedToAmount}
                token={selectedToToken}
                usdValue={toAmountUsdValue}
                selectedChainIcon={toSelectedChainIcon}
                onSelectToken={() => openSelector('to')}
                bottomLabel={
                  priceImpactLabel ??
                  formatUsd(toAmountUsdValue) ??
                  undefined
                }
                onReceiveWalletChange={setReceiveWalletSelection}
                receiveWalletSelection={receiveWalletSelection}
                loading={isQuoteFetching && shouldShowQuote}
                riskLevel={receiveRiskLevel}
                riskReasons={risk?.reasons}
                animateRiskBorder={Boolean(receiveRiskLevel)}
              />
            </div>

            {quoteErrorMessage && (
              <div
                role='alert'
                className='flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm'
                style={{
                  background: 'var(--no-route-bg, rgba(239,68,68,0.08))',
                  border:
                    '1px solid var(--no-route-border, rgba(239,68,68,0.25))',
                  color: 'var(--no-route-text, #ef4444)',
                }}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                  className='mt-0.5 size-4 shrink-0'
                  aria-hidden='true'
                >
                  <path
                    fillRule='evenodd'
                    d='M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z'
                    clipRule='evenodd'
                  />
                </svg>
                <span>{quoteErrorMessage}</span>
              </div>
            )}

            <Button
              className={cn(
                'rounded-full justify-center border border-transparent bg-[var(--swap-action-bg)] px-4 py-3 font-medium text-[var(--swap-action-text)] text-base',
                {
                  'bg-(--neutral-background-raised) text-(--neutral-text-textWeak) border-(--neutral-color-denger)!':
                    shouldEnforceDangerGuard,
                },
              )}
              onClick={onPrimaryAction}
              disabled={
                primaryWallet
                  ? !hasTokenSelection ||
                    isQuoteFetching ||
                    Boolean(quoteErrorMessage)
                  : false
              }
            >
              {primaryWallet || user
                ? isQuoteFetching
                  ? 'Fetching Quote...'
                  : quoteErrorMessage
                    ? 'No Route Available'
                    : 'Review Swap'
                : 'Connect Wallet'}
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key='selector-ui'
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className='absolute inset-0 flex flex-col gap-4'
          >
            <TokenSelectorModal
              open={isSelectorOpen}
              query={query}
              onQueryChange={onQueryChange}
              chainId={activeChainId}
              selectedChainIcon={activeSelectedChainIcon}
              selectedChainKey={activeSelectedChainKey}
              networkMenuOpen={networkMenuOpen}
              setNetworkMenuOpen={setNetworkMenuOpen}
              networks={runtimeNetworks}
              onChainSelect={onModalChainSelect}
              tokens={filteredTokens}
              onSelectToken={onSelectToken}
              loadingDynamicTokens={activeLoadingDynamicTokens}
              showImportOption={showImportOption}
              canImport={canImport}
              importing={importing}
              importAddress={importAddress}
              onImportToken={onImportToken}
              importError={importError}
              onClose={() => {
                setSelectorTarget(null);
                setNetworkMenuOpen(false);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <SecurityRiskModal
        open={showDangerModal}
        onOpenChange={setShowDangerModal}
        reasons={risk?.reasons}
        onGoBack={onDangerGoBack}
        onProceedAnyway={onDangerProceedAnyway}
      />
    </section>
  );
}
