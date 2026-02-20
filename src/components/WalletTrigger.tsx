'use client'

import { useDynamicContext } from '@dynamic-labs/sdk-react-core'
import { ChevronDown } from 'lucide-react'

export function WalletTrigger({ className }: { className?: string }) {
    const { primaryWallet, setShowAuthFlow } = useDynamicContext()

    if (!primaryWallet) {
        return (
            <button
                type='button'
                onClick={() => setShowAuthFlow(true)}
                className={`text-xs font-medium font-mono text-[var(--neutral-text-textWeak)] ${className}`}
            >
                Connect Wallet
            </button>
        )
    }

    return (
        <button
            type='button'
            className={`flex items-center gap-2 cursor-pointer ${className}`}
            onClick={() => setShowAuthFlow(true)}
        >
            {primaryWallet?.connector?.metadata?.icon && (
                <img
                    src={primaryWallet?.connector?.metadata?.icon}
                    alt={primaryWallet?.connector?.name || 'Wallet'}
                    className='w-4 h-4'
                />
            )}
            <span className='text-xs font-medium font-mono text-[var(--neutral-text-textWeak)]'>
                {primaryWallet.address.slice(0, 6)}...{primaryWallet.address.slice(-4)}
            </span>
            <ChevronDown size={14} className='opacity-50' />
        </button>
    )
}
