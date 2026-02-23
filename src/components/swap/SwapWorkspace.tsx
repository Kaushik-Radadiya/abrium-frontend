'use client';

import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { ArrowDownUp } from 'lucide-react';
import { isAddress } from 'viem';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { DEFAULT_CHAIN_ID, SUPPORTED_CHAINS } from '@/lib/chains';
import { useTokenRiskMutation } from '@/lib/api-hooks';
import { TokenRiskAlert } from '@/components/swap/TokenRiskAlert';
import { SwapTokenPanel } from '@/components/swap/SwapTokenPanel';
import { TokenSelectorModal } from '@/components/swap/TokenSelectorModal';
import { useSwapData } from '@/components/swap/hooks/useSwapData';

type SelectorTarget = 'from' | 'to' | null;

export function SwapWorkspace() {
  const { primaryWallet, setShowAuthFlow } = useDynamicContext();
  const walletAddress = primaryWallet?.address;

  const [chainId, setChainId] = useState(DEFAULT_CHAIN_ID);
  const [amount, setAmount] = useState('0.1');
  const [fromToken, setFromToken] = useState<string>('native');
  const [toToken, setToToken] = useState<string>('native');
  const [selectorTarget, setSelectorTarget] = useState<SelectorTarget>(null);
  const [networkMenuOpen, setNetworkMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const {
    chainTokens,
    selectedChainKey,
    selectedChainIcon,
    uniqueRuntimeNetworks,
    loadingDynamicTokens,
    balances,
    importTokenByAddress,
  } = useSwapData({
    chainId,
    staticChains: SUPPORTED_CHAINS,
    walletAddress,
    selectedFromToken: fromToken,
    selectedToToken: toToken,
  });
  const {
    mutateAsync: checkTokenRisk,
    data: risk,
    error: riskMutationError,
    isPending: isCheckingRisk,
    reset: resetRiskCheck,
  } = useTokenRiskMutation();
  const riskError =
    riskMutationError instanceof Error ? riskMutationError.message : null;

  useEffect(() => {
    if (chainTokens.length === 0) return;

    const defaultFrom =
      chainTokens.find((token) => token.address === 'native')?.address ??
      chainTokens[0]?.address ??
      'native';

    const hasCurrentFrom = chainTokens.some(
      (token) => token.address === fromToken,
    );
    const nextFrom = hasCurrentFrom ? fromToken : defaultFrom;

    const hasCurrentTo = chainTokens.some((token) => token.address === toToken);
    const initialTo =
      chainTokens.find((token) => token.address !== nextFrom)?.address ??
      nextFrom;
    const nextTo = hasCurrentTo && toToken !== nextFrom ? toToken : initialTo;

    if (nextFrom !== fromToken) {
      setFromToken(nextFrom);
    }
    if (nextTo !== toToken) {
      setToToken(nextTo);
    }
  }, [chainTokens, fromToken, toToken]);

  const selectedFromToken = useMemo(
    () => chainTokens.find((token) => token.address === fromToken),
    [chainTokens, fromToken],
  );

  const selectedToToken = useMemo(
    () => chainTokens.find((token) => token.address === toToken),
    [chainTokens, toToken],
  );

  const filteredTokens = useMemo(() => {
    const value = deferredQuery.trim().toLowerCase();
    if (!value) return chainTokens;
    return chainTokens.filter((token) => {
      return (
        token.symbol.toLowerCase().includes(value) ||
        token.name.toLowerCase().includes(value) ||
        token.address.toLowerCase().includes(value)
      );
    });
  }, [deferredQuery, chainTokens]);

  const importAddress = query.trim().toLowerCase();
  const canImport =
    isAddress(importAddress) &&
    !chainTokens.some((token) => token.address.toLowerCase() === importAddress);

  const onSelectToken = useCallback(
    (address: string) => {
      if (selectorTarget === 'from') {
        setFromToken(address);
      }
      if (selectorTarget === 'to') {
        setToToken(address);
      }

      setSelectorTarget(null);
      setNetworkMenuOpen(false);
      setQuery('');
      setImportError(null);
    },
    [selectorTarget],
  );

  const onImportToken = useCallback(async () => {
    if (!isAddress(importAddress)) return;

    setImporting(true);
    setImportError(null);
    try {
      await importTokenByAddress(importAddress);
      onSelectToken(importAddress);
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : 'Cannot import token metadata from RPC';
      setImportError(message);
    } finally {
      setImporting(false);
    }
  }, [importAddress, importTokenByAddress, onSelectToken]);

  const onReview = useCallback(async () => {
    if (!selectedFromToken || !selectedToToken) return;
    if (selectedToToken.address === 'native') {
      resetRiskCheck();
      return;
    }

    try {
      await checkTokenRisk({
        chainId,
        tokenAddress: selectedToToken.address,
      });
    } catch {
      // handled via mutation error state
    }
  }, [
    selectedFromToken,
    selectedToToken,
    chainId,
    checkTokenRisk,
    resetRiskCheck,
  ]);

  const onFlipTokens = useCallback(() => {
    setFromToken(toToken);
    setToToken(fromToken);
  }, [fromToken, toToken]);

  const hasTokenSelection = Boolean(selectedFromToken && selectedToToken);

  const onPrimaryAction = useCallback(() => {
    if (!primaryWallet) {
      setShowAuthFlow(true);
      return;
    }
    void onReview();
  }, [primaryWallet, setShowAuthFlow, onReview]);

  useEffect(() => {
    resetRiskCheck();
  }, [chainId, toToken, resetRiskCheck]);

  return (
    <section className="mx-auto max-w-[440px] w-full gap-3 space-y-4">
      <TokenRiskAlert
        risk={risk ?? null}
        riskError={riskError}
        onClose={resetRiskCheck}
      />
      <div className="grid gap-6">
        <div className="grid gap-1">
          <SwapTokenPanel
            label="Send"
            amount={amount}
            token={selectedFromToken}
            selectedChainIcon={selectedChainIcon}
            selectedChainKey={selectedChainKey}
            onSelectToken={() => setSelectorTarget('from')}
            editable
            onAmountChange={setAmount}
          />
          <button
            type="button"
            className="-my-5 z-100 relative size-10 flex items-center justify-center mx-auto rounded-full border border-[var(--swap-divider-border)] bg-[var(--neutral-background-raised)] text-[24px] shadow-[0_0_0_4.5px_var(--swap-panel-bg)]"
            onClick={onFlipTokens}
            aria-label="Swap from and to tokens"
          >
            <ArrowDownUp className="text-[var(--arrow-icon-btn)] size-4" />
          </button>
          <SwapTokenPanel
            label="Receive"
            amount="0.0"
            token={selectedToToken}
            selectedChainIcon={selectedChainIcon}
            selectedChainKey={selectedChainKey}
            onSelectToken={() => setSelectorTarget('to')}
          />
        </div>

        <button
          className="rounded-full border-0 bg-[var(--swap-action-bg)] px-4 py-3 font-medium text-[var(--swap-action-text)] text-base disabled:opacity-50 disabled:!cursor-not-allowed"
          onClick={onPrimaryAction}
          disabled={primaryWallet ? !hasTokenSelection || isCheckingRisk : false}
        >
          {primaryWallet
            ? isCheckingRisk
              ? 'Checking risk...'
              : 'Review Swap'
            : 'Connect Wallet'}
        </button>
      </div>

      <TokenSelectorModal
        open={Boolean(selectorTarget)}
        query={query}
        onQueryChange={setQuery}
        chainId={chainId}
        selectedChainIcon={selectedChainIcon}
        selectedChainKey={selectedChainKey}
        networkMenuOpen={networkMenuOpen}
        setNetworkMenuOpen={setNetworkMenuOpen}
        networks={uniqueRuntimeNetworks}
        onChainSelect={setChainId}
        tokens={filteredTokens}
        balances={balances}
        onSelectToken={onSelectToken}
        loadingDynamicTokens={loadingDynamicTokens}
        canImport={canImport}
        importing={importing}
        importAddress={importAddress}
        onImportToken={onImportToken}
        importError={importError}
        onClose={() => {
          setSelectorTarget(null);
          setNetworkMenuOpen(false);
        }}
      />
    </section>
  );
}
