'use client';

import { type UIEvent, useCallback, useMemo, useState } from 'react';
import moment from 'moment';
import { SupportedChain, getChainKey } from '@/lib/chains';
import { UiToken } from '@/lib/tokens';
import { getChainIconUrl, getTokenIconUrl } from '@/lib/icons';
import { IconWithFallback } from '@/components/swap/IconWithFallback';
import {
  buildTokenPerformanceRows,
  displayBalance,
  formatPercentChange,
  formatPriceDetails,
} from '@/components/swap/utils';
import { ChevronDownIcon, SearchIcon, ChevronLeftIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn, formatSecurityUpdatedAt, showAddress } from '@/lib/utils';
import type { SecurityLevel } from '@/lib/api';

type RuntimeNetwork = {
  chain: SupportedChain;
  chainKey?: string;
  logoURI?: string;
};

type Props = {
  open: boolean;
  query: string;
  onQueryChange: (value: string) => void;
  chainId: number;
  selectedChainIcon: string | null;
  selectedChainKey: string;
  networkMenuOpen: boolean;
  setNetworkMenuOpen: (open: boolean) => void;
  networks: RuntimeNetwork[];
  onChainSelect: (chainId: number) => void;
  tokens: UiToken[];
  balances: Record<string, string>;
  onSelectToken: (address: string) => void;
  loadingDynamicTokens: boolean;
  showImportOption: boolean;
  canImport: boolean;
  importing: boolean;
  importAddress: string;
  onImportToken: () => void;
  importError: string | null;
  onClose: () => void;
};

const MUTED_CLASS = 'text-xs uppercase text-[var(--neutral-text-textWeak)]';
const TOKEN_ICON_CLASS =
  'relative grid h-10 max-w-10 w-full place-items-center overflow-visible rounded-full bg-[var(--token-icon-bg)] text-sm font-bold text-[var(--token-icon-text)]';
const TOKENS_PAGE_SIZE = 200;

function resolveChainKey(chainId: number, chainKey?: string) {
  if (chainKey) return chainKey;
  return getChainKey(chainId) || 'network';
}

