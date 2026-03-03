'use client';

import { useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { getChainKey } from '@/lib/chains';
import { getChainIconUrl } from '@/lib/icons';
import { Button } from '@/components/ui/Button';
import { ShimmerImage } from '@/components/ui/ShimmerImage';
import { showAddress } from '@/lib/utils';

export function WalletConnectCard() {
  const { primaryWallet, setShowAuthFlow, setShowDynamicUserProfile, network } =
    useDynamicContext();
  const address = primaryWallet?.address;
  const chainId = useMemo(() => {
    const parsed = typeof network === 'number' ? network : Number(network);
    return Number.isFinite(parsed) ? parsed : null;
  }, [network]);
  const shortWalletAddress = useMemo(() => {
    if (!address) return 'Connect Wallet';
    return showAddress(address);
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
      className={`!text-sm items-center justify-center ${address ? '' : '!bg-[var(--neutral-background-strong)]'}`}
    >
      {chainIcon ? (
        <ShimmerImage
          src={chainIcon}
          alt="Chain"
          fallback="C"
          sizes="16px"
          containerClassName="h-4 w-4 rounded-full bg-[var(--neutral-background-raised-hover)]"
          imageClassName="object-cover"
        />
      ) : null}

      <span
        className={`text-sm font-medium ${address ? 'text-[var(--neutral-text-textStrong)] font-mono' : 'text-[var(--neutral-background)]'}`}
      >
        {shortWalletAddress}
      </span>
      {address ? <ChevronDown size={14} className="opacity-60" /> : null}
    </Button>
  );
}
