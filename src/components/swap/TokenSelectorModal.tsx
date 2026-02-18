'use client'

import { SupportedChain } from '@/lib/chains'
import { UiToken } from '@/lib/tokens'
import { getChainIconUrl, getTokenIconUrl } from '@/lib/icons'
import { IconWithFallback } from '@/components/swap/IconWithFallback'
import { displayBalance, shortAddress } from '@/components/swap/utils'

type RuntimeNetwork = {
  chain: SupportedChain
  chainKey?: string
}

type Props = {
  open: boolean
  query: string
  onQueryChange: (value: string) => void
  chainId: number
  selectedChainIcon: string | null
  selectedChainKey: string
  networkMenuOpen: boolean
  setNetworkMenuOpen: (open: boolean) => void
  networks: RuntimeNetwork[]
  onChainSelect: (chainId: number) => void
  tokens: UiToken[]
  balances: Record<string, string>
  onSelectToken: (address: string) => void
  loadingDynamicTokens: boolean
  canImport: boolean
  importing: boolean
  importAddress: string
  onImportToken: () => void
  importError: string | null
  onClose: () => void
}

const MUTED_CLASS = 'text-[13px] text-[var(--muted)]'
const TOKEN_ICON_CLASS =
  'relative grid h-8 w-8 place-items-center overflow-visible rounded-full border-0 bg-[var(--token-icon-bg)] text-xs font-bold text-[var(--token-icon-text)]'

function resolveChainKey(chainId: number, chainKey?: string) {
  if (chainKey) return chainKey
  if (chainId === 1) return 'ethereum'
  if (chainId === 137) return 'polygon'
  if (chainId === 11155111) return 'ethereum'
  if (chainId === 80002) return 'polygon'
  if (chainId === 84532) return 'base'
  return 'network'
}

