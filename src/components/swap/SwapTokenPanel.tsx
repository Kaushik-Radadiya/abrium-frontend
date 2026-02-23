'use client';

import { ArrowDownUp } from 'lucide-react';
import type { UiToken } from '@/lib/tokens';
import { TokenPill } from '@/components/swap/TokenPill';
import { WalletTrigger } from '@/components/WalletTrigger';

type Props = {
  label: string;
  amount: string;
  token?: UiToken;
  selectedChainIcon?: string | null;
  selectedChainKey?: string;
  onSelectToken: () => void;
  editable?: boolean;
  onAmountChange?: (nextValue: string) => void;
};

const TOKEN_BOX_CLASS =
  'grid gap-2 rounded-[14px] border border-[var(--swap-token-border)] bg-[var(--neutral-background-raised)] p-4';
const TOKEN_TOP_WALLET_CLASS = 'flex items-center gap-2 py-2.5 px-4';
const TOKEN_SECTION_CLASS =
  'grid gap-1 rounded-[16px] border border-[var(--swap-token-border)] bg-[var(--neutral-background)]';

export function SwapTokenPanel({
  label,
  amount,
  token,
  selectedChainIcon,
  selectedChainKey,
  onSelectToken,
  editable = false,
  onAmountChange,
}: Props) {
  return (
    <div className={TOKEN_SECTION_CLASS}>
      <div className={TOKEN_TOP_WALLET_CLASS}>
        <WalletTrigger />
      </div>
      <div className={TOKEN_BOX_CLASS}>
        <div className="text-[16px] leading-none text-[var(--neutral-text-textWeak)]">
          {label}
        </div>
        <div className="grid grid-cols-[1fr_auto] items-end gap-3">
          <div className="grid gap-1.5">
            {editable ? (
              <input
                className="h-auto min-h-0 border-0 bg-transparent p-0 w-full font-normal font-mono text-3xl text-[var(--swap-amount)] outline-none placeholder:text-[var(--neutral-text-placeholder)]"
                value={amount}
                onChange={(event) => onAmountChange?.(event.target.value)}
                placeholder="0.0"
                aria-label={`${label} amount`}
              />
            ) : (
              <div className="flex min-h-12 items-center text-3xl font-normal font-mono text-[var(--neutral-text-placeholder)]">
                {amount}
              </div>
            )}
            <div className="text-xs flex items-center gap-1 text-[var(--neutral-text-textWeak)]">
              ~$0 <ArrowDownUp className="size-3" />
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
