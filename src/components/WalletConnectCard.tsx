'use client';

import { useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

export function WalletConnectCard() {
  const { primaryWallet, setShowAuthFlow, setShowDynamicUserProfile } =
    useDynamicContext();
  const address = primaryWallet?.address;

  const shortAddress = useMemo(() => {
    if (!address) return 'Connect Wallet';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, [address]);

  return (
    <button
      type="button"
      onClick={() =>
        primaryWallet ? setShowDynamicUserProfile(true) : setShowAuthFlow(true)
      }
      className="dynamic-wallet flex items-center gap-2 rounded-md border border-(--topbar-border) px-3 py-1.5 text-sm transition-opacity hover:opacity-80"
    >
      {primaryWallet?.connector?.metadata?.icon ? (
        // Connector icons are external runtime URLs; plain img avoids strict Next/Image domain requirements.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={primaryWallet.connector.metadata.icon}
          alt={primaryWallet.connector.name || 'Wallet'}
          className="h-4 w-4"
        />
      ) : null}
      <span>{shortAddress}</span>
      {address ? <ChevronDown size={14} className="opacity-60" /> : null}
    </button>
  );
}
