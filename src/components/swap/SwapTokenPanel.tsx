'use client';

import { ArrowDownUp } from 'lucide-react';
import { useState } from 'react';
import type { UiToken } from '@/lib/tokens';
import { TokenPill } from '@/components/swap/TokenPill';
import { WalletTrigger } from '@/components/WalletTrigger';
import { formatApproxUsd } from '@/lib/formatAmount';
import { OverflowTooltipText } from '@/components/ui/OverflowTooltipText';
import type { SecurityLevel } from '@/lib/api';
import type { WalletSelection } from '@/lib/receive-wallet';
import { RECEIVE_AMOUNT_FORMATTER } from '@/lib/constant/swap';

type Props = {
  label: string;
  amount: string;
  amountDisplayMode?: 'token' | 'usd';
  token?: UiToken;
  usdValue?: number | null;
  selectedChainIcon?: string | null;
  onSelectToken: () => void;
  editable?: boolean;
  onAmountChange?: (nextValue: string) => void;
  loading?: boolean;
  bottomLabel?: string;
  bottomSubLabel?: string;
  impactPctLabel?: string;
  impactDollarTooltip?: string;
  onToggleValueDisplay?: () => void;
  onReceiveWalletChange?: (selection: WalletSelection | null) => void;
  receiveWalletSelection?: WalletSelection | null;
  riskLevel?: SecurityLevel | null;
  riskReasons?: string[] | null;
  animateRiskBorder?: boolean;
  balance?: string;
};

const TOKEN_BOX_CLASS =
  'grid gap-2 rounded-[14px] border-t border-[var(--swap-token-border)] bg-[var(--neutral-background-raised)] sm:p-4 p-2.5';
const TOKEN_TOP_WALLET_CLASS = 'flex items-center gap-2 py-2.5 px-4';
const TOKEN_SECTION_CLASS =
  'grid gap-1 rounded-[16px] border border-[var(--swap-token-border)] bg-[var(--neutral-background)]';

function formatPanelAmount(
  label: string,
  amount: string,
  amountDisplayMode: 'token' | 'usd',
) {
  if (label !== 'Receive') return amount && amount !== '0.0' ? amount : '0.0';
  if (amountDisplayMode === 'usd') return amount || '$0.0';

  const parsedAmount = Number(amount);
  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) return '0.0';
  return RECEIVE_AMOUNT_FORMATTER.format(parsedAmount);
}

export function SwapTokenPanel({
  label,
  amount,
  amountDisplayMode = 'token',
  token,
  usdValue,
  selectedChainIcon,
  onSelectToken,
  editable = false,
  onAmountChange,
  loading = false,
  bottomLabel,
  bottomSubLabel,
  impactPctLabel,
  impactDollarTooltip,
  onToggleValueDisplay,
  onReceiveWalletChange,
  receiveWalletSelection,
  riskLevel = null,
  riskReasons = null,
  animateRiskBorder = false,
}: Props) {
  const displayAmount = formatPanelAmount(label, amount, amountDisplayMode);
  const [showDollar, setShowDollar] = useState(false);
  const [prevImpactPctLabel, setPrevImpactPctLabel] = useState(impactPctLabel);

  if (prevImpactPctLabel !== impactPctLabel) {
    setPrevImpactPctLabel(impactPctLabel);
    setShowDollar(false);
  }

  return (
    <div className={TOKEN_SECTION_CLASS}>
      <div className={TOKEN_TOP_WALLET_CLASS}>
        <WalletTrigger
          receiveMode={label === 'Receive'}
          onReceiveWalletChange={onReceiveWalletChange}
          receiveWalletSelection={receiveWalletSelection}
        />
      </div>
      <div className={TOKEN_BOX_CLASS}>
        <div className='text-[16px] leading-none text-[var(--neutral-text-textWeak)]'>
          {label}
        </div>
        <div className='grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3'>
          <div className='grid gap-1.5 overflow-hidden min-w-0'>
            {editable ? (
              <OverflowTooltipText
                text={
                  amountDisplayMode === 'usd' && amount ? `$${amount}` : amount
                }
                ariaLabel={`${label} amount`}
                trigger={
                  <div className='flex items-center min-w-0 w-full font-mono lg:text-3xl text-2xl text-[var(--swap-amount)]'>
                    {amountDisplayMode === 'usd' ? (
                      <span className='shrink-0'>$</span>
                    ) : null}
                    <input
                      className='h-auto min-h-0 w-full border-0 bg-transparent p-0 font-normal outline-none placeholder:text-[var(--neutral-text-placeholder)] overflow-hidden text-ellipsis whitespace-nowrap'
                      value={amount}
                      type='number'
                      onChange={(event) => onAmountChange?.(event.target.value)}
                      placeholder='0.0'
                    />
                  </div>
                }
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
                  text={displayAmount}
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
                  <div className='min-w-0 flex gap-1 items-center'>
                    <div className='truncate'>
                      {bottomLabel ?? formatApproxUsd(usdValue)}
                    </div>
                    {bottomSubLabel ? (
                      <div className='truncate'>{bottomSubLabel}</div>
                    ) : null}
                    {impactPctLabel ? (
                      <span
                        className='text-xs shrink-0 cursor-pointer'
                        onMouseEnter={() => impactDollarTooltip && setShowDollar(true)}
                        onMouseLeave={() => setShowDollar(false)}
                      >
                        {showDollar && impactDollarTooltip ? impactDollarTooltip : impactPctLabel}
                      </span>
                    ) : null}
                  </div>
                  {onToggleValueDisplay && (
                    <ArrowDownUp
                      className='size-3 cursor-pointer shrink-0'
                      onClick={onToggleValueDisplay}
                    />
                  )}
                </>
              )}
            </div>
          </div>
          <TokenPill
            token={token}
            selectedChainIcon={selectedChainIcon}
            onClick={onSelectToken}
            riskLevel={riskLevel}
            riskReasons={riskReasons}
            animateRiskBorder={animateRiskBorder}
          />
        </div>
      </div>
    </div>
  );
}
