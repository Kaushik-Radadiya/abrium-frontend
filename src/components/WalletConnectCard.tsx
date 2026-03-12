'use client';

import { useMemo, useState } from 'react';
import {
  EyeIcon,
  EyeOffIcon,
  ShieldCheck,
} from 'lucide-react';
import {
  useDynamicContext,
  useTokenBalances,
} from '@dynamic-labs/sdk-react-core';
import { Button } from '@/components/ui/Button';
import { useUserInfoQuery } from '@/components/swap/hooks/useSwapQuote';
import { ShimmerImage } from '@/components/ui/ShimmerImage';
import Image from 'next/image';

export function WalletConnectCard() {
  const {
    user,
    primaryWallet,
    setShowAuthFlow,
    setShowDynamicUserProfile,
    network,
  } = useDynamicContext();
  const [isBalanceVisible, setIsBalanceVisible] = useState(false);
  const address = primaryWallet?.address;
  const chainId = useMemo(() => {
    const parsed = typeof network === 'number' ? network : Number(network);
    return Number.isFinite(parsed) ? parsed : null;
  }, [network]);
  const { tokenBalances } = useTokenBalances({
    accountAddress: address,
    networkId: chainId ?? undefined,
    includeFiat: true,
    includeNativeBalance: true,
    filterSpamTokens: true,
  });
  const totalUsdBalance = useMemo(
    () =>
      tokenBalances.reduce(
        (sum, token) =>
          sum +
          (typeof token.marketValue === 'number' &&
          Number.isFinite(token.marketValue)
            ? token.marketValue
            : 0),
        0,
      ),
    [tokenBalances],
  );
  const walletBalanceText = useMemo(() => {
    if (!address) return '$0.00';
    if (!isBalanceVisible) return '$•••••';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(totalUsdBalance);
  }, [address, isBalanceVisible, totalUsdBalance]);

  const { data: currentUserInfo } = useUserInfoQuery({
    walletAddress: address ?? null,
  });

  const isVerified = useMemo(() => {
    const payload = currentUserInfo ?? {};
    return Boolean(payload.isVerified ?? payload.is_verified);
  }, [currentUserInfo]);

  const isWealthPassport = Boolean(address && isVerified);
  return (
    <Button
      onClick={() =>
        primaryWallet ? setShowDynamicUserProfile(true) : setShowAuthFlow(true)
      }
      className={`text-sm! items-center p-0 justify-between ${address || user ? '' : '!bg-[var(--neutral-background-strong)]'}`}
    >
      {address ? (
        <span className='relative grid place-items-center'>
          {isWealthPassport ? (
            <span className='grid size-full place-items-center rounded-full bg-[linear-gradient(145deg,#6b4f15,#d6b65d,#2f7a40)] text-[#f4e7b7]'>
              <ShieldCheck size={14} />
            </span>
          ) : (
            <>
              <ShimmerImage
                src='/assets/abrium.png'
                alt='Chain'
                fallback='C'
                sizes='24px'
                containerClassName='h-6 w-6 rounded-full bg-[var(--neutral-background-raised-hover)]'
                imageClassName='object-cover'
              />
            </>
          )}
        </span>
      ) : user ? (
        <Image
          src='/assets/guest-user.svg'
          width={26}
          height={26}
          alt='Guest User'
        />
      ) : null}

      <span
        className={`text-base font-medium ${address || user ? 'text-[var(--neutral-text-textStrong)] font-mono' : 'text-[var(--neutral-background)]'}`}
      >
        {!address && !user ? 'Connect Wallet' : walletBalanceText}
      </span>
      {address ? (
        <span
          role='button'
          tabIndex={0}
          aria-label={isBalanceVisible ? 'Hide balance' : 'Show balance'}
          className='ps-2.5 border-l border-(--neutral-border) opacity-60 hover:opacity-100'
          onClick={(event) => {
            event.stopPropagation();
            setIsBalanceVisible((previous) => !previous);
          }}
          onKeyDown={(event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            event.stopPropagation();
            setIsBalanceVisible((previous) => !previous);
          }}
        >
          {isBalanceVisible ? <EyeIcon size={20} /> : <EyeOffIcon size={20} />}
        </span>
      ) : null}
    </Button>
  );
}
