'use client'

import { PropsWithChildren, useMemo, useState } from 'react'
import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core'
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { baseSepolia, mainnet, polygon, polygonAmoy, sepolia } from 'wagmi/chains'
import { SUPPORTED_CHAINS } from '@/lib/chains'

const dynamicEnvironmentId =
  process.env.NEXT_PUBLIC_DYNAMIC_ENV_ID ?? 'REPLACE_WITH_DYNAMIC_ENV_ID'
const supportedChainIds = new Set(SUPPORTED_CHAINS.map((chain) => chain.id))
const wagmiChains = [mainnet, polygon, sepolia, baseSepolia, polygonAmoy].filter((chain) =>
  supportedChainIds.has(chain.id)
)

export function AppProviders({ children }: PropsWithChildren) {
  const [queryClient] = useState(() => new QueryClient())

  const wagmiConfig = useMemo(
    () =>
      createConfig({
        chains: wagmiChains,
        transports: {
          ...(supportedChainIds.has(mainnet.id) && {
            [mainnet.id]: http(
            process.env.NEXT_PUBLIC_RPC_ETH_MAINNET ??
              'https://ethereum-rpc.publicnode.com'
            ),
          }),
          ...(supportedChainIds.has(polygon.id) && {
            [polygon.id]: http(
            process.env.NEXT_PUBLIC_RPC_POLYGON ?? 'https://polygon-bor-rpc.publicnode.com'
            ),
          }),
          ...(supportedChainIds.has(sepolia.id) && {
            [sepolia.id]: http(
            process.env.NEXT_PUBLIC_RPC_SEPOLIA ??
              'https://ethereum-sepolia-rpc.publicnode.com'
            ),
          }),
          ...(supportedChainIds.has(baseSepolia.id) && {
            [baseSepolia.id]: http(
            process.env.NEXT_PUBLIC_RPC_BASE_SEPOLIA ?? 'https://sepolia.base.org'
            ),
          }),
          ...(supportedChainIds.has(polygonAmoy.id) && {
            [polygonAmoy.id]: http(
            process.env.NEXT_PUBLIC_RPC_POLYGON_AMOY ??
              'https://rpc-amoy.polygon.technology'
            ),
          }),
        },
      }),
    []
  )

  return (
    <DynamicContextProvider
      settings={{
        environmentId: dynamicEnvironmentId,
        walletConnectors: [EthereumWalletConnectors],
      }}
    >
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </WagmiProvider>
    </DynamicContextProvider>
  )
}
