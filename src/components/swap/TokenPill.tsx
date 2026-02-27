'use client';

import { UiToken } from '@/lib/tokens';
import { getTokenIconUrl } from '@/lib/icons';
import { IconWithFallback } from '@/components/swap/IconWithFallback';
import { getChain } from '@/lib/chains';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';

type Props = {
  token?: UiToken;
  selectedChainIcon?: string | null;
  selectedChainKey?: string;
  onClick: () => void;
};

function resolveChainLabel(token?: UiToken, selectedChainKey?: string) {
  if (selectedChainKey === 'ethereum' || selectedChainKey === 'eth')
    return 'ETH';
  if (selectedChainKey === 'polygon' || selectedChainKey === 'pol')
    return 'POL';
  if (selectedChainKey === 'base' || selectedChainKey === 'bas') return 'ETH';
  if (!token) return '';
  return getChain(token.chainId)?.nativeSymbol ?? token.symbol;
}

export function TokenPill({
  token,
  selectedChainIcon,
  selectedChainKey,
  onClick,
}: Props) {
  if (!token) {
    return (
      <Button
        className="px-2 py-3 font-medium bg-[var(--neutral-background-strong)] text-[var(--neutral-background)] text-base leading-4"
        type="button"
        onClick={onClick}
      >
        <span className="whitespace-nowrap">Select token</span>
        <ChevronDown size={18} />
      </Button>
    );
  }

  const chainLabel = resolveChainLabel(token, selectedChainKey);

  return (
    <Button
      className="!p-2 gap-3 !bg-transparent items-center"
      type="button"
      onClick={onClick}
    >
      <span className="inline-flex items-center gap-3">
        <span className="relative grid h-12 w-12 place-items-center overflow-visible rounded-full border-0 bg-[var(--token-icon-bg)] text-sm font-bold text-[var(--token-icon-text)]">
          <IconWithFallback
            src={
              token
                ? (token.logoURI ?? getTokenIconUrl(token.symbol))
                : undefined
            }
            alt={token?.symbol ?? 'Token'}
            fallback={token?.symbol?.[0] ?? 'T'}
          />
          {selectedChainIcon ? (
            <span className="absolute -bottom-[3px] -right-[3px] grid h-[16px] w-[16px] place-items-center overflow-hidden rounded-full border-2 border-[var(--token-pill-chain-badge-border)] bg-[var(--token-pill-chain-badge-bg)] shadow-[var(--token-pill-chain-badge-shadow)]">
              <IconWithFallback
                src={selectedChainIcon}
                alt={selectedChainKey ?? 'chain'}
                fallback=""
                showFallback={false}
                sizes="16px"
              />
            </span>
          ) : null}
        </span>
        <span className="flex flex-col gap-1 items-start">
          <span className="whitespace-nowrap text-base font-medium text-[var(--neutral-text)]">
            {token.symbol}
          </span>
          <span className="text-xs uppercase text-[var(--neutral-text-textWeak)]">
            {chainLabel}
          </span>
        </span>
      </span>
      <span className="text-sm leading-none text-[var(--token-pill-muted)]">
        <ChevronDown size={16} />
      </span>
    </Button>
  );
}
