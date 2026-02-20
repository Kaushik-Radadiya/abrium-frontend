'use client';

import { useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { getChainKey } from '@/lib/chains';
import { getChainIconUrl } from '@/lib/icons';

export function WalletConnectCard() {
  const { primaryWallet, setShowAuthFlow, setShowDynamicUserProfile } =
    useDynamicContext();
  const address = primaryWallet?.address;
  const chainId = (primaryWallet as any)?.connector?.activeChain?.id;
  const shortAddress = useMemo(() => {
    if (!address) return 'Connect Wallet';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, [address]);

  const chainIcon = useMemo(() => {
    if (!chainId) return null;
    const key = getChainKey(chainId);
    if (!key) return null;
    return getChainIconUrl(key);
  }, [chainId]);

  return (
    <button
      type="button"
      onClick={() =>
        primaryWallet ? setShowDynamicUserProfile(true) : setShowAuthFlow(true)
      }
      className={`flex items-center gap-2 rounded-full border border-(--neutral-border) px-3 py-2 text-sm ${address ? "bg-[var(--neutral-background-raised)]" : "bg-[var(--neutral-background-strong)]"}`}
    >
      {/* {primaryWallet?.connector?.metadata?.icon ? (
        <img
          src={primaryWallet.connector.metadata.icon}
          alt={primaryWallet.connector.name || 'Wallet'}
          className="h-4 w-4"
        />
      ) : null} */}

      {chainIcon ? (
        <img
          src={chainIcon}
          alt="Chain"
          className="h-4 w-4 rounded-full"
        />
      ) : null}

      <span className={`text-sm font-medium ${address ? "text-[var(--neutral-text-textStrong)] font-mono" : "text-[var(--neutral-background)]"}`}>{shortAddress}</span>
      {address ? <ChevronDown size={14} className="opacity-60" /> : null}
    </button>
  );
}
