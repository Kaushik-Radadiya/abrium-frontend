'use client';

import { ArrowDownUp } from 'lucide-react';
import type { UiToken } from '@/lib/tokens';
import { TokenPill } from '@/components/swap/TokenPill';
import { WalletTrigger } from '@/components/WalletTrigger';

type Props = {
  label: string;
  amount: string;
  token?: UiToken;
  usdValue?: number | null;
  selectedChainIcon?: string | null;
  selectedChainKey?: string;
  onSelectToken: () => void;
  editable?: boolean;
  onAmountChange?: (nextValue: string) => void;
  loading?: boolean;
};

const TOKEN_BOX_CLASS =
  'grid gap-2 rounded-[14px] border border-[var(--swap-token-border)] bg-[var(--neutral-background-raised)] p-4';
const TOKEN_TOP_WALLET_CLASS = 'flex items-center gap-2 py-2.5 px-4';
const TOKEN_SECTION_CLASS =
  'grid gap-1 rounded-[16px] border border-[var(--swap-token-border)] bg-[var(--neutral-background)]';
const USD_TWO_DECIMALS = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const USD_UP_TO_SIX_DECIMALS = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 6,
});

function formatApproxUsd(value?: number | null) {
  if (!value || !Number.isFinite(value) || value <= 0) return '~$0';
  if (value < 1) return `~${USD_UP_TO_SIX_DECIMALS.format(value)}`;
  return `~${USD_TWO_DECIMALS.format(value)}`;
}

export function SwapTokenPanel({
  label,
  amount,
  token,
  usdValue,
  selectedChainIcon,
  selectedChainKey,
  onSelectToken,
  editable = false,
  onAmountChange,
  loading = false,
}: Props) {
  return (
    <div className={TOKEN_SECTION_CLASS}>
      <div className={TOKEN_TOP_WALLET_CLASS}>
        <WalletTrigger />
      </div>
      <div className={TOKEN_BOX_CLASS}>
        <div className='text-[16px] leading-none text-[var(--neutral-text-textWeak)]'>
          {label}
        </div>
        <div className='grid grid-cols-[1fr_auto] items-end gap-3'>
          <div className='grid gap-1.5'>
            {editable ? (
              <input
                className='h-auto min-h-0 border-0 bg-transparent p-0 w-full font-normal font-mono text-3xl text-[var(--swap-amount)] outline-none placeholder:text-[var(--neutral-text-placeholder)]'
                value={amount}
                type="number"
                onChange={(event) => onAmountChange?.(event.target.value)}
                placeholder='0.0'
                aria-label={`${label} amount`}
              />
            ) : loading ? (
              <div
                className='flex min-h-12 items-center'
                aria-label='Fetching quote...'
                aria-busy='true'
              >
                <div
                  style={{
                    width: '55%',
                    height: '2rem',
                    borderRadius: '0.5rem',
                    background:
                      'linear-gradient(90deg, var(--skeleton-base, rgba(128,128,128,0.12)) 25%, var(--skeleton-shine, rgba(128,128,128,0.22)) 50%, var(--skeleton-base, rgba(128,128,128,0.12)) 75%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 1.4s ease-in-out infinite',
                  }}
                />
                <style>{`@keyframes shimmer { 0%{background-position:100% 0} 100%{background-position:-100% 0} }`}</style>
              </div>
            ) : (
              <div
                className='flex min-h-12 items-center text-3xl font-normal font-mono select-none cursor-default'
                style={{
                  color:
                    amount && amount !== '0.0'
                      ? 'var(--swap-amount)'
                      : 'var(--neutral-text-placeholder)',
                }}
                aria-label={`${label} amount (calculated)`}
                aria-readonly='true'
              >
                {amount && amount !== '0.0' ? amount : '0.0'}
              </div>
            )}
            <div className='text-xs flex items-center gap-1 text-[var(--neutral-text-textWeak)]'>
              {loading ? (
                <div
                  style={{
                    width: '4rem',
                    height: '0.75rem',
                    borderRadius: '0.25rem',
                    background:
                      'linear-gradient(90deg, var(--skeleton-base, rgba(128,128,128,0.12)) 25%, var(--skeleton-shine, rgba(128,128,128,0.22)) 50%, var(--skeleton-base, rgba(128,128,128,0.12)) 75%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 1.4s ease-in-out infinite',
                  }}
                />
              ) : (
                <>
                  {formatApproxUsd(usdValue)} <ArrowDownUp className='size-3' />
                </>
              )}
            </div>
          </div>
          <TokenPill
            token={token}
            selectedChainIcon={selectedChainIcon}
            selectedChainKey={selectedChainKey}
            onClick={onSelectToken}
          />
        </div>
      </div>
    </div>
  );
}
