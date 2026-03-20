'use client';

import { useCallback, useMemo, useState } from 'react';
import { ArrowDownUp } from 'lucide-react';
import { useTokenPairForm } from '@/hooks/trade/useTokenPairForm';
import { useSwapQuote } from '@/hooks/trade/useSwapQuote';
import { useQuoteReceiveSync } from '@/hooks/trade/useQuoteReceiveSync';
import { useCountUpValue } from '@/hooks/trade/useCountUpValue';
import { SecurityRiskModal } from '@/components/trade/common/SecurityRiskModal';
import { TradeTokenSelectorModal } from '@/components/trade/common/TradeTokenSelectorModal';
import { TradeSendPanel } from '@/components/trade/common/TradeSendPanel';
import { TradeReceivePanel } from '@/components/trade/common/TradeReceivePanel';
import { Button } from '@/components/ui/Button';
import { buildSwapQuoteRequest } from '@/lib/trade/workspace';
import { getQuoteErrorMessage } from '@/lib/trade/quoteError';
import type { SwapQuoteRequestPayload } from '@/lib/quotes.types';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export function SwapWorkspace() {
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
  } = useSwapQuote({ request: hasReviewedQuote ? currentQuoteRequest : null });

  const quoteErrorMessage = useMemo(
    () => getQuoteErrorMessage(quoteError),
    [quoteError],
  );

  const shouldShowQuote =
    hasTokenSelection &&
    form.hasReviewed &&
    hasReviewedQuote &&
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
    if (!currentQuoteRequest) {
      setHasReviewedQuote(false);
      return;
    }
    setHasReviewedQuote(true);
  }, [
    primaryWallet,
    selectedFromToken,
    selectedToToken,
    shouldEnforceDangerGuard,
    currentQuoteRequest,
    setShowAuthFlow,
    setShowDangerModal,
  ]);

  const receiveValueMode = selectedToToken ? valueMode : 'token';
  const isLoading = isQuoteFetching;

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
              <TradeSendPanel
                amount={fromAmount}
                usdInput={fromUsdInput}
                valueMode={valueMode}
                token={selectedFromToken}
                usdValue={fromAmountUsdValue}
                chainIcon={fromSelectedChainIcon}
                onSelectToken={() => openSelector('from')}
                onAmountChange={onFromAmountChange}
                onUsdChange={onFromUsdChange}
                onToggleValueMode={onToggleFromValueMode}
              />

              <Button
                className='-my-5 z-10 relative hover:rotate-180 transition-transform duration-300 size-10 flex items-center justify-center mx-auto rounded-full border border-(--swap-divider-border) bg-(--neutral-background-raised) text-[24px] shadow-[0_0_0_4.5px_var(--swap-panel-bg)]'
                onClick={onFlipTokens}
                aria-label='Swap tokens'
              >
                <ArrowDownUp className='text-(--arrow-icon-btn) size-4' />
              </Button>

              <TradeReceivePanel
                amount={toAmount}
                displayAmount={animatedToAmount}
                valueMode={valueMode}
                token={selectedToToken}
                usdValue={toAmountUsdValue}
                chainIcon={toSelectedChainIcon}
                onSelectToken={() => openSelector('to')}
                loading={isQuoteFetching && shouldShowQuote}
                priceImpact={priceImpact}
                receiveWalletSelection={receiveWalletSelection}
                onReceiveWalletChange={setReceiveWalletSelection}
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
                    isLoading ||
                    Boolean(quoteErrorMessage)
                  : false
              }
            >
              {primaryWallet || user
                ? isLoading
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
            <TradeTokenSelectorModal
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
