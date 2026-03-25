'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTokenPairForm } from '@/hooks/trade/useTokenPairForm';
import { useSwapQuote } from '@/hooks/trade/useSwapQuote';
import { useQuoteReceiveSync } from '@/hooks/trade/useQuoteReceiveSync';
import { useCountUpValue } from '@/hooks/trade/useCountUpValue';
import { SecurityRiskModal } from '@/components/trade/common/SecurityRiskModal';
import { LimitMainView } from '@/components/trade/limit/LimitMainView';
import { LimitSelectorView } from '@/components/trade/limit/LimitSelectorView';
import { buildSwapQuoteRequest } from '@/lib/trade/workspace';
import { getQuoteErrorMessage } from '@/lib/trade/quoteError';
import type { SwapQuoteRequestPayload } from '@/lib/quotes.types';
import { AnimatePresence } from 'framer-motion';
import { buildPriceImpact } from '@/lib/trade/utils';

export function LimitWorkspace() {
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
    receiveWalletAddress,
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
    fromOneTokenUsd,
    toOneTokenUsd,
  } = form;

  const currentQuoteRequest = useMemo<SwapQuoteRequestPayload | null>(() => {
    
    if (
      !form.hasReviewed ||
      !selectedFromToken ||
      !selectedToToken ||
      !quoteAmount ||
      shouldEnforceDangerGuard
    )
      return null;
      
    
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
    form.hasReviewed,
    fromChainId,
    toChainId,
    selectedFromToken,
    selectedToToken,
    quoteAmount,
    receiveWalletAddress,
    normalizedSwapper,
    shouldEnforceDangerGuard,
  ]);

  const {
    data: quote,
    error: quoteError,
    isFetching: isQuoteFetching,
  } = useSwapQuote({ request: currentQuoteRequest });

  const quoteErrorMessage = useMemo(
    () => getQuoteErrorMessage(quoteError),
    [quoteError],
  );

  const shouldShowQuote =
    hasTokenSelection &&
    form.hasReviewed &&
    !quoteErrorMessage &&
    !shouldEnforceDangerGuard;

  useQuoteReceiveSync(
    shouldShowQuote ? quote : null,
    selectedToToken,
    setToAmount,
  );
  const animatedToAmount = useCountUpValue(toAmount, {
    enabled: shouldShowQuote && !isQuoteFetching,
    durationMs: 800,
    maxDecimals: selectedToToken?.decimals ?? 6,
  });

  const priceImpact = useMemo(() => {
    return buildPriceImpact({
      shouldShowQuote,
      isQuoteFetching,
      hasQuote: Boolean(quote),
      fromAmountUsdValue,
      toAmountUsdValue,
    });
  }, [
    shouldShowQuote,
    isQuoteFetching,
    quote,
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
    
    setHasReviewedQuote(true);
  }, [
    primaryWallet,
    selectedFromToken,
    selectedToToken,
    shouldEnforceDangerGuard,
    setShowAuthFlow,
    setShowDangerModal,
  ]);

    const liveExchangeRate = useMemo(() => {
      if (form.fromOneTokenUsd && form.toOneTokenUsd && form.toOneTokenUsd > 0) {
        return form.fromOneTokenUsd / form.toOneTokenUsd;
      }
      return 0;
    }, [form.fromOneTokenUsd, form.toOneTokenUsd]);

    const [selectedPercent, setSelectedPercent] = useState<string>('M');
    const [isPriceInverted, setIsPriceInverted] = useState(false);
    const [isReversed, setIsReversed] = useState(false);
    const [expiry, setExpiry] = useState('1 week');
  
    const [customPriceInput, setCustomPriceInput] = useState<string>('');
    const [userTypedBasePrice, setUserTypedBasePrice] = useState<number | null>(null);
  
    const livePrice = useMemo(() => {
      const baseLive = Number(liveExchangeRate || 0);
      if (!baseLive) return 0;
      return isPriceInverted ? 1 / baseLive : baseLive;
    }, [liveExchangeRate, isPriceInverted]);
  
    useEffect(() => {
      if (selectedPercent === 'M' && livePrice > 0 && userTypedBasePrice === null) {
        setCustomPriceInput(livePrice.toFixed(18).replace(/\.?0+$/, ''));
      }
      if (livePrice === 0 && selectedPercent === 'M' && userTypedBasePrice === null) {
        setCustomPriceInput('');
      }
    }, [livePrice, selectedPercent, userTypedBasePrice]);

    const handlePercentChange = useCallback((val: string) => {
      setSelectedPercent(val);
  
      if (val === 'M') {
        setUserTypedBasePrice(null);
        if (livePrice > 0) {
          setCustomPriceInput(livePrice.toFixed(18).replace(/\.?0+$/, ''));
        } else {
          setCustomPriceInput('');
        }
        return;
      }
  
      const pctNumber = Number(val);
      if (!isNaN(pctNumber)) {
        const currentBase = userTypedBasePrice !== null ? userTypedBasePrice : livePrice;
        if (currentBase > 0) {
          const multiplier = 1 + (isReversed ? -pctNumber : pctNumber) / 100;
          const newPrice = currentBase * multiplier;
          setCustomPriceInput(newPrice.toFixed(18).replace(/\.?0+$/, ''));
        }
      }
    }, [livePrice, userTypedBasePrice, isReversed]);

    const finalPrice = useMemo(() => {
      return Number(customPriceInput) || 0;
    }, [customPriceInput]);
  
    const calculatedBuyAmount = useMemo(() => {
      if (!fromAmount || !finalPrice || finalPrice === 0) return '';
      // If not inverted (When 1 ToToken = X FromToken) -> Buy Amount = Send Amount / Price
      // If inverted (When 1 FromToken = Y ToToken) -> Buy Amount = Send Amount * Price
      const amount = isPriceInverted
        ? Number(fromAmount) * finalPrice
        : Number(fromAmount) / finalPrice;
      return amount.toFixed(18).replace(/\.?0+$/, '');
    }, [fromAmount, finalPrice, isPriceInverted]);
  
    const handlePanelArrowClick = useCallback(() => {
      setIsPriceInverted((prev) => !prev);
      setIsReversed((prev) => !prev);
      setSelectedPercent('M');
      setUserTypedBasePrice(null);
    }, []);
  
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      setCustomPriceInput(e.target.value);
      setUserTypedBasePrice(Number(e.target.value) || 0);
      setSelectedPercent('');
    }, []);

    const marketOptions = useMemo(() => [
      { label: 'Market', value: 'M' },
      { label: `${isReversed ? '-' : '+'}1%`, value: '1' },
      { label: `${isReversed ? '-' : '+'}5%`, value: '5' },
      { label: `${isReversed ? '-' : '+'}10%`, value: '10' },
    ], [isReversed]);
  
    const expiryOptions = useMemo(() => [
      { label: '1 day', value: '1 day' },
      { label: '1 week', value: '1 week' },
      { label: '1 month', value: '1 month' },
      { label: '1 year', value: '1 year' },
    ], []);

    const workspaceProps = {
      livePrice: liveExchangeRate,
      sendAmount: fromAmount,
      receiveAmount: toAmount,
      fromAmount,
      toAmount,
      animatedToAmount,
      fromUsdInput,
      valueMode,
      receiveValueMode: valueMode,
      selectedFromToken,
      selectedToToken,
      fromAmountUsdValue,
      toAmountUsdValue,
      fromSelectedChainIcon,
      toSelectedChainIcon,
      hasTokenSelection,

      isQuoteFetching,
      shouldShowQuote,
      priceImpact,
      quoteErrorMessage,

      receiveWalletSelection,
      setReceiveWalletSelection,
      receiveRiskLevel,
      riskReasons: risk?.reasons,
      shouldEnforceDangerGuard,
      primaryWallet,
      user,

      onFromAmountChange,
      onFromUsdChange,
      onToggleFromValueMode,
      onFlipTokens,
      openSelector,
      onPrimaryAction,

      // UI States
      selectedPercent,
      isPriceInverted,
      isReversed,
      expiry,
      customPriceInput,
      handlePercentChange,
      handlePanelArrowClick,
      handleInputChange,
      setExpiry,
      calculatedBuyAmount,
      marketOptions,
      expiryOptions,
      
      primaryActionDisabled: primaryWallet ? (!hasTokenSelection || isQuoteFetching) : false,
      primaryActionLabel: primaryWallet ? (isQuoteFetching ? 'Fetching Price...' : 'Review Limit') : 'Connect Wallet'
    };

  return (
    <section className='relative h-full'>
      <AnimatePresence initial={false}>
        {!isSelectorOpen ? (
          <LimitMainView 
          workspace={workspaceProps}

          fromAmount={fromAmount}
            fromUsdInput={fromUsdInput}
            valueMode={valueMode}
             selectedToToken={selectedToToken}
             selectedFromToken={selectedFromToken}
             fromAmountUsdValue={fromAmountUsdValue}
            toAmountUsdValue={toAmountUsdValue}
            fromSelectedChainIcon={fromSelectedChainIcon}
            toSelectedChainIcon={toSelectedChainIcon}
             receiveRiskLevel={receiveRiskLevel}
             riskReasons={risk?.reasons}
            priceImpact={priceImpact}
            shouldShowQuote={shouldShowQuote}
            isQuoteFetching={isQuoteFetching}
             onFromAmountChange={onFromAmountChange}
            onFromUsdChange={onFromUsdChange}
             onToggleFromValueMode={onToggleFromValueMode}
           receiveWalletSelection={receiveWalletSelection}
            setReceiveWalletSelection={setReceiveWalletSelection}
            openSelector={openSelector}
            onFlipTokens={onFlipTokens}
           />
        ) : (
          <LimitSelectorView
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
