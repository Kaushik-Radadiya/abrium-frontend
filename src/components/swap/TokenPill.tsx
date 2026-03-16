'use client';

import { useMemo } from 'react';
import { UiToken } from '@/lib/tokens';
import { getTokenIconUrl } from '@/lib/icons';
import { IconWithFallback } from '@/components/swap/IconWithFallback';
import { getChain } from '@/lib/chains';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SecurityLevel } from '@/lib/api.types';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type Props = {
  token?: UiToken;
  selectedChainIcon?: string | null;
  onClick: () => void;
  riskLevel?: SecurityLevel | null;
  riskReasons?: string[] | null;
  animateRiskBorder?: boolean;
};

function resolveChainLabel(token?: UiToken) {
  if (!token) return '';
  return getChain(token.chainId)?.name ?? token.symbol;
}

export function TokenPill({
  token,
  selectedChainIcon,
  onClick,
  riskLevel = null,
  riskReasons = null,
  animateRiskBorder = false,
}: Props) {
  const showRiskBorder =
    riskLevel === 'caution' ||
    riskLevel === 'danger' ||
    riskLevel === 'verified';
  const shouldHideRiskBorderAfterAnimation =
    riskLevel === 'caution' || riskLevel === 'verified';
  const tooltipReasons = useMemo(
    () => riskReasons?.filter(Boolean).slice(0, 3) ?? [],
    [riskReasons],
  );
  const showRiskTooltip = showRiskBorder && tooltipReasons.length > 0;
  const riskBorderStyle =
    riskLevel === 'verified'
      ? {
          boxShadow: `
        0 0 0 1px var(--neutral-color-verified),
        0 0 10px rgba(34,197,94,0.9),
        0 0 15px rgba(34,197,94,0.6),
        0 0 15px rgba(34,197,94,0.35)
      `,
        }
      : riskLevel === 'caution'
        ? {
            boxShadow: `
            0 0 0 1px var(--neutral-color-caution),
            0 0 10px rgba(250,204,21,0.8),
            0 0 15px rgba(250,204,21,0.6),
            0 0 15px rgba(250,204,21,0.35)
      `,
          }
        : riskLevel === 'danger'
          ? {
              boxShadow: `
              0 0 0 1px var(--neutral-color-denger),
              0 0 10px rgba(239,68,68,0.9),
              0 0 15px rgba(239,68,68,0.6),
              0 0 15px rgba(239,68,68,0.35)
      `,
            }
          : {};
  const riskShadowVarStyle = {
    '--token-risk-shadow':
      (riskBorderStyle as { boxShadow?: string }).boxShadow ?? 'none',
  } as const;

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

  const chainLabel = resolveChainLabel(token);
  const icon = (
    <span
      className='relative grid h-12 w-12 place-items-center overflow-visible rounded-full text-sm font-bold text-[var(--token-icon-text)]'
      aria-label={
        showRiskTooltip
          ? `Token risk notes: ${tooltipReasons.join(' ')}`
          : undefined
      }
    >
      <div
        className='absolute inset-0 rounded-full bg-[var(--token-icon-bg)] transition-shadow duration-300'
        style={{
          ...(showRiskBorder ? riskBorderStyle : {}),
          ...riskShadowVarStyle,
          opacity: showRiskBorder ? 0.9 : 1,
          animation:
            showRiskBorder && animateRiskBorder
              ? shouldHideRiskBorderAfterAnimation
                ? 'tokenRiskGlow 0.8s ease-in-out 5, tokenRiskHide 700ms ease-out 4s forwards'
                : 'tokenRiskGlow 0.8s ease-in-out 5'
              : undefined,
        }}
      >
        <IconWithFallback
          src={
            token ? (token.logoURI ?? getTokenIconUrl(token.symbol)) : undefined
          }
          alt={token?.symbol ?? 'Token'}
          fallback={token?.symbol?.[0] ?? 'T'}
        />
      </div>
      {selectedChainIcon ? (
        <span className='absolute bottom-0 -right-1.25 grid h-5.5 w-5.5 place-items-center overflow-hidden rounded-full border-2 border-[var(--token-pill-chain-badge-border)] bg-[var(--token-icon-bg)] shadow-[var(--token-pill-chain-badge-shadow)]'>
          <IconWithFallback
            src={selectedChainIcon}
            alt={'chain'}
            fallback=''
            showFallback={false}
            sizes='20px'
          />
        </span>
      ) : null}
    </span>
  );

  return (
    <Button
      className='!p-2 gap-3 !bg-transparent items-center'
      type='button'
      onClick={onClick}
    >
      <span className='inline-flex items-center gap-3'>
        {showRiskTooltip ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className='cursor-pointer'>{icon}</span>
            </TooltipTrigger>
            <TooltipContent
              side='right'
              align='center'
              className='px-2!'
              sideOffset={0}
            >
              <div className='grid gap-1'>
                <span className='text-sm font-bold'>Risk notes:</span>
                <ul className='list-disc ms-4 text-xs leading-4 font-medium'>
                  {tooltipReasons.map((reason) => (
                    <li
                      className='text-xs leading-4 font-normal text-[var(--neutral-background)]'
                      key={reason}
                    >
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            </TooltipContent>
          </Tooltip>
        ) : (
          icon
        )}
        <span className='flex flex-col gap-1 items-start'>
          <span className='whitespace-nowrap text-base font-medium text-[var(--neutral-text)]'>
            {token.symbol}
          </span>
          <span className='text-xs text-(--neutral-text-textWeak)'>
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

          @keyframes tokenRiskHide {
            0% {
              opacity: 0.9;
              box-shadow: var(--token-risk-shadow);
            }
            100% {
              opacity: 1;
              box-shadow: none;
            }
          }
        `}</style>
      ) : null}
    </Button>
  );
}
