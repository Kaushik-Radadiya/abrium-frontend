'use client';

import { PropsWithChildren, useCallback, useMemo, useState } from 'react';
import {
  SdkViewType,
  SdkViewSectionType,
  type SdkView,
} from '@dynamic-labs/sdk-api-core';
import {
  DynamicContextProvider,
  DynamicUserProfile,
  FilterChain,
  overrideNetworkRpcUrl,
  useDynamicContext,
  useDynamicEvents,
} from '@dynamic-labs/sdk-react-core';
import {
  BitcoinIcon,
  EthereumIcon,
  FlowIcon,
  SolanaIcon,
} from '@dynamic-labs/iconic';
import { BitcoinWalletConnectors } from '@dynamic-labs/bitcoin';
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';
import { FlowWalletConnectors } from '@dynamic-labs/flow';
import { SolanaWalletConnectors } from '@dynamic-labs/solana';
import { DynamicWaasEVMConnectors } from '@dynamic-labs/waas-evm';
import { DynamicWaasSVMConnectors } from '@dynamic-labs/waas-svm';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import {
  baseSepolia,
  mainnet,
  polygon,
  polygonAmoy,
  sepolia,
} from 'wagmi/chains';
import { AppThemeProvider, useAppTheme } from './AppThemeProvider';
import { TooltipProvider } from './ui/tooltip';

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

const walletListViewTabs = [
  {
    label: {
      text: 'All chains',
      key: 'all-chains',
    },
  },
  {
    label: {
      icon: <EthereumIcon />,
      key: 'evm',
    },
    walletsFilter: FilterChain('EVM'),
  },
  {
    label: {
      icon: <SolanaIcon />,
      key: 'solana',
    },
    walletsFilter: FilterChain('SOL'),
  },
  {
    label: {
      icon: <BitcoinIcon />,
      key: 'bitcoin',
    },
    walletsFilter: FilterChain('BTC'),
  },
  {
    label: {
      icon: <FlowIcon />,
      key: 'flow',
    },
    walletsFilter: FilterChain('FLOW'),
  },
];

const loginWalletOnlyView: SdkView = {
  type: SdkViewType.Login,
  sections: [
    {
      type: SdkViewSectionType.Wallet,
    },
    {
      type: SdkViewSectionType.Separator,
      label: 'OR',
    },
    {
      type: SdkViewSectionType.Social,
    },
    {
      type: SdkViewSectionType.Email,
    },
  ],
};

const dynamicSettings = {
  environmentId: dynamicEnvironmentId,
  social: { strategy: 'popup' as const },
  walletConnectors: [
    EthereumWalletConnectors,
    SolanaWalletConnectors,
    BitcoinWalletConnectors,
    FlowWalletConnectors,
    DynamicWaasEVMConnectors,
    DynamicWaasSVMConnectors,
  ],
  useMetamaskSdk: false,
  localStorageSuffix: 'abrium-dynamic-v4',
  overrides: {
    evmNetworks: applyDynamicRpcOverrides,
    views: [
      loginWalletOnlyView,
      {
        type: 'wallet-list' as const,
        tabs: {
          style: 'grid' as const,
          items: walletListViewTabs,
        },
      },
    ],
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

function AppProvidersContent({ children }: PropsWithChildren) {
  const { theme } = useAppTheme();
  const [queryClient] = useState(() => new QueryClient());
  const dynamicCssOverrides = useMemo(
    () => `
    .modal,
    .dynamic-widget-modal {
      position: fixed !important;
      top: 92px !important;
      right: 8px !important;
      bottom: 0 !important;
      left: auto !important;
      margin: 0 !important;
      height: max-content !important;
      width : max-content !important;
      transition: transform 220ms cubic-bezier(0.22, 1, 0.36, 1) !important;
      will-change: transform !important;
    }

    .modal-card {
      border: 0.0625rem solid var(--neutral-border) !important;
    }

    .dynamic-widget-card, .modal-card {
      border-radius: 1.5rem !important;
      width: 100% !important;
      min-width: 358px !important;
      max-width: 358px !important;
    }

    .modal-component__backdrop {
     backdrop-filter: unset !important;
     background-color: transparent !important;
    }

     .popper-content {
      left: auto !important;
      right: 0 !important;
    }
      
    .dynamic-shadow-dom-content > div[style*='opacity: 1'] .modal,
    .dynamic-shadow-dom-content > div[style*='opacity: 1'] .dynamic-widget-modal {
      transform: translateX(0) !important;
    }

    .dynamic-shadow-dom-content > div[style*='opacity: 0'] .modal,
    .dynamic-shadow-dom-content > div[style*='opacity: 0'] .dynamic-widget-modal {
      transform: translateX(100%) !important;
    }

    .modal-component__backdrop {
      transition: opacity 220ms ease !important;
    }

    #dynamic-widget,
    #dynamic-modal,
    .dynamic-shadow-dom,
    .dynamic-shadow-dom-content {
      --dynamic-font-family-primary: Inter, "Inter Fallback", sans-serif !important;
      --dynamic-base-1: var(--neutral-background) !important;
      --dynamic-base-2: var(--neutral-background-raised) !important;
      --dynamic-base-3: var(--neutral-border) !important;
      --dynamic-base-4: var(--neutral-border) !important;
      --dynamic-button-primary-background: var(--neutral-background-raised) !important;
      --dynamic-button-primary-border: 0.0625rem solid var(--neutral-border) !important;
      --dynamic-text-primary: var(--neutral-text) !important;
      --dynamic-text-secondary: var(--neutral-text-textWeak) !important;
      --dynamic-footer-border-top: 0.0625rem solid var(--neutral-border) !important;
      --dynamic-border-color: var(--neutral-border) !important;
      --dynamic-brand-primary-color: var(--neutral-background-strong) !important;
      --dynamic-wallet-list-tile-background: var(--neutral-background-raised) !important;
      --dynamic-wallet-list-tile-background-hover: var(--neutral-background-hover) !important;
      --dynamic-search-bar-background: var(--neutral-background-raised) !important;
      --dynamic-search-bar-background-hover: var(--neutral-background-hover) !important;
      --dynamic-search-bar-background-focus: var(--neutral-background-hover) !important;
      --dynamic-search-bar-border: 0.0625rem solid var(--neutral-border) !important;
      --dynamic-search-bar-border-hover: 0.0625rem solid var(--neutral-border) !important;
      --dynamic-search-bar-border-focus: 0.0625rem solid var(--neutral-border) !important;
    }

    #dynamic-widget *,
    #dynamic-modal *,
    .dynamic-shadow-dom-content * {
      font-family: Inter, "Inter Fallback", sans-serif !important;
    }

    .typography--inherit {
      color: var(--neutral-background) !important;
    }

  `,
    [],
  );

  const dynamicSettingsWithStyle = useMemo(
    () => ({ ...dynamicSettings, cssOverrides: dynamicCssOverrides }),
    [dynamicCssOverrides],
  );

  return (
    <DynamicContextProvider settings={dynamicSettingsWithStyle} theme={theme}>
      <DynamicEmbeddedWalletFlowGuard />
      <DynamicUserProfile variant="modal" />
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>{children}</TooltipProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </DynamicContextProvider>
  );
}

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <AppThemeProvider>
      <AppProvidersContent>{children}</AppProvidersContent>
    </AppThemeProvider>
  );
}
