'use client'

import { type UIEvent, useCallback,  useMemo, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import { SupportedChain } from '@/lib/chains'
import { UiToken } from '@/lib/tokens'
import { getChainIconUrl, getTokenIconUrl } from '@/lib/icons'
import { IconWithFallback } from '@/components/swap/IconWithFallback'
import { displayBalance, shortAddress } from '@/components/swap/utils'
import { ChevronDownIcon, ChevronUpIcon, SearchIcon, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'

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
  showImportOption: boolean
  canImport: boolean
  importing: boolean
  importAddress: string
  onImportToken: () => void
  importError: string | null
  onClose: () => void
}

const MUTED_CLASS = 'text-xs uppercase text-[var(--neutral-text-textWeak)]'
const TOKEN_ICON_CLASS =
  'relative grid h-8 w-8 place-items-center overflow-visible rounded-full border-0 bg-[var(--token-icon-bg)] text-xs font-bold text-[var(--token-icon-text)]'
const TOKENS_PAGE_SIZE = 200

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
  showImportOption,
  canImport,
  importing,
  importAddress,
  onImportToken,
  importError,
  onClose,
}: Props) {
  const currentChainKey = resolveChainKey(chainId, selectedChainKey || undefined)
  const currentChainIcon = selectedChainIcon ?? getChainIconUrl(currentChainKey)
  const [visibleCount, setVisibleCount] = useState(TOKENS_PAGE_SIZE)
  const hasSearchQuery = query.trim().length > 0
  const visibleTokens = useMemo(() => {
    if (hasSearchQuery) return tokens
    return tokens.slice(0, visibleCount)
  }, [hasSearchQuery, tokens, visibleCount])
  const canLoadMoreTokens = !hasSearchQuery && visibleTokens.length < tokens.length



  const onTokenListScroll = useCallback(
    (event: UIEvent<HTMLDivElement>) => {
      if (!canLoadMoreTokens) return;

      const element = event.currentTarget;
      const remaining =
        element.scrollHeight - (element.scrollTop + element.clientHeight);
      if (remaining > 120) return;

      setVisibleCount((current) =>
        Math.min(current + TOKENS_PAGE_SIZE, tokens.length),
      );
    },
    [canLoadMoreTokens, tokens.length, setVisibleCount],
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent
        showCloseButton={true}
        className="flex flex-col h-[min(700px,85vh)] w-full gap-2 max-w-[430px] overflow-hidden rounded-[18px] border border-[var(--swap-token-border)] bg-[var(--neutral-background-raised)] text-[var(--modal-text)]"
        onClick={(event) => event.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle className="text-base font-normal">
            Select a token
          </DialogTitle>
        </DialogHeader>

        <div className="mx-[14px] flex py-1 px-3 items-center gap-2.5 rounded-full border border-[var(--search-row-border)] bg-[var(--search-row-bg)]">
          <span className="text-lg leading-none opacity-70" aria-hidden="true">
            <SearchIcon className="text-[var(--arrow-icon-btn)] size-5" />
          </span>
          <input
            className="min-h-0 flex-1 border-0 bg-transparent p-0 text-base text-[var(--neutral-text-textWeek)] outline-none placeholder:text-[var(--neutral-text-placeholder)]"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search tokens or paste address"
          />
          <div className="relative ml-auto flex justify-center">
            <DropdownMenu open={networkMenuOpen} onOpenChange={setNetworkMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="none"
                  type="button"
                  className="inline-flex min-h-[34px] min-w-[54px] items-center justify-end gap-2 rounded-[10px] border-0 bg-transparent p-0 text-[var(--search-text)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--network-item-active-border)]"
                >
                  <span className='inline-flex items-center'>
                    {currentChainIcon ? (
                      <span className='relative size-4 overflow-hidden rounded-full border-0'>
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
                    {networkMenuOpen ? <ChevronUpIcon className='text-[var(--arrow-icon-btn)] size-4' /> : <ChevronDownIcon className='text-[var(--arrow-icon-btn)] size-4' />}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="thin-scrollbar z-[60] grid max-h-[min(62vh,420px)] w-[220px] gap-0.5 overflow-y-auto rounded-xl border border-[var(--neutral-border)] bg-[var(--neutral-background)] p-1.5"
              >
                {networks.map((network) => (
                  <DropdownMenuItem
                    key={`network-${network.chain.id}`}
                    className={`rounded-lg flex py-1 px-2.5 text-left cursor-pointer ${network.chain.id === chainId
                      ? 'border-none bg-[var(--neutral-background-raised-hover)] text-[var(--network-item-active-text)] focus:bg-[var(--neutral-background-raised-hover)] focus:text-[var(--network-item-active-text)]'
                      : 'border border-transparent bg-transparent text-[var(--network-item-text)] hover:bg-[var(--neutral-background-raised-hover)] focus:bg-[var(--neutral-background-raised-hover)]'
                      }`}
                    onSelect={() => {
                      onChainSelect(network.chain.id);
                      setNetworkMenuOpen(false);
                    }}
                  >
                    <span className="inline-flex items-center gap-2">
                      <span className="relative size-5 overflow-hidden rounded-full border-0">
                        <IconWithFallback
                          src={getChainIconUrl(
                            resolveChainKey(network.chain.id, network.chainKey),
                          )}
                          alt={network.chain.name}
                          fallback={network.chain.name[0] ?? 'N'}
                          sizes="30px"
                        />
                      </span>
                      {network.chain.name}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div
          className='thin-scrollbar min-h-0 gap-1 overflow-auto px-2 pb-2.5 pt-1 me-1'
          onScroll={onTokenListScroll}
        >
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

          {visibleTokens.map((token) => (
            <Button
              size="none"
              variant='ghost'
              key={`list-${token.address}`}
              className='flex min-h-14 w-full items-center justify-between rounded-xl border px-2 py-1.5 text-left text-[var(--token-row-text)] hover:bg-[var(--neutral-background-raised-hover)]'
              onClick={() => onSelectToken(token.address)}
            >
              <div className='flex min-w-0 flex-1 items-center gap-2.5'>
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
                <div className='min-w-0 flex flex-col gap-1'>
                  <div className='truncate text-base font-medium text-[var(--neutral-text)]'>
                    {token.symbol}
                  </div>
                  <div className={`${MUTED_CLASS} flex min-w-0 items-center gap-1`}>
                    <span className='truncate'>{token.name}</span>
                    {token.address === 'native' ? null : (
                      <span className='shrink-0'>{shortAddress(token.address)}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className={`${MUTED_CLASS} shrink-0`}>
                {displayBalance(balances[token.address.toLowerCase()])}
              </div>
            </Button>
          ))}

          {canLoadMoreTokens ? (
            <Button
              variant="ghost"
              size="none"
              type='button'
              className='mx-2 justify-between mt-1 rounded-lg border border-[var(--neutral-border)] px-3 py-2 text-left text-xs uppercase text-[var(--neutral-text-textWeak)] hover:bg-[var(--neutral-background-raised-hover)]'
              onClick={() =>
                setVisibleCount((current) =>
                  Math.min(current + TOKENS_PAGE_SIZE, tokens.length),
                )
              }
            >
              Show more tokens ({tokens.length - visibleTokens.length} remaining)
            </Button>
          ) : null}

          {showImportOption ? (
            <Button
              variant="ghost"
              size="none"
              type='button'
              className={`flex min-h-14 w-full items-center justify-between rounded-xl border-2 px-2 py-1.5 text-left text-[var(--token-row-text)] ${
                    importError
                      ? 'border-[var(--alert-error-border)] bg-[var(--alert-error-bg)]'
                      : 'border-[var(--token-row-import-border)] bg-[var(--token-row-import-bg)]'
                  }`}
              disabled={importing || !canImport}
              onClick={onImportToken}
            >
              <div>
                <div>
                      {importing
                        ? 'Importing...'
                        : canImport
                          ? 'Import token by address'
                          : 'Paste a valid 0x token address'}
                    </div>
                <div className={MUTED_CLASS}>
                      {canImport
                        ? shortAddress(importAddress)
                        : 'Only EVM token addresses are supported'}
                    </div>
              </div>
            </Button>
          ) : null}

          {importError ? (
                <p className='px-1 pt-1 text-xs font-medium uppercase tracking-[0.02em] text-[var(--alert-error-text)]'>
                  {importError}
                </p>
              ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
