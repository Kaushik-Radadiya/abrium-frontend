'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTokenPairForm } from '@/hooks/trade/useTokenPairForm';
import { useRankedRoutesQuery } from '@/hooks/trade/useRankedRoutesQuery';
import { useCountUpValue } from '@/hooks/trade/useCountUpValue';
import { SecurityRiskModal } from '@/components/trade/common/SecurityRiskModal';
import { SwapMainView } from '@/components/trade/swap/SwapMainView';
import { SwapSelectorView } from '@/components/trade/swap/SwapSelectorView';
import { getQuoteErrorMessage } from '@/lib/trade/quoteError';
import { AnimatePresence } from 'framer-motion';
import { buildPriceImpact } from '@/lib/trade/utils';
import { useRouter } from 'next/navigation';
import { useSwapReviewStore } from '@/lib/swapReviewStore';
import { formatAmountFromSmallest } from '@/lib/trade/swapUtils';

export function SwapWorkspace() {
  const router = useRouter();
  const { setReview } = useSwapReviewStore();
  const [hasReviewedQuote, setHasReviewedQuote] = useState(false);

  const form = useTokenPairForm({
    onInvalidate: () => setHasReviewedQuote(false),
  });

  const {
    primaryWallet,
    user,
    setShowAuthFlow,
    fromChainId,
    toChainId,
    fromAmount,
    toAmount,
    setToAmount,
    selectedFromToken,
    selectedToToken,
    hasTokenSelection,
    quoteAmount,
    normalizedSwapper,
    valueMode,
    fromUsdInput,
    receiveWalletSelection,
    setReceiveWalletSelection,
    shouldEnforceDangerGuard,
    showDangerModal,
    setShowDangerModal,
    risk,
    receiveRiskLevel,
    fromAmountUsdValue,
    toAmountUsdValue,
    fromSelectedChainIcon,
    toSelectedChainIcon,
    isSelectorOpen,
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
    onFromAmountChange,
    onFromUsdChange,
    onFlipTokens,
    onSelectToken,
    onQueryChange,
    onImportToken,
    onModalChainSelect,
    openSelector,
    onDangerGoBack,
    onDangerProceedAnyway,
  } = form;

  const currentRouteRequest = useMemo(() => {
    if (
      !form.hasReviewed ||
      !selectedFromToken ||
      !selectedToToken ||
      !quoteAmount ||
      shouldEnforceDangerGuard
    )
      return null;
    return {
      fromChainId,
      toChainId,
      fromToken: selectedFromToken.address,
      toToken: selectedToToken.address,
      fromAmount: quoteAmount,
      userAddress: normalizedSwapper,
    };
  }, [
    form.hasReviewed,
    fromChainId,
    toChainId,
    selectedFromToken,
    selectedToToken,
    quoteAmount,
    normalizedSwapper,
    shouldEnforceDangerGuard,
  ]);

  const {
    data: bestRoute,
    error: routeError,
    isFetching: isBestRouteFetching,
  } = useRankedRoutesQuery(hasReviewedQuote ? currentRouteRequest : null);

  const quoteErrorMessage = useMemo(
    () => getQuoteErrorMessage(routeError),
    [routeError],
  );

  const shouldShowQuote =
    hasTokenSelection &&
    form.hasReviewed &&
    hasReviewedQuote &&
    Boolean(bestRoute) &&
    !quoteErrorMessage &&
    !shouldEnforceDangerGuard;

  useEffect(() => {
    if (!shouldShowQuote || !bestRoute || !selectedToToken) return;
    const nextAmount = formatAmountFromSmallest(
      bestRoute.toAmount,
      selectedToToken.decimals,
    );
    setToAmount((current) => (current === nextAmount ? current : nextAmount));
  }, [shouldShowQuote, bestRoute, selectedToToken, setToAmount]);

  const animatedToAmount = useCountUpValue(toAmount, {
    enabled: shouldShowQuote && !isBestRouteFetching,
    durationMs: 800,
    maxDecimals: selectedToToken?.decimals ?? 6,
  });

  const priceImpact = useMemo(() => {
    return buildPriceImpact({
      shouldShowQuote,
      isQuoteFetching: isBestRouteFetching,
      hasQuote: Boolean(bestRoute),
      fromAmountUsdValue,
      toAmountUsdValue,
    });
  }, [
    shouldShowQuote,
    isBestRouteFetching,
    bestRoute,
    fromAmountUsdValue,
    toAmountUsdValue,
  ]);

  const onToggleFromValueMode = useCallback(
    () => form.onToggleFromValueMode(fromAmountUsdValue),
    [form, fromAmountUsdValue],
  );

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
    if (!currentRouteRequest) {
      setHasReviewedQuote(false);
      return;
    }
    if (hasReviewedQuote && bestRoute) {
      setReview({
        bestRoute,
        fromAmountUSD: fromAmountUsdValue,
        toAmountUSD: toAmountUsdValue,
        fromSymbol: selectedFromToken.symbol,
        toSymbol: selectedToToken.symbol,
        fromDecimals: selectedFromToken.decimals,
        toDecimals: selectedToToken.decimals,
      });
      router.push('/swap/review');
      return;
    }
    setHasReviewedQuote(true);
  }, [
    primaryWallet,
    selectedFromToken,
    selectedToToken,
    shouldEnforceDangerGuard,
    currentRouteRequest,
    hasReviewedQuote,
    bestRoute,
    fromAmountUsdValue,
    toAmountUsdValue,
    setShowAuthFlow,
    setShowDangerModal,
    setReview,
    router,
  ]);

  return (
    <section className='relative h-full'>
      <AnimatePresence initial={false}>
        {!isSelectorOpen ? (
          <SwapMainView
            key='swap-ui'
            fromAmount={fromAmount}
            fromUsdInput={fromUsdInput}
            valueMode={valueMode}
            selectedFromToken={selectedFromToken}
            selectedToToken={selectedToToken}
            fromAmountUsdValue={fromAmountUsdValue}
            toAmountUsdValue={toAmountUsdValue}
            fromSelectedChainIcon={fromSelectedChainIcon}
            toSelectedChainIcon={toSelectedChainIcon}
            toAmount={toAmount}
            animatedToAmount={animatedToAmount}
            isQuoteFetching={isBestRouteFetching}
            shouldShowQuote={shouldShowQuote}
            priceImpact={priceImpact}
            receiveWalletSelection={receiveWalletSelection}
            setReceiveWalletSelection={setReceiveWalletSelection}
            receiveRiskLevel={receiveRiskLevel}
            riskReasons={risk?.reasons}
            shouldEnforceDangerGuard={shouldEnforceDangerGuard}
            quoteErrorMessage={quoteErrorMessage}
            primaryWallet={primaryWallet}
            user={user}
            hasTokenSelection={hasTokenSelection}
            onFromAmountChange={onFromAmountChange}
            onFromUsdChange={onFromUsdChange}
            onToggleFromValueMode={onToggleFromValueMode}
            onFlipTokens={onFlipTokens}
            openSelector={openSelector}
            onPrimaryAction={onPrimaryAction}
          />
        ) : (
          <SwapSelectorView
            key='selector-ui'
            open={isSelectorOpen}
            query={form.query}
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
            onClose={form.closeSelector}
          />
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
