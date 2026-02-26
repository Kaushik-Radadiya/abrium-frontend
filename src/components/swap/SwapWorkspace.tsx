'use client';

import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { ArrowDownUp } from 'lucide-react';
import { getAddress, isAddress } from 'viem';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { DEFAULT_CHAIN_ID, SUPPORTED_CHAINS } from '@/lib/chains';
import { useTokenRiskMutation } from '@/lib/api-hooks';
import { TokenRiskAlert } from '@/components/swap/TokenRiskAlert';
import { SwapTokenPanel } from '@/components/swap/SwapTokenPanel';
import { TokenSelectorModal } from '@/components/swap/TokenSelectorModal';
import { useSwapData } from '@/components/swap/hooks/useSwapData';
// import SwapTopPanel from './SwapTopPanel';
import { Button } from '@/components/ui/Button';

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
    loadAllTokenBalances: Boolean(selectorTarget),
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
      chainTokens.find((t) => t.address === 'native')?.address ?? chainTokens[0]?.address ?? 'native';

    const hasCurrentFrom = chainTokens.some((t) => t.address === fromToken);
    const nextFrom = hasCurrentFrom ? fromToken : defaultFrom;

    const hasCurrentTo = chainTokens.some((t) => t.address === toToken);
    const initialTo =
      chainTokens.find((t) => t.address !== nextFrom)?.address ?? nextFrom;
    const nextTo = hasCurrentTo && toToken !== nextFrom ? toToken : initialTo;

    if (nextFrom !== fromToken) setFromToken(nextFrom);
    if (nextTo !== toToken) setToToken(nextTo);
  }, [chainTokens, fromToken, toToken]);

  const selectedFromToken = useMemo(
    () => chainTokens.find((t) => t.address === fromToken),
    [chainTokens, fromToken]
  );

  const selectedToToken = useMemo(
    () => chainTokens.find((t) => t.address === toToken),
    [chainTokens, toToken]
  );

  const sortedTokens = useMemo(() => {
    if (chainTokens.length <= 1) return chainTokens;

    const originalIndex = new Map(
      chainTokens.map((token, index) => [token.address.toLowerCase(), index] as const)
    );

    const getNumericBalance = (address: string) => {
      const raw = balances[address.toLowerCase()] ?? '0';
      const value = Number(raw);
      return Number.isFinite(value) ? value : 0;
    };

    return [...chainTokens].sort((left, right) => {
      const leftBalance = getNumericBalance(left.address);
      const rightBalance = getNumericBalance(right.address);
      const leftHasBalance = leftBalance > 0 ? 1 : 0;
      const rightHasBalance = rightBalance > 0 ? 1 : 0;

      if (leftHasBalance !== rightHasBalance) return rightHasBalance - leftHasBalance;
      if (leftBalance !== rightBalance) return rightBalance - leftBalance;

      return (
        (originalIndex.get(left.address.toLowerCase()) ?? 0) -
        (originalIndex.get(right.address.toLowerCase()) ?? 0)
      );
    });
  }, [chainTokens, balances]);

  const filteredTokens = useMemo(() => {
    const value = deferredQuery.trim().toLowerCase();
    if (!value) return sortedTokens;
    return sortedTokens.filter((token) => {
      return (
        token.symbol.toLowerCase().includes(value) ||
        token.name.toLowerCase().includes(value) ||
        token.address.toLowerCase().includes(value)
      );
    });
  }, [deferredQuery, sortedTokens]);

  const chainTokenAddressSet = useMemo(
    () => new Set(chainTokens.map((token) => token.address.toLowerCase())),
    [chainTokens],
  );
  const importAddress = query.trim();
  const normalizedImportAddress = importAddress.toLowerCase();
  const hasTokenWithImportAddress = chainTokenAddressSet.has(
    normalizedImportAddress,
  );
  const canImport = isAddress(importAddress) && !hasTokenWithImportAddress;
  const showImportOption =
    importAddress.length > 0 &&
    filteredTokens.length === 0 &&
    !hasTokenWithImportAddress;

  const onSelectToken = useCallback(
    (address: string) => {
      if (selectorTarget === 'from') setFromToken(address);
      if (selectorTarget === 'to') setToToken(address);
      setSelectorTarget(null);
      setNetworkMenuOpen(false);
      setQuery('');
      setImportError(null);
    },
    [selectorTarget]
  );

  const onQueryChange = useCallback((value: string) => {
    setQuery(value);
    setImportError(null);
  }, []);

  const onImportToken = useCallback(async () => {
    if (!isAddress(importAddress)) {
      setImportError('Enter a valid 0x token contract address.');
      return;
    }

    setImporting(true);
    setImportError(null);
    try {
      const checksummedAddress = getAddress(importAddress);
      await importTokenByAddress(checksummedAddress);
      onSelectToken(checksummedAddress);
    } catch (err) {
      const msg =
        err instanceof Error && err.message
          ? err.message
          : 'Token not found or invalid token address.';
      setImportError(msg);
    } finally {
      setImporting(false);
    }
  }, [importAddress, importTokenByAddress, onSelectToken]);

  // ─── Review action ───────────────────────────────────────────
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
    <section className="mx-auto max-w-[440px] w-full gap-3">
      <TokenRiskAlert
        risk={risk ?? null}
        riskError={riskError}
        onClose={resetRiskCheck}
      />
      {/* <SwapTopPanel /> */}
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
          <Button
            className="-my-5 z-10 relative size-10 flex items-center justify-center mx-auto rounded-full border border-[var(--swap-divider-border)] bg-[var(--neutral-background-raised)] text-[24px] shadow-[0_0_0_4.5px_var(--swap-panel-bg)]"
            onClick={onFlipTokens}
            aria-label="Swap tokens"
          >
            <ArrowDownUp className="text-[var(--arrow-icon-btn)] size-4" />
          </Button>
          <SwapTokenPanel
            label="Receive"
            amount="0.0"
            token={selectedToToken}
            selectedChainIcon={selectedChainIcon}
            selectedChainKey={selectedChainKey}
            onSelectToken={() => setSelectorTarget('to')}
          />
        </div>

        <Button
          className="rounded-full justify-center border-0 bg-[var(--swap-action-bg)] px-4 py-3 font-medium text-[var(--swap-action-text)] text-base"
          onClick={onPrimaryAction}
          disabled={primaryWallet ? !hasTokenSelection || isCheckingRisk : false}
        >
          {primaryWallet
            ? isCheckingRisk
              ? 'Checking risk...'
              : 'Review Swap'
            : 'Connect Wallet'}
        </Button>
      </div>

      <TokenSelectorModal
        open={Boolean(selectorTarget)}
        query={query}
        onQueryChange={onQueryChange}
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
        showImportOption={showImportOption}
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
