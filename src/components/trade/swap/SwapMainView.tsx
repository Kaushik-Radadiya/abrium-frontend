'use client';

import { ArrowDownUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { TradeSendPanel } from '@/components/trade/common/TradeSendPanel';
import { TradeReceivePanel } from '@/components/trade/common/TradeReceivePanel';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { SwapWorkspaceViewModel } from '@/types/trade/workspace';
import SwapTransactionPanel from '@/components/swap/SwapTransactionPanel';

export function SwapMainView({
  fromAmount,
  fromUsdInput,
  valueMode,
  selectedFromToken,
  selectedToToken,
  fromAmountUsdValue,
  toAmountUsdValue,
  fromSelectedChainIcon,
  toSelectedChainIcon,
  toAmount,
  animatedToAmount,
  isQuoteFetching,
  shouldShowQuote,
  priceImpact,
  receiveWalletSelection,
  setReceiveWalletSelection,
  receiveRiskLevel,
  riskReasons,
  shouldEnforceDangerGuard,
  quoteErrorMessage,
  rateQuote,
  isRateLoading,
  rateErrorMessage,
  primaryWallet,
  user,
  hasTokenSelection,
  onFromAmountChange,
  onFromUsdChange,
  onToggleFromValueMode,
  onFlipTokens,
  openSelector,
  onPrimaryAction,
}: SwapWorkspaceViewModel) {
  const isLoading = isQuoteFetching;
  const primaryActionDisabled = primaryWallet
    ? !hasTokenSelection || isLoading || Boolean(quoteErrorMessage)
    : false;

  return (
    <motion.div
      key='swap-ui'
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className='flex flex-col gap-4 mx-auto w-full'
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
          riskReasons={riskReasons}
          animateRiskBorder={Boolean(receiveRiskLevel)}
        />
      </div>

      {quoteErrorMessage && (
        <div
          role='alert'
          className='flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm'
          style={{
            background: 'var(--no-route-bg, rgba(239,68,68,0.08))',
            border: '1px solid var(--no-route-border, rgba(239,68,68,0.25))',
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
      <SwapTransactionPanel
        fromToken={selectedFromToken}
        toToken={selectedToToken}
        quote={rateQuote}
        isRateLoading={isRateLoading}
        rateErrorMessage={rateErrorMessage}
      />
      <Button
        className={cn(
          'rounded-full justify-center border border-transparent bg-[var(--swap-action-bg)] px-4 py-3 font-medium text-[var(--swap-action-text)] text-base',
          {
            'bg-(--neutral-background-raised) text-(--neutral-text-textWeak) border-(--neutral-color-denger)!':
              shouldEnforceDangerGuard,
          },
        )}
        onClick={onPrimaryAction}
        disabled={primaryActionDisabled}
      >
        {primaryWallet || user
          ? isLoading
            ? 'Fetching Best Route...'
            : quoteErrorMessage
              ? 'No Route Available'
              : shouldShowQuote
                ? 'Confirm Swap'
                : 'Review Swap'
          : 'Connect Wallet'}
      </Button>
    </motion.div>
  );
}