function getSecurityBadgeClassName(level?: SecurityLevel | null) {
  if (level === 'verified') {
    return 'border-[var(--neutral-border-sucess)] bg-[color:color-mix(in_srgb,var(--neutral-background-sucess)_16%,transparent)] text-[var(--neutral-text-sucess)]';
  }

  if (level === 'danger') {
    return 'border-[var(--neutral-border-error)] bg-[color:color-mix(in_srgb,var(--neutral-background-error)_16%,transparent)] text-[var(--neutral-text-error)]';
  }

  if (level === 'caution') {
    return 'border-[var(--alert-warning-border)] bg-[var(--alert-warning-bg)] text-[var(--alert-warning-text)]';
  }
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
  const currentChainKey = resolveChainKey(
    chainId,
    selectedChainKey || undefined,
  );
  const currentChainIcon =
    selectedChainIcon ?? getChainIconUrl(currentChainKey);
  const [visibleCount, setVisibleCount] = useState(TOKENS_PAGE_SIZE);

  const visibleTokens = useMemo(() => {
    return tokens.slice(0, visibleCount);
  }, [tokens, visibleCount]);

  const canLoadMoreTokens = visibleTokens.length < tokens.length;

  const tokenRows = useMemo(
    () =>
      visibleTokens.map((token) => {
        const performanceRows = buildTokenPerformanceRows(token);

        return (
          <Tooltip key={`tooltip-${token.address}`}>
            <TooltipTrigger asChild>
              <Button
                size='none'
                variant='ghost'
                key={`list-${token.address}`}
                className='flex min-h-14 w-full items-center justify-between rounded-xl border px-2 py-1.5 text-left text-[var(--token-row-text)] hover:bg-[var(--neutral-background-raised-hover)]'
                onClick={() => onSelectToken(token.address)}
              >
                <div className='flex min-w-0 flex-1 items-center gap-3.5'>
                  <span className={TOKEN_ICON_CLASS}>
                    <IconWithFallback
                      src={token.logoURI ?? getTokenIconUrl(token.symbol)}
                      alt={token.symbol}
                      fallback={token.symbol[0]}
                    />
                    {selectedChainIcon ? (
                      <span className='absolute bottom-0 -right-2 grid h-5 w-5 place-items-center overflow-hidden rounded-full border-2 border-[var(--chain-badge-border)] bg-[var(--chain-badge-bg)]'>
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
                    <div
                      className={`${MUTED_CLASS} flex min-w-0 items-center gap-1`}
                    >
                      <span className='truncate'>{token.name}</span>
                      {token.address === 'native' ? null : (
                        <span className='shrink-0'>
                          {showAddress(token.address)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className='flex flex-col shrink-0 items-end gap-1'>
                  <span className='text-sm'>
                    {formatPriceDetails(token.priceUsd)}
                  </span>
                  <span
                    className={cn(
                      'text-xs',
                      formatPercentChange(token.priceChange24hPercent)
                        .className,
                    )}
                  >
                    {formatPercentChange(token.priceChange24hPercent).value}
                  </span>
                </div>
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side='right'
              align='center'
              sideOffset={12}
              collisionPadding={12}
              showArrow={false}
              className='w-63 rounded-xl border border-[var(--neutral-border)] bg-[var(--neutral-background)] p-1 text-[var(--neutral-text)] shadow-[0_16px_42px_rgba(0,0,0,0.42)] block'
            >
              <div className='text-base font-medium text-[var(--neutral-text)] px-3 py-2 border-b border-(--neutral-border)'>
                Price performance
              </div>
              <div className='grid'>
                {performanceRows.map((row) => (
                  <div
                    key={`${token.address}-${row.label}`}
                    className='flex items-center justify-between text-sm px-3 py-1'
                  >
                    <span className='text-(--neutral-text-textWeak)'>
                      {row.label}
                    </span>
                    <span className={row.valueClassName}>{row.value}</span>
                  </div>
                ))}
              </div>
              <div className='flex mt-2 items-center justify-between border-t border-(--neutral-border) text-sm px-3 py-1'>
                <div className='text-(--neutral-text-textWeak)'>
                  Current balance
                </div>
                <div className={`${MUTED_CLASS} shrink-0`}>
                  {displayBalance(balances[token.address.toLowerCase()])}
                </div>
              </div>
              <div className='flex items-center justify-between text-sm px-3 py-1'>
                <div className='text-(--neutral-text-textWeak)'>Risk badge</div>
                {token.securityLevel ? (
                  <div
                    className={cn(
                      'rounded-full border px-2 py-0.5 text-xs font-medium capitalize',
                      getSecurityBadgeClassName(token.securityLevel),
                    )}
                  >
                    {token.securityLevel}
                  </div>
                ) : (
                  <div className={MUTED_CLASS}>--</div>
                )}
              </div>
              <div className='flex items-center justify-between text-sm px-3 py-1'>
                <div className='text-(--neutral-text-textWeak)'>
                  Last synced
                </div>
                <div className='text-[10px] uppercase text-[var(--neutral-text-textWeak)] text-right'>
                  {formatSecurityUpdatedAt(token.securityUpdatedAt)}
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        );
      }),
    [
      balances,
      onSelectToken,
      selectedChainIcon,
      selectedChainKey,
      visibleTokens,
    ],
  );

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

  if (!open) return null;

  return (
    <div className='flex relative h-full items-start w-full min-h-0 pl-7 mx-auto min-[1441px]:min-w-117 xl:max-w-110 min-[1441px]:max-w-max sm:max-w-90'>
      <div className='border w-full border-[var(--neutral-border)] rounded-2xl bg-[var(--neutral-background)] text-[var(--neutral-text)]'>
        {/* Header */}
        <div className='sticky top-0 z-20 flex items-center gap-3 py-4 px-3 rounded-tl-2xl rounded-tr-2xl bg-[var(--neutral-background)]'>
          <button
            onClick={onClose}
            className='z-10 absolute -left-13.5 top-1 rounded-full bg-[var(--neutral-background-raised-hover)] p-2'
          >
            <ChevronLeftIcon className='size-6 opacity-70' />
          </button>
          <div className='w-full flex py-1 px-3 items-center gap-2.5 rounded-lg border border-[var(--search-row-border)] bg-[var(--search-row-bg)]'>
            <span
              className='text-lg leading-none opacity-70'
              aria-hidden='true'
            >
              <SearchIcon className='text-[var(--arrow-icon-btn)] size-5' />
            </span>
            <input
              className='min-h-0 flex-1 border-0 bg-transparent p-0 text-base text-[var(--neutral-text-textWeek)] outline-none placeholder:text-[var(--neutral-text-placeholder)]'
              value={query}
              onChange={(event) => {
                setVisibleCount(TOKENS_PAGE_SIZE);
                onQueryChange(event.target.value);
              }}
              placeholder='Search tokens or paste address'
            />
            <div className='relative ml-auto flex justify-center'>
              <DropdownMenu
                open={networkMenuOpen}
                onOpenChange={setNetworkMenuOpen}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant='ghost'
                    size='none'
                    type='button'
                    className='inline-flex min-h-[34px] min-w-[54px] items-center justify-end gap-2 rounded-[10px] border-0 bg-transparent p-0 text-[var(--search-text)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--network-item-active-border)]'
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
                    <span
                      className={cn(
                        'text-sm leading-none transition-transform duration-200 text-[var(--network-chevron)]',
                        { 'rotate-180': networkMenuOpen },
                      )}
                    >
                      <ChevronDownIcon className='size-4' />
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align='end'
                  className='z-60 grid max-h-[min(62vh,220px)] w-55 gap-0.5 overflow-y-auto rounded-xl border border-[var(--neutral-border)] bg-[var(--neutral-background)] p-1.5'
                >
                  {networks.map((network) => (
                    <DropdownMenuItem
                      key={`network-${network.chain.id}`}
                      className={`rounded-lg flex py-1 px-2.5 text-left cursor-pointer ${
                        network.chain.id === chainId
                          ? 'border-none bg-[var(--neutral-background-raised-hover)] text-[var(--network-item-active-text)] focus:bg-[var(--neutral-background-raised-hover)] focus:text-[var(--network-item-active-text)]'
                          : 'border border-transparent bg-transparent text-[var(--network-item-text)] hover:bg-[var(--neutral-background-raised-hover)] focus:bg-[var(--neutral-background-raised-hover)]'
                      }`}
                      onSelect={() => {
                        setVisibleCount(TOKENS_PAGE_SIZE);
                        onChainSelect(network.chain.id);
                        setNetworkMenuOpen(false);
                      }}
                    >
                      <span className='inline-flex items-center gap-2'>
                        <span className='relative size-5 overflow-hidden rounded-full border-0'>
                          <IconWithFallback
                            src={
                              network.logoURI ??
                              getChainIconUrl(
                                resolveChainKey(
                                  network.chain.id,
                                  network.chainKey,
                                ),
                              )
                            }
                            alt={network.chain.name}
                            fallback={network.chain.name[0] ?? 'N'}
                            sizes='30px'
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
        </div>

        <div
          className='flex-1 gap-1 overflow-auto px-2 pb-2.5 pt-1'
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
                      <span className='inline-block h-2.5 w-42.5 rounded-full bg-[linear-gradient(90deg,var(--shimmer-a)_25%,var(--shimmer-b)_37%,var(--shimmer-c)_63%)] bg-[length:300%_100%] animate-pulse' />
                      <span className='inline-block h-2.5 w-[110px] rounded-full bg-[linear-gradient(90deg,var(--shimmer-a)_25%,var(--shimmer-b)_37%,var(--shimmer-c)_63%)] bg-[length:300%_100%] animate-pulse' />
                    </div>
                  </div>
                  <span className='inline-block h-2.5 w-[42px] rounded-full bg-[linear-gradient(90deg,var(--shimmer-a)_25%,var(--shimmer-b)_37%,var(--shimmer-c)_63%)] bg-[length:300%_100%] animate-pulse' />
                </div>
              ))}
            </>
          ) : null}

          {tokenRows}

          {canLoadMoreTokens ? (
            <Button
              variant='ghost'
              size='none'
              type='button'
              className='mx-2 justify-between mt-1 rounded-lg border border-[var(--neutral-border)] px-3 py-2 text-left text-xs uppercase text-[var(--neutral-text-textWeak)] hover:bg-[var(--neutral-background-raised-hover)]'
              onClick={() =>
                setVisibleCount((current) =>
                  Math.min(current + TOKENS_PAGE_SIZE, tokens.length),
                )
              }
            >
              Show more tokens ({tokens.length - visibleTokens.length}{' '}
              remaining)
            </Button>
          ) : null}

          {showImportOption ? (
            <Button
              variant='ghost'
              size='none'
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
                    ? showAddress(importAddress)
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
      </div>
    </div>
  );
}
