'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDownUp } from 'lucide-react';
import { SecurityRiskModal } from '@/components/trade/common/SecurityRiskModal';
import { TradeTokenPanel } from '@/components/trade/common/TradeTokenPanel';
import { TradeWorkspaceSelectorView } from '@/components/trade/common/TradeWorkspaceSelectorView';
import { Button } from '@/components/ui/Button';
import { useSwapWorkspace } from '@/hooks/trade/useSwapWorkspace';
import { cn } from '@/lib/utils';
import { EXPIRY_OPTIONS } from '@/lib/constant/trade';
import { LimitPriceCard } from '@/components/trade/limit/LimitPriceCard';
import { ExpirySelector } from '@/components/trade/limit/ExpirySelector';

export function LimitWorkspace() {
  const workspace = useSwapWorkspace();
  const [activeExpiry, setActiveExpiry] = useState<string>(EXPIRY_OPTIONS[1]);
  const actionLabel =
    workspace.primaryActionLabel === 'Review Swap'
      ? 'Confirm'
      : workspace.primaryActionLabel;

  return (
    <section className='relative h-full'>
      <AnimatePresence initial={false}>
        {!workspace.isSelectorOpen ? (
          <motion.div
            key='limit-ui'
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className='mx-auto flex w-full flex-col gap-4 min-[1441px]:min-w-110 xl:max-w-95 min-[1441px]:max-w-max sm:max-w-90'
          >
            <LimitPriceCard workspace={workspace} />

            <div className='flex flex-col gap-1'>
              <TradeTokenPanel
                label='Sell'
                amount={workspace.sendAmount}
                amountDisplayMode={workspace.valueMode}
                token={workspace.selectedFromToken}
                usdValue={workspace.fromAmountUsdValue}
                selectedChainIcon={workspace.fromSelectedChainIcon}
                onSelectToken={() => workspace.openSelector('from')}
                editable
                onAmountChange={
                  workspace.valueMode === 'token'
                    ? workspace.onFromAmountChange
                    : workspace.onFromUsdChange
                }
                bottomLabel='Balance: <0.001'
              />

              <Button
                className='-my-5 z-10 relative hover:rotate-180 transition-transform duration-300 size-10 flex items-center justify-center mx-auto rounded-full border border-(--swap-divider-border) bg-(--neutral-background-raised) text-[24px] shadow-[0_0_0_4.5px_var(--swap-panel-bg)]'
                onClick={workspace.onFlipTokens}
                aria-label='Swap tokens'
              >
                <ArrowDownUp className='text-(--arrow-icon-btn) size-4' />
              </Button>

              <TradeTokenPanel
                label='Buy'
                amount={workspace.toAmount}
                token={workspace.selectedToToken}
                usdValue={workspace.toAmountUsdValue}
                selectedChainIcon={workspace.toSelectedChainIcon}
                onSelectToken={() => workspace.openSelector('to')}
                loading={workspace.isQuoteFetching && workspace.shouldShowQuote}
              />
            </div>

            <ExpirySelector
              value={activeExpiry}
              onChange={(next) => setActiveExpiry(next)}
            />

            <Button
              className={cn(
                'justify-center rounded-full border border-transparent bg-[var(--swap-action-bg)] px-4 py-3 text-base font-medium text-[var(--swap-action-text)]',
                {
                  'bg-(--neutral-background-raised) text-(--neutral-text-textWeak) border-(--neutral-color-denger)!':
                    workspace.shouldEnforceDangerGuard,
                },
              )}
              onClick={workspace.onPrimaryAction}
              disabled={workspace.primaryActionDisabled}
            >
              {actionLabel}
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
            <TradeWorkspaceSelectorView workspace={workspace} />
          </motion.div>
        )}
      </AnimatePresence>
      <SecurityRiskModal
        open={workspace.showDangerModal}
        onOpenChange={workspace.setShowDangerModal}
        reasons={workspace.risk?.reasons}
        onGoBack={workspace.onDangerGoBack}
        onProceedAnyway={workspace.onDangerProceedAnyway}
      />
    </section>
  );
}
