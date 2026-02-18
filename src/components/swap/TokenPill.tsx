'use client'

import { UiToken } from '@/lib/tokens'
import { getTokenIconUrl } from '@/lib/icons'
import { IconWithFallback } from '@/components/swap/IconWithFallback'
import { getChain } from '@/lib/chains'

type Props = {
  token?: UiToken
  selectedChainIcon?: string | null
  selectedChainKey?: string
  onClick: () => void
}

function resolveChainLabel(token?: UiToken, selectedChainKey?: string) {
  if (selectedChainKey === 'ethereum') return 'ETH'
  if (selectedChainKey === 'polygon') return 'POL'
  if (selectedChainKey === 'base') return 'ETH'
  if (!token) return ''
  return getChain(token.chainId)?.nativeSymbol ?? token.symbol
}

export function TokenPill({
  token,
  selectedChainIcon,
  selectedChainKey,
  onClick,
}: Props) {
  const chainLabel = resolveChainLabel(token, selectedChainKey)

  return (
    <button
      className='inline-flex h-16 min-w-[136px] max-w-[220px] w-fit items-center justify-between gap-2 justify-self-end rounded-full border border-[var(--token-pill-border)] bg-[var(--token-pill-bg)] pl-1 pr-2 text-[var(--token-pill-text)]'
      type='button'
      onClick={onClick}
    >
      <span className='inline-flex items-center gap-1.5'>
        <span className='relative grid h-12 w-12 place-items-center overflow-visible rounded-full border-0 bg-[var(--token-icon-bg)] text-sm font-bold text-[var(--token-icon-text)]'>
          <IconWithFallback
            src={token ? token.logoURI ?? getTokenIconUrl(token.symbol) : undefined}
            alt={token?.symbol ?? 'Token'}
            fallback={token?.symbol?.[0] ?? 'T'}
          />
          {selectedChainIcon ? (
            <span className='absolute -bottom-[3px] -right-[3px] grid h-[16px] w-[16px] place-items-center overflow-hidden rounded-full border-2 border-[var(--token-pill-chain-badge-border)] bg-[var(--token-pill-chain-badge-bg)] shadow-[var(--token-pill-chain-badge-shadow)]'>
              <IconWithFallback
                src={selectedChainIcon}
                alt={selectedChainKey ?? 'chain'}
                fallback=''
                showFallback={false}
                sizes='16px'
              />
            </span>
          ) : null}
        </span>
        <span className='grid text-left leading-[1]'>
          <span className='whitespace-nowrap text-[30px] font-semibold tracking-[-0.02em]'>
            {token?.symbol ?? 'Select'}
          </span>
          <span className='text-[11px] uppercase text-[var(--token-pill-muted)]'>
            {chainLabel}
          </span>
        </span>
      </span>
      <span className='text-sm leading-none text-[var(--token-pill-muted)]'>
        ▾
      </span>
    </button>
  )
}
