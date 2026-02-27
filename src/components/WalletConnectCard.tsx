'use client';

import { useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { getChainKey } from '@/lib/chains';
import { getChainIconUrl } from '@/lib/icons';
import { Button } from '@/components/ui/Button';

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
    <Button
      onClick={() =>
        primaryWallet ? setShowDynamicUserProfile(true) : setShowAuthFlow(true)
      }
      className={`!text-sm items-center justify-center ${address ? "" : "!bg-[var(--neutral-background-strong)]"}`}
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
    </Button>
  );
}
