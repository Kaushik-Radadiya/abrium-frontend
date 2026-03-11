'use client';

import { UiToken } from '@/lib/tokens';
import { getTokenIconUrl } from '@/lib/icons';
import { IconWithFallback } from '@/components/swap/IconWithFallback';
import { getChain } from '@/lib/chains';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SecurityLevel } from '@/lib/api.types';

type Props = {
  token?: UiToken;
  selectedChainIcon?: string | null;
  selectedChainKey?: string;
  onClick: () => void;
  riskLevel?: SecurityLevel | null;
  animateRiskBorder?: boolean;
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
  riskLevel = null,
  animateRiskBorder = false,
}: Props) {
  const showRiskBorder =
    riskLevel === 'caution' ||
    riskLevel === 'danger' ||
    riskLevel === 'verified';
  const riskBorderStyle =
    riskLevel === 'verified'
      ? {
          boxShadow: `
        0 0 0 2px var(--neutral-color-verified),
        0 0 15px rgba(34,197,94,0.9),
        0 0 25px rgba(34,197,94,0.6),
        0 0 50px rgba(34,197,94,0.35)
      `,
        }
      : riskLevel === 'caution'
        ? {
            boxShadow: `
            0 0 0 2px var(--neutral-color-caution),
            0 0 15px rgba(250,204,21,0.8),
            0 0 25px rgba(250,204,21,0.6),
            0 0 50px rgba(250,204,21,0.35)
      `,
          }
        : riskLevel === 'danger'
          ? {
              boxShadow: `
              0 0 0 2px var(--neutral-color-denger),
              0 0 15px rgba(239,68,68,0.9),
              0 0 25px rgba(239,68,68,0.6),
              0 0 50px rgba(239,68,68,0.35)
      `,
            }
          : {};

  if (!token) {
    return (
      <Button
        className='px-2 py-3 font-medium bg-[var(--neutral-background-strong)] text-[var(--neutral-background)] text-base leading-4'
        type='button'
        onClick={onClick}
      >
        <span className='whitespace-nowrap'>Select token</span>
        <ChevronDown size={18} />
      </Button>
    );
  }

  const chainLabel = resolveChainLabel(token, selectedChainKey);

  return (
    <Button
      className='!p-2 gap-3 !bg-transparent items-center'
      type='button'
      onClick={onClick}
    >
      <span className='inline-flex items-center gap-3'>
        <span className='relative grid h-12 w-12 place-items-center overflow-visible rounded-full text-sm font-bold text-[var(--token-icon-text)]'>
          <div
            className='absolute inset-0 rounded-full bg-[var(--token-icon-bg)]'
            style={{
              ...(showRiskBorder ? riskBorderStyle : {}),
              opacity: showRiskBorder ? 0.9 : 1,
              animation:
                showRiskBorder && animateRiskBorder
                  ? 'tokenRiskGlow 0.8s ease-in-out infinite'
                  : undefined,
            }}
          >
            <IconWithFallback
              src={
                token
                  ? (token.logoURI ?? getTokenIconUrl(token.symbol))
                  : undefined
              }
              alt={token?.symbol ?? 'Token'}
              fallback={token?.symbol?.[0] ?? 'T'}
            />
          </div>
          {selectedChainIcon ? (
            <span className='absolute bottom-0 -right-1.25 grid h-5.5 w-5.5 place-items-center overflow-hidden rounded-full border-2 border-[var(--token-pill-chain-badge-border)] bg-[var(--token-icon-bg)] shadow-[var(--token-pill-chain-badge-shadow)]'>
              <IconWithFallback
                src={selectedChainIcon}
                alt={selectedChainKey ?? 'chain'}
                fallback=''
                showFallback={false}
                sizes='20px'
              />
            </span>
          ) : null}
        </span>
        <span className='flex flex-col gap-1 items-start'>
          <span className='whitespace-nowrap text-base font-medium text-[var(--neutral-text)]'>
            {token.symbol}
          </span>
          <span className='text-xs uppercase text-[var(--neutral-text-textWeak)]'>
            {chainLabel}
          </span>
        </span>
      </span>
      <span className='text-sm leading-none text-[var(--token-pill-muted)]'>
        <ChevronDown size={16} />
      </span>
      {showRiskBorder ? (
        <style>{`
          @keyframes tokenRiskGlow {
            0% {
              transform: scale(1);
              filter: brightness(1);
            }
            50% {
              transform: scale(1.05);
              filter: brightness(1.25);
            }
            100% {
              transform: scale(1);
              filter: brightness(1);
            }
          }
        `}</style>
      ) : null}
    </Button>
  );
}
