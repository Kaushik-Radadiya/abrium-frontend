'use client';

import { TradeTokenSelectorModal } from '@/components/trade/common/TradeTokenSelectorModal';
import type { SwapWorkspaceViewModel } from '@/types/trade/workspace';

type Props = {
  workspace: SwapWorkspaceViewModel;
};

export function TradeWorkspaceSelectorView({ workspace }: Props) {
  return (
    <TradeTokenSelectorModal
      open={workspace.isSelectorOpen}
      query={workspace.query}
      onQueryChange={workspace.onQueryChange}
      chainId={workspace.activeChainId}
      selectedChainIcon={workspace.activeSelectedChainIcon}
      selectedChainKey={workspace.activeSelectedChainKey}
      networkMenuOpen={workspace.networkMenuOpen}
      setNetworkMenuOpen={workspace.setNetworkMenuOpen}
      networks={workspace.runtimeNetworks}
      onChainSelect={workspace.onModalChainSelect}
      tokens={workspace.filteredTokens}
      onSelectToken={workspace.onSelectToken}
      loadingDynamicTokens={workspace.activeLoadingDynamicTokens}
      showImportOption={workspace.showImportOption}
      canImport={workspace.canImport}
      importing={workspace.importing}
      importAddress={workspace.importAddress}
      onImportToken={workspace.onImportToken}
      importError={workspace.importError}
      onClose={workspace.closeSelector}
    />
  );
}