export function TokenSelectorModal({
  open,
  query,
  onQueryChange,
  chainId,
  selectedChainIcon,
  selectedChainKey,
  networkMenuOpen,
  setNetworkMenuOpen,
  networks,
  onChainSelect,
  tokens,
  balances,
  onSelectToken,
  loadingDynamicTokens,
  canImport,
  importing,
  importAddress,
  onImportToken,
  importError,
  onClose,
}: Props) {
  if (!open) return null

  const currentChainKey = resolveChainKey(chainId, selectedChainKey || undefined)
  const currentChainIcon = selectedChainIcon ?? getChainIconUrl(currentChainKey)

  return (
    <div
      className='fixed inset-0 z-[60] grid place-items-center bg-[var(--modal-backdrop)] p-4'
      onClick={onClose}
    >
      <div
        className='grid h-[min(700px,85vh)] w-full max-w-[430px] grid-rows-[auto_auto_1fr] overflow-hidden rounded-[18px] border border-[var(--modal-border)] bg-[var(--modal-bg)] text-[var(--modal-text)]'
        onClick={(event) => event.stopPropagation()}
      >
        <div className='flex items-center justify-between px-[14px] pb-1.5 pt-[14px]'>
          <h3>Select a token</h3>
          <button
            type='button'
            className='min-h-0 border-0 bg-transparent p-0 text-[22px] text-[var(--ghost-text)]'
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className='mx-[14px] flex min-h-14 items-center gap-2.5 rounded-full border border-[var(--search-row-border)] bg-[var(--search-row-bg)] px-3 py-0'>
          <span className='text-lg leading-none opacity-70' aria-hidden='true'>
            🔍
          </span>
          <input
            className='min-h-0 flex-1 border-0 bg-transparent p-0 text-lg text-[var(--search-text)] outline-none placeholder:text-[var(--search-placeholder)]'
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder='Search tokens or paste address'
          />
          <div className='relative ml-auto'>
            <button
              type='button'
              className='inline-flex min-h-[34px] min-w-[54px] items-center justify-end gap-2 rounded-[10px] border-0 bg-transparent p-0 text-[var(--search-text)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--network-item-active-border)]'
              onClick={() => setNetworkMenuOpen(!networkMenuOpen)}
            >
              <span className='inline-flex items-center'>
                {currentChainIcon ? (
                  <span className='relative h-[30px] w-[30px] overflow-hidden rounded-full border-0'>
                    <IconWithFallback
                      src={currentChainIcon}
                      alt={currentChainKey}
                      fallback={currentChainKey[0]?.toUpperCase() ?? 'N'}
                      sizes='30px'
                    />
                  </span>
                ) : null}
              </span>
              <span className='text-sm leading-none text-[var(--network-chevron)]'>
                {networkMenuOpen ? '▴' : '▾'}
              </span>
            </button>
            {networkMenuOpen ? (
              <div className='thin-scrollbar absolute right-0 top-[calc(100%+8px)] z-40 grid max-h-[min(62vh,420px)] w-[220px] gap-0.5 overflow-y-auto rounded-xl border border-[var(--network-menu-border)] bg-[var(--network-menu-bg)] p-1.5 shadow-[var(--network-menu-shadow)]'>
                {networks.map((network) => (
                  <button
                    key={`network-${network.chain.id}`}
                    type='button'
                    className={`min-h-[34px] rounded-lg border px-2.5 text-left ${
                      network.chain.id === chainId
                        ? 'border-[var(--network-item-active-border)] bg-[var(--network-item-active-bg)] text-[var(--network-item-active-text)]'
                        : 'border-transparent bg-transparent text-[var(--network-item-text)] hover:border-[var(--network-item-hover-border)] hover:bg-[var(--network-item-hover-bg)]'
                    }`}
                    onClick={() => {
                      onChainSelect(network.chain.id)
                      setNetworkMenuOpen(false)
                    }}
                  >
                    <span className='inline-flex items-center gap-2'>
                      <span className='relative h-[30px] w-[30px] overflow-hidden rounded-full border-0'>
                        <IconWithFallback
                          src={getChainIconUrl(
                            resolveChainKey(network.chain.id, network.chainKey),
                          )}
                          alt={network.chain.name}
                          fallback={network.chain.name[0] ?? 'N'}
                          sizes='30px'
                        />
                      </span>
                      {network.chain.name}
                    </span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className='thin-scrollbar grid min-h-0 auto-rows-max content-start gap-1 overflow-auto border-t border-[var(--token-list-border)] px-2 pb-2.5 pt-1 [scrollbar-gutter:stable]'>
          {loadingDynamicTokens && tokens.length === 0 ? (
            <>
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className='pointer-events-none flex min-h-14 items-center justify-between rounded-xl border border-transparent bg-transparent px-2 py-1.5'
                >
                  <div className='flex items-center gap-2.5'>
                    <span className='h-8 w-8 rounded-full border border-[var(--skeleton-border)] bg-[linear-gradient(90deg,var(--shimmer-a)_25%,var(--shimmer-b)_37%,var(--shimmer-c)_63%)] bg-[length:300%_100%] animate-pulse' />
                    <div className='grid gap-1.5'>
                      <span className='inline-block h-2.5 w-[170px] rounded-full bg-[linear-gradient(90deg,var(--shimmer-a)_25%,var(--shimmer-b)_37%,var(--shimmer-c)_63%)] bg-[length:300%_100%] animate-pulse' />
                      <span className='inline-block h-2.5 w-[110px] rounded-full bg-[linear-gradient(90deg,var(--shimmer-a)_25%,var(--shimmer-b)_37%,var(--shimmer-c)_63%)] bg-[length:300%_100%] animate-pulse' />
                    </div>
                  </div>
                  <span className='inline-block h-2.5 w-[42px] rounded-full bg-[linear-gradient(90deg,var(--shimmer-a)_25%,var(--shimmer-b)_37%,var(--shimmer-c)_63%)] bg-[length:300%_100%] animate-pulse' />
                </div>
              ))}
            </>
          ) : null}

          {tokens.map((token) => (
            <button
              key={`list-${token.address}`}
              type='button'
              className='flex min-h-14 w-full items-center justify-between rounded-xl border border-transparent bg-transparent px-2 py-1.5 text-left text-[var(--token-row-text)] hover:border-[var(--token-row-hover-border)] hover:bg-[var(--token-row-hover-bg)]'
              onClick={() => onSelectToken(token.address)}
            >
              <div className='flex items-center gap-2.5'>
                <span className={TOKEN_ICON_CLASS}>
                  <IconWithFallback
                    src={token.logoURI ?? getTokenIconUrl(token.symbol)}
                    alt={token.symbol}
                    fallback={token.symbol[0]}
                  />
                  {selectedChainIcon ? (
                    <span className='absolute bottom-0 right-0 grid h-4 w-4 place-items-center overflow-hidden rounded-full border-2 border-[var(--chain-badge-border)] bg-[var(--chain-badge-bg)]'>
                      <IconWithFallback
                        src={selectedChainIcon}
                        alt={selectedChainKey}
                        fallback=''
                        showFallback={false}
                        sizes='16px'
                      />
                    </span>
                  ) : null}
                </span>
                <div>
                  <div>{token.symbol}</div>
                  <div className={MUTED_CLASS}>
                    {token.name}{' '}
                    {token.address === 'native' ? '' : shortAddress(token.address)}
                  </div>
                </div>
              </div>
              <div className={MUTED_CLASS}>
                {displayBalance(balances[token.address.toLowerCase()])}
              </div>
            </button>
          ))}

          {canImport ? (
            <button
              type='button'
              className='flex min-h-14 w-full items-center justify-between rounded-xl border border-[var(--token-row-import-border)] bg-[var(--token-row-import-bg)] px-2 py-1.5 text-left text-[var(--token-row-text)]'
              disabled={importing}
              onClick={onImportToken}
            >
              <div>
                <div>{importing ? 'Importing...' : 'Import token by address'}</div>
                <div className={MUTED_CLASS}>{shortAddress(importAddress)}</div>
              </div>
            </button>
          ) : null}

          {importError ? <p className={MUTED_CLASS}>{importError}</p> : null}
        </div>
      </div>
    </div>
  )
}
