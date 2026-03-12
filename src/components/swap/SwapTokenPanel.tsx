'use client';

import { ArrowDownUp } from 'lucide-react';
import type { UiToken } from '@/lib/tokens';
import { TokenPill } from '@/components/swap/TokenPill';
import { WalletTrigger } from '@/components/WalletTrigger';
import { formatApproxUsd } from '@/lib/formatAmount';
import { OverflowTooltipText } from '@/components/ui/OverflowTooltipText';
import type { SecurityLevel } from '@/lib/api';

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
  bottomLabel?: string;
  onToggleValueDisplay?: () => void;
  onReceiveWalletChange?: (address: string | null) => void;
  riskLevel?: SecurityLevel | null;
  animateRiskBorder?: boolean;
};

const TOKEN_BOX_CLASS =
  'grid gap-2 rounded-[14px] border-t border-[var(--swap-token-border)] bg-[var(--neutral-background-raised)] sm:p-4 p-2.5';
const TOKEN_TOP_WALLET_CLASS = 'flex items-center gap-2 py-2.5 px-4';
const TOKEN_SECTION_CLASS =
  'grid gap-1 rounded-[16px] border border-[var(--swap-token-border)] bg-[var(--neutral-background)]';

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
  bottomLabel,
  onToggleValueDisplay,
  onReceiveWalletChange,
  riskLevel = null,
  animateRiskBorder = false,
}: Props) {
  return (
    <div className={TOKEN_SECTION_CLASS}>
      <div className={TOKEN_TOP_WALLET_CLASS}>
        <WalletTrigger
          receiveMode={label === 'Receive'}
          onReceiveWalletChange={onReceiveWalletChange}
        />
      </div>
      <div className={TOKEN_BOX_CLASS}>
        <div className='flex items-center justify-between'>
          <div className='text-[16px] leading-none text-[var(--neutral-text-textWeak)]'>
            {label}
          </div>
          <div className='text-xs  text-[var(--neutral-text-textWeak)]'>
            Balance: <span className='text-(--neutral-text)'>0.00</span>
          </div>
        </div>
        <div className='grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3'>
          <div className='grid gap-1.5 overflow-hidden min-w-0'>
            {editable ? (
              <OverflowTooltipText
                text={amount}
                ariaLabel={`${label} amount`}
                renderTrigger={({
                  setTriggerElement,
                  onPointerEnter,
                  onFocus,
                  onPointerLeave,
                  onBlur,
                }) => (
                  <input
                    ref={setTriggerElement}
                    className='h-auto min-h-0 w-full border-0 bg-transparent p-0 font-normal font-mono lg:text-3xl text-2xl text-[var(--swap-amount)] outline-none placeholder:text-[var(--neutral-text-placeholder)] overflow-hidden text-ellipsis whitespace-nowrap'
                    value={amount}
                    type='number'
                    onChange={(event) => onAmountChange?.(event.target.value)}
                    placeholder='0.0'
                    aria-label={`${label} amount`}
                    onPointerEnter={onPointerEnter}
                    onFocus={onFocus}
                    onPointerLeave={onPointerLeave}
                    onBlur={onBlur}
                  />
                )}
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
              <div className='flex min-h-12 items-center overflow-hidden'>
                <OverflowTooltipText
                  text={amount && amount !== '0.0' ? amount : '0.0'}
                  ariaLabel={`${label} amount (calculated)`}
                  className='w-full lg:text-3xl text-2xl font-normal font-mono select-none'
                  style={{
                    color:
                      amount && amount !== '0.0'
                        ? 'var(--swap-amount)'
                        : 'var(--neutral-text-placeholder)',
                  }}
                />
              </div>
            )}
            <div className='text-xs flex items-center gap-1 text-[var(--neutral-text-textWeak)] overflow-hidden min-w-0'>
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
                  <span className='truncate'>
                    {bottomLabel ?? formatApproxUsd(usdValue)}
                  </span>
                  <ArrowDownUp
                    className='size-3 cursor-pointer shrink-0'
                    onClick={onToggleValueDisplay}
                  />
                </>
              )}
            </div>
          </div>
          <TokenPill
            token={token}
            selectedChainIcon={selectedChainIcon}
            selectedChainKey={selectedChainKey}
            onClick={onSelectToken}
            riskLevel={riskLevel}
            animateRiskBorder={animateRiskBorder}
          />
        </div>
      </div>
    </div>
  );
}
