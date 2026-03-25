'use client';

import { Button } from '@/components/ui/Button';
import { PillRadioGroup } from '@/components/ui/radio-group';
import { ArrowDownUp, ArrowDown, X, ChevronDown } from 'lucide-react';
import { useState, useEffect, useMemo, useRef } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { TradeSendPanel } from '../common/TradeSendPanel';
import { TradeReceivePanel } from '../common/TradeReceivePanel';

export function LimitMainView({
  workspace,
  fromAmount,
  fromUsdInput,
  fromSelectedChainIcon,
  selectedFromToken,
  toAmount,
  valueMode,
  animatedToAmount,
  selectedToToken,
  toAmountUsdValue,
  isQuoteFetching,
  priceImpact,
  receiveWalletSelection,
  shouldShowQuote,
  fromAmountUsdValue,
  setReceiveWalletSelection,
  onFromAmountChange,
  toSelectedChainIcon,
  receiveRiskLevel,
  onFromUsdChange,
  onToggleFromValueMode,
  openSelector,
  riskReasons,
}: any) {
  const [selectedPercent, setSelectedPercent] = useState<string>('M');
  const [isPriceInverted, setIsPriceInverted] = useState(false);
  const [isReversed, setIsReversed] = useState(false);
  const [expiry, setExpiry] = useState('1 week');

  const [customPriceInput, setCustomPriceInput] = useState<string>('');
  const [userTypedBasePrice, setUserTypedBasePrice] = useState<number | null>(null);

  const sendAmount = workspace.sendAmount || workspace.fromAmount;

  const livePrice = useMemo(() => {
    const baseLive = Number(workspace.livePrice || 0);
    if (!baseLive) return 0;
    return isPriceInverted ? 1 / baseLive : baseLive;
  }, [workspace.livePrice, isPriceInverted]);

  useEffect(() => {
    if (selectedPercent === 'M' && livePrice > 0 && userTypedBasePrice === null) {
      setCustomPriceInput(livePrice.toFixed(18).replace(/\.?0+$/, ''));
    }
    if (livePrice === 0 && selectedPercent === 'M' && userTypedBasePrice === null) {
      setCustomPriceInput('');
    }
  }, [livePrice, selectedPercent, userTypedBasePrice]);

  const handlePercentChange = (val: string) => {
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
  };

  const finalPrice = useMemo(() => {
    return Number(customPriceInput) || 0;
  }, [customPriceInput]);

  const calculatedBuyAmount = useMemo(() => {
    if (!sendAmount || !finalPrice || finalPrice === 0) return '';
    const amount = isPriceInverted
      ? Number(sendAmount) * finalPrice
      : Number(sendAmount) / finalPrice;
    return amount.toFixed(18).replace(/\.?0+$/, '');
  }, [sendAmount, finalPrice, isPriceInverted]);

  const handlePanelArrowClick = () => {
    setIsPriceInverted((prev) => {
      console.log("isPriceInverted:", !prev);
      return !prev;
    });

    setIsReversed((prev) => {
      console.log("isReversed:", !prev);
      return !prev;
    });

    setSelectedPercent('M');
    setUserTypedBasePrice(null);

    console.log("Button clicked");
  };

  const handleFlipTokens = () => {
    if (workspace.onFlipTokens) {
      workspace.onFlipTokens();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomPriceInput(e.target.value);
    setUserTypedBasePrice(Number(e.target.value) || 0);
    setSelectedPercent('');
  };

  const marketOptions = [
    { label: 'Market', value: 'M' },
    { label: `${isReversed ? '-' : '+'}1%`, value: '1' },
    { label: `${isReversed ? '-' : '+'}5%`, value: '5' },
    { label: `${isReversed ? '-' : '+'}10%`, value: '10' },
  ];

  const expiryOptions = [
    { label: '1 day', value: '1 day' },
    { label: '1 week', value: '1 week' },
    { label: '1 month', value: '1 month' },
    { label: '1 year', value: '1 year' },
  ];

  const isLoading = workspace.isQuoteFetching;
  const primaryActionDisabled = workspace.primaryWallet
    ? !workspace.hasTokenSelection || isLoading || Boolean(workspace.quoteErrorMessage)
    : false;

  const activeQuoteToken = isPriceInverted ? workspace.selectedFromToken : workspace.selectedToToken;
  const activeQuoteSelector = isPriceInverted ? 'from' : 'to';

  const activeBaseToken = isPriceInverted ? workspace.selectedToToken : workspace.selectedFromToken;
  const activeBaseSelector = isPriceInverted ? 'to' : 'from';

  return (
    <motion.div
      key='limit-ui'
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className='absolute inset-0 flex flex-col gap-4 mx-auto min-[1441px]:min-w-110 xl:max-w-95 min-[1441px]:max-w-max sm:max-w-90 w-full'
    >
      <div className="flex flex-col gap-3">
        <div className="relative rounded-xl border border-[var(--swap-divider-border)] bg-[var(--swap-panel-bg)] p-4 flex flex-col gap-3">

          <div className="flex items-center justify-between">
            <div className="text-sm text-[var(--neutral-text-textWeak)] flex items-center gap-1.5">
              <span>When 1</span>
              <button
                onClick={() => openSelector(activeBaseSelector)}
                className="flex items-center gap-1.5 px-1 py-0.5 rounded-md hover:bg-[var(--neutral-background-raised)] transition"
              >
                {activeBaseToken?.logoURI && (
                  <img
                    src={activeBaseToken.logoURI}
                    className="w-5 h-5 rounded-full"
                    alt={activeBaseToken?.symbol}
                  />
                )}
                <span className="whitespace-nowrap text-base font-medium text-[var(--neutral-text)]">
                  {activeBaseToken?.symbol}
                </span>
              </button>
              <span>is worth</span>
            </div>

            <button
              className="p-1 rounded-full hover:bg-[var(--neutral-background-raised)] transition"
              onClick={handlePanelArrowClick}
              aria-label="Toggle price direction"
            >
              <ArrowDownUp className="size-4 text-[var(--neutral-text-textWeak)]" />
            </button>


          </div>

          <div className="flex items-center justify-between gap-4 mt-1">
            <input
              type="text"
              value={customPriceInput}
              onChange={handleInputChange}
              className="w-full bg-transparent outline-none text-[32px] font-medium leading-none text-[var(--swap-amount)] font-mono min-w-0"
              placeholder="0.00"
            />

            <button
              onClick={() => openSelector(activeQuoteSelector)}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-[var(--neutral-background-raised)] transition shrink-0"
            >
              {activeQuoteToken?.logoURI && (
                <img
                  src={activeQuoteToken.logoURI}
                  className="w-5 h-5 rounded-full"
                  alt={activeQuoteToken?.symbol}
                />
              )}
              <span className="whitespace-nowrap font-medium text-[var(--neutral-text)] text-sm">
                {activeQuoteToken?.symbol}
              </span>
            </button>
          </div>

          <div className="flex items-center justify-start mt-2">
            <PillRadioGroup
              value={selectedPercent}
              onChange={handlePercentChange}
              options={marketOptions}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1 relative">
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
            className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 size-10 flex items-center justify-center rounded-full border border-(--swap-divider-border) bg-(--neutral-background-raised) text-[24px] shadow-[0_0_0_4.5px_var(--swap-panel-bg)]'
            onClick={handleFlipTokens}
            aria-label='Swap tokens'
          >
            <ArrowDown className='text-(--arrow-icon-btn) size-4' />
          </Button>

          <TradeReceivePanel
            amount={calculatedBuyAmount || toAmount}
            displayAmount={calculatedBuyAmount || animatedToAmount}
            valueMode={valueMode}
            token={selectedToToken}
            usdValue={toAmountUsdValue}
            chainIcon={toSelectedChainIcon}
            onSelectToken={() => openSelector?.('to')}
            loading={isQuoteFetching && shouldShowQuote}
            priceImpact={priceImpact}
            receiveWalletSelection={receiveWalletSelection}
            onReceiveWalletChange={setReceiveWalletSelection}
            riskLevel={receiveRiskLevel}
            riskReasons={riskReasons}
            animateRiskBorder={Boolean(receiveRiskLevel)}
          />
        </div>

        <div className="flex items-center justify-between mt-2 px-1">
          <p className="text-sm font-medium text-[var(--neutral-text-textWeak)]">
            Expiry
          </p>

          <PillRadioGroup
            value={expiry}
            onChange={setExpiry}
            options={expiryOptions}
          />
        </div>

        <Button
          className={cn(
            'rounded-full justify-center border border-transparent bg-[var(--swap-action-bg)] px-4 py-3 font-medium text-[var(--swap-action-text)] text-base mt-2',
            {
              'bg-(--neutral-background-raised) text-(--neutral-text-textWeak) border-(--neutral-color-denger)!':
                workspace.shouldEnforceDangerGuard,
            },
          )}
          onClick={workspace.onPrimaryAction}
          disabled={primaryActionDisabled}
        >
          {workspace.primaryWallet || workspace.user
            ? isLoading
              ? 'Fetching Price...'
              : workspace.quoteErrorMessage
                ? 'No Route Available'
                : 'Review Limit Order'
            : 'Connect Wallet'}
        </Button>
      </div>
    </motion.div>
  );
}
