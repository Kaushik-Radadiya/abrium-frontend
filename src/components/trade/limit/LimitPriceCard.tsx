'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { IconWithFallback } from '@/components/trade/common/IconWithFallback';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { PillRadioGroup } from '@/components/ui/radio-group';
import { formatAmount } from '@/lib/formatAmount';
import { getTokenIconUrl } from '@/lib/icons';
import type { SwapWorkspaceViewModel } from '@/types/trade/workspace';
import { PRICE_PRESET_OPTIONS } from '@/lib/constant/trade';

type LimitPriceCardProps = {
  workspace: SwapWorkspaceViewModel;
};

const PRICE_PRESET_RADIO_OPTIONS = PRICE_PRESET_OPTIONS.map((preset) => ({
  label: preset,
  value: preset,
}));

export function LimitPriceCard({ workspace }: LimitPriceCardProps) {
  const [activePreset, setActivePreset] = useState<string>(PRICE_PRESET_OPTIONS[0]);

  const marketLimitPrice = (() => {
    const fromPrice = workspace.selectedFromToken?.priceUsd;
    const toPrice = workspace.selectedToToken?.priceUsd;
    if (!fromPrice || !toPrice || fromPrice <= 0 || toPrice <= 0) return null;
    return fromPrice / toPrice;
  })();

  const applyPricePreset = (preset: string) => {
    if (!marketLimitPrice) {
      if (preset === PRICE_PRESET_OPTIONS[0]) workspace.setLimitPrice('');
      return;
    }
    if (preset === PRICE_PRESET_OPTIONS[0]) {
      workspace.setLimitPrice(formatAmount(marketLimitPrice, 6));
      return;
    }

    const increase = Number(preset.replace('%', '').replace('+', ''));
    const nextPrice = marketLimitPrice * (1 + increase / 100);
    workspace.setLimitPrice(formatAmount(nextPrice, 6));
  };

  const baseSymbol = workspace.selectedFromToken?.symbol ?? 'ETH';
  const quoteSymbol = workspace.selectedToToken?.symbol ?? 'USDT';
  const baseIcon =
    workspace.selectedFromToken?.logoURI ?? getTokenIconUrl(baseSymbol);
  const quoteIcon =
    workspace.selectedToToken?.logoURI ?? getTokenIconUrl(quoteSymbol);
  const value = workspace.limitPrice || formatAmount(marketLimitPrice ?? 0, 6);

  return (
    <div className='grid gap-3 rounded-2xl border border-[var(--swap-token-border)] bg-[var(--neutral-background)] p-4'>
      <div className='flex items-center text-base text-[var(--neutral-text-textWeak)]'>
        When 1{' '}
        <span className='inline-flex items-center gap-1 text-[var(--neutral-text)]'>
          <span className='relative size-5 overflow-hidden rounded-full'>
            <IconWithFallback
              src={baseIcon}
              alt={baseSymbol}
              fallback={baseSymbol[0] ?? 'T'}
              sizes='20px'
            />
          </span>
          {baseSymbol}
        </span>{' '}
        is worth
      </div>

      <div className='grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3'>
        <Input
          type='number'
          value={value}
          onChange={(event) => {
            setActivePreset(PRICE_PRESET_OPTIONS[0]);
            workspace.setLimitPrice(event.target.value);
          }}
          className='h-auto rounded-none border-0 bg-transparent p-0 font-mono text-5xl leading-none text-[var(--swap-amount)] focus-visible:border-0'
          placeholder='0.0'
        />

        <Button
          type='button'
          className='inline-flex items-center gap-2 rounded-full border border-[var(--neutral-border)] bg-[var(--neutral-background-raised)] px-3 py-1.5 text-xl font-medium text-[var(--neutral-text)]'
          onClick={() => workspace.openSelector('to')}
        >
          <span className='relative size-6 overflow-hidden rounded-full'>
            <IconWithFallback
              src={quoteIcon}
              alt={quoteSymbol}
              fallback={quoteSymbol[0] ?? 'T'}
              sizes='24px'
            />
          </span>
          {quoteSymbol}
          <ChevronDown className='size-4 text-[var(--token-pill-muted)]' />
        </Button>
      </div>

      <PillRadioGroup
        value={activePreset}
        onChange={(preset) => {
          setActivePreset(preset);
          applyPricePreset(preset);
        }}
        options={PRICE_PRESET_RADIO_OPTIONS}
      />
    </div>
  );
}
