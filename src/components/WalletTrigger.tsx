'use client'

import { useDynamicContext } from '@dynamic-labs/sdk-react-core'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function WalletTrigger({ className }: { className?: string }) {
    const { primaryWallet, setShowAuthFlow } = useDynamicContext()

    if (!primaryWallet) {
        return (
            <Button
                variant="ghost"
                size="none"
                type='button'
                onClick={() => setShowAuthFlow(true)}
                className={`text-xs justify-center font-medium font-mono text-[var(--neutral-text-textWeak)] ${className}`}
            >
                Connect Wallet
            </Button>
        )
    }

    return (
        <Button
            variant="ghost"
            size="none"
            type='button'
            className={`flex items-center justify-center gap-2 cursor-pointer ${className}`}
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
        </Button>
    )
}
