'use client'

import { useMemo } from 'react'
import { DynamicWidget, useDynamicContext } from '@dynamic-labs/sdk-react-core'

export function WalletConnectCard() {
  const { primaryWallet } = useDynamicContext()
  const address = primaryWallet?.address

  const shortAddress = useMemo(() => {
    if (!address) return 'Connect Wallet'
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }, [address])

  return (
    <div className='dynamic-wallet flex'>
      <DynamicWidget innerButtonComponent={shortAddress} />
    </div>
  )
}
