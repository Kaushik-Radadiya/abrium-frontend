import type { UiToken } from '@/lib/tokens';
import type { SecurityLevel } from '@/lib/api';
import type { WalletSelection } from '@/lib/receive-wallet';
import type { SupportedChain } from '@/lib/chains';

type RuntimeNetwork = {
  chain: SupportedChain;
  chainKey?: string;
  logoURI?: string;
};

type PriceImpact = {
  usdLabel: string;
  pctLabel: string;
  dollarTooltip: string;
};

export type SwapWorkspaceViewModel = {
  fromAmount: string;
  fromUsdInput: string;
  valueMode: 'token' | 'usd';
  selectedFromToken?: UiToken;
  selectedToToken?: UiToken;
  fromAmountUsdValue?: number | null;
  toAmountUsdValue?: number | null;
  fromSelectedChainIcon?: string | null;
  toSelectedChainIcon?: string | null;
  toAmount: string;
  animatedToAmount: string;
  isQuoteFetching: boolean;
  shouldShowQuote: boolean;
  priceImpact?: PriceImpact;
  receiveWalletSelection?: WalletSelection | null;
  setReceiveWalletSelection: (selection: WalletSelection | null) => void;
  receiveRiskLevel?: SecurityLevel | null;
  riskReasons?: string[] | null;
  shouldEnforceDangerGuard: boolean;
  quoteErrorMessage: string | null;
  primaryWallet: unknown;
  user: unknown;
  hasTokenSelection: boolean;
  onFromAmountChange: (value: string) => void;
  onFromUsdChange: (value: string) => void;
  onToggleFromValueMode: () => void;
  onFlipTokens: () => void;
  openSelector: (target: 'from' | 'to') => void;
  onPrimaryAction: () => void;
};

export type TokenSelectorModalProps = {
  open: boolean;
  query: string;
  onQueryChange: (value: string) => void;
  chainId: number;
  selectedChainIcon: string | null;
  selectedChainKey: string;
  networkMenuOpen: boolean;
  setNetworkMenuOpen: (open: boolean) => void;
  networks: RuntimeNetwork[];
  onChainSelect: (chainId: number) => void;
  tokens: UiToken[];
  onSelectToken: (address: string) => void;
  loadingDynamicTokens: boolean;
  showImportOption: boolean;
  canImport: boolean;
  importing: boolean;
  importAddress: string;
  onImportToken: () => void;
  importError: string | null;
  onClose: () => void;
};
