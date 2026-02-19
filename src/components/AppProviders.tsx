'use client';

import { PropsWithChildren, useCallback, useState } from 'react';
import {
  DynamicContextProvider,
  DynamicUserProfile,
  overrideNetworkRpcUrl,
  useDynamicContext,
  useDynamicEvents,
} from '@dynamic-labs/sdk-react-core';
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import {
  baseSepolia,
  mainnet,
  polygon,
  polygonAmoy,
  sepolia,
} from 'wagmi/chains';

const dynamicEnvironmentId =
  process.env.NEXT_PUBLIC_DYNAMIC_ENV_ID ?? 'REPLACE_WITH_DYNAMIC_ENV_ID';

const createRpcCandidates = (
  configuredRpcUrl: string | undefined,
  defaultRpcUrl: string,
  backupRpcUrls: string[] = [],
) => [configuredRpcUrl ?? defaultRpcUrl, ...backupRpcUrls];

const mainnetRpcCandidates = createRpcCandidates(
  process.env.NEXT_PUBLIC_RPC_ETH_MAINNET,
  'https://ethereum-rpc.publicnode.com',
  ['https://eth-mainnet.public.blastapi.io'],
);
const polygonRpcCandidates = createRpcCandidates(
  process.env.NEXT_PUBLIC_RPC_POLYGON,
  'https://polygon-bor-rpc.publicnode.com',
  ['https://polygon-rpc.com'],
);
const sepoliaRpcCandidates = createRpcCandidates(
  process.env.NEXT_PUBLIC_RPC_SEPOLIA,
  'https://ethereum-sepolia-rpc.publicnode.com',
);
const baseSepoliaRpcCandidates = createRpcCandidates(
  process.env.NEXT_PUBLIC_RPC_BASE_SEPOLIA,
  'https://sepolia.base.org',
  ['https://base-sepolia-rpc.publicnode.com'],
);
const polygonAmoyRpcCandidates = createRpcCandidates(
  process.env.NEXT_PUBLIC_RPC_POLYGON_AMOY,
  'https://rpc-amoy.polygon.technology',
);

const wagmiChainsTuple = [
  mainnet,
  polygon,
  sepolia,
  baseSepolia,
  polygonAmoy,
] as const;
const wagmiConfig = createConfig({
  chains: wagmiChainsTuple,
  multiInjectedProviderDiscovery: false,
  transports: {
    [mainnet.id]: http(mainnetRpcCandidates[0]),
    [polygon.id]: http(polygonRpcCandidates[0]),
    [sepolia.id]: http(sepoliaRpcCandidates[0]),
    [baseSepolia.id]: http(baseSepoliaRpcCandidates[0]),
    [polygonAmoy.id]: http(polygonAmoyRpcCandidates[0]),
  },
});
const dynamicRpcOverrides: Record<string, string[]> = {
  [mainnet.id]: mainnetRpcCandidates,
  [polygon.id]: polygonRpcCandidates,
  [sepolia.id]: sepoliaRpcCandidates,
  [baseSepolia.id]: baseSepoliaRpcCandidates,
  [polygonAmoy.id]: polygonAmoyRpcCandidates,
};
const applyDynamicRpcOverrides = (
  dashboardNetworks: Parameters<typeof overrideNetworkRpcUrl>[0],
) => overrideNetworkRpcUrl(dashboardNetworks, dynamicRpcOverrides);

const dynamicSettings = {
  environmentId: dynamicEnvironmentId,
  initialAuthenticationMode: 'connect-only' as const,
  social: { strategy: 'popup' as const },
  walletConnectors: [EthereumWalletConnectors],
  useMetamaskSdk: false,
  localStorageSuffix: 'abrium-dynamic-v4',
  overrides: {
    evmNetworks: applyDynamicRpcOverrides,
  },
};

function DynamicEmbeddedWalletFlowGuard() {
  const { setShowAuthFlow } = useDynamicContext();

  const handleEmbeddedWalletCreated = useCallback(() => {
    setShowAuthFlow(false);
  }, [setShowAuthFlow]);

  useDynamicEvents('embeddedWalletCreated', handleEmbeddedWalletCreated);

  return null;
}

export function AppProviders({ children }: PropsWithChildren) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <DynamicContextProvider settings={dynamicSettings}>
      <DynamicEmbeddedWalletFlowGuard />
      <DynamicUserProfile variant="modal" />
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </WagmiProvider>
    </DynamicContextProvider>
  );
}
