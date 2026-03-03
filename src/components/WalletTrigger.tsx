'use client';

import {
  useDynamicContext,
  useDynamicModals,
  useSwitchWallet,
  useUserWallets,
} from '@dynamic-labs/sdk-react-core';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { WalletIcon } from '@/components/ui/WalletIcon';
import { cn, showAddress } from '@/lib/utils';

export function WalletTrigger({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const { primaryWallet, setShowAuthFlow } = useDynamicContext();
  const { setShowLinkNewWalletModal } = useDynamicModals();
  const switchWallet = useSwitchWallet();
  const userWallets = useUserWallets();

  if (!primaryWallet) {
    return (
      <Button
        variant="ghost"
        size="none"
        type="button"
        onClick={() => setShowAuthFlow(true)}
        className={`text-xs justify-center font-medium font-mono text-[var(--neutral-text-textWeak)] ${className}`}
      >
        Connect Wallet
      </Button>
    );
  }

  const linkedWallets = Array.from(
    new Map(
      [primaryWallet, ...userWallets]
        .filter((wallet) => Boolean(wallet.address))
        .map((wallet) => [wallet.id, wallet]),
    ).values(),
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="none"
          type="button"
          className={cn(
            'flex items-center justify-center gap-2 rounded-full border border-[var(--neutral-border)] bg-[var(--neutral-background-raised)]',
            className,
          )}
        >
          <span className="flex items-center gap-2">
            <span className="grid size-[18px] place-items-center">
              <WalletIcon
                icon={primaryWallet.connector?.metadata?.icon}
                label={primaryWallet.connector?.name || 'Wallet'}
                className="bg-transparent"
              />
            </span>
            <span className="text-xs font-medium font-mono text-[var(--neutral-text-textWeak)]">
              {showAddress(primaryWallet.address)}
            </span>
          </span>
          <ChevronDown
            size={14}
            className={cn(
              'opacity-50 transition-transform',
              open && 'rotate-180',
            )}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={8}
        className="z-[80] w-[220px] rounded-2xl border border-[var(--neutral-border)] bg-[var(--neutral-background-raised)] shadow-[0_20px_60px_rgba(15,23,42,0.14)]"
      >
        <div className="flex flex-col gap-2">
          {linkedWallets.map((wallet) => (
            <DropdownMenuItem
              key={wallet.id}
              className={cn(
                'cursor-pointer rounded-xl border px-3 py-2.5 text-left hover:bg-[var(--neutral-background-hover)] focus:bg-[var(--neutral-background-hover)]',
                wallet.id === primaryWallet.id
                  ? 'border-[var(--neutral-border)] bg-[var(--neutral-background)]'
                  : 'border-[var(--neutral-border)] bg-[var(--neutral-background-raised)]',
              )}
              onSelect={async () => {
                if (wallet.id === primaryWallet.id) {
                  setOpen(false);
                  return;
                }

                try {
                  await switchWallet(wallet.id);
                  setOpen(false);
                } catch (error) {
                  console.error('Failed to switch wallet', error);
                }
              }}
            >
              <span className="flex min-w-0 flex-1 items-center gap-2.5">
                <span className="grid size-5 shrink-0 place-items-center">
                  <WalletIcon
                    icon={wallet.connector?.metadata?.icon}
                    label={wallet.connector?.name || 'Wallet'}
                    size="20px"
                    className="bg-transparent"
                  />
                </span>
                <span className="truncate font-mono text-[15px] text-[var(--neutral-text-textStrong)]">
                  {showAddress(wallet.address)}
                </span>
              </span>
            </DropdownMenuItem>
          ))}
        </div>

        <DropdownMenuItem
          className="cursor-pointer rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--neutral-text-textStrong)] hover:bg-[var(--neutral-background-hover)] focus:bg-[var(--neutral-background-hover)]"
          onSelect={() => {
            setOpen(false);
            setShowLinkNewWalletModal(true);
          }}
        >
          Connect a new wallet
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
