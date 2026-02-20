'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowDownUp, CircleAlert, X } from 'lucide-react';
import { isAddress } from 'viem';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { DEFAULT_CHAIN_ID, SUPPORTED_CHAINS } from '@/lib/chains';
import { simulateSwap, SimulationResponse } from '@/lib/api';
import { TokenPill } from '@/components/swap/TokenPill';
import { TokenSelectorModal } from '@/components/swap/TokenSelectorModal';
import { useSwapData } from '@/components/swap/hooks/useSwapData';
import { WalletTrigger } from '@/components/WalletTrigger';

type SelectorTarget = 'from' | 'to' | null;

type UiAlert = {
  level: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  icon?: React.ReactNode;
};

const ALERT_TONE_CLASS: Record<UiAlert['level'], string> = {
  error:
    'text-[var(--alert-error-text)] border-[var(--alert-error-border)] bg-[var(--alert-error-bg)]',
  warning:
    'text-[var(--alert-warning-text)] border-[var(--alert-warning-border)] bg-[var(--alert-warning-bg)]',
  info: 'text-[var(--alert-info-text)] border-[var(--alert-info-border)] bg-[var(--alert-info-bg)]',
};

const MUTED_CLASS = 'text-[13px] text-[var(--muted)]';
const TOKEN_BOX_CLASS =
  'grid gap-2 rounded-[14px] border border-[var(--swap-token-border)] bg-[var(--neutral-background-raised)] p-4';

const TOKEN_TOP_WALLET_CLASS = 'flex items-center gap-2 py-2.5 px-4';
const TOKEN_SECTION_CLASS =
  'grid gap-1 rounded-[16px] border border-[var(--swap-token-border)] bg-[var(--neutral-background)]';

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
  const [simulation, setSimulation] = useState<SimulationResponse | null>(null);
  const [loadingSimulation, setLoadingSimulation] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const {
    chainTokens,
    selectedChainKey,
    selectedChainIcon,
    uniqueRuntimeNetworks,
    loadingDynamicTokens,
    balances,
    risk,
    riskError,
    importTokenByAddress,
  } = useSwapData({
    chainId,
    staticChains: SUPPORTED_CHAINS,
    walletAddress,
    selectedToToken: toToken,
  });

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
    const value = query.trim().toLowerCase();
    if (!value) return chainTokens;
    return chainTokens.filter((token) => {
      return (
        token.symbol.toLowerCase().includes(value) ||
        token.name.toLowerCase().includes(value) ||
        token.address.toLowerCase().includes(value)
      );
    });
  }, [query, chainTokens]);

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

    setLoadingSimulation(true);
    try {
      const response = await simulateSwap({
        chainId,
        fromToken: selectedFromToken.address,
        toToken: selectedToToken.address,
        amount,
        walletAddress,
      });
      setSimulation(response);
    } finally {
      setLoadingSimulation(false);
    }
  }, [selectedFromToken, selectedToToken, chainId, amount, walletAddress]);

  const onFlipTokens = useCallback(() => {
    setFromToken(toToken);
    setToToken(fromToken);
  }, [fromToken, toToken]);

  const tokenRiskAlert = useMemo<UiAlert | null>(() => {
    if (riskError) {
      return {
        level: 'warning',
        title: 'Token risk check delayed',
        message: riskError,
        icon: <CircleAlert color='#eb7e00' size={20} />
      };
    }

    if (!risk) return null;
    return {
      level: risk.alertLevel,
      title: risk.alertTitle,
      message: risk.alertMessage,
    };
  }, [risk, riskError]);

  return (
    <section className="mx-auto max-w-[440px] w-full gap-3 space-y-4">
      {tokenRiskAlert ? (
        <div
          className={`flex items-center gap-4 rounded-lg border p-4 ${ALERT_TONE_CLASS[tokenRiskAlert.level]}`}
        >
          {tokenRiskAlert.icon}
          <div className="grid gap-1">
            <span className="text-base font-normal">
              {tokenRiskAlert.message}
            </span>
          </div>
          <button className="text-[var(--neutral-text-textWeak)]">
            <X size={20} />
          </button>
        </div>
      ) : null}
      <div className="grid gap-6">
        <div className="grid gap-1">
          <div className={TOKEN_SECTION_CLASS}>
            <div className={TOKEN_TOP_WALLET_CLASS}>
              <WalletTrigger />
            </div>
            <div className={TOKEN_BOX_CLASS}>
              <div className="text-[16px] leading-none text-[var(--neutral-text-textWeak)]">
                Send
              </div>
              <div className="grid grid-cols-[1fr_auto] items-end gap-3">
                <div className="grid gap-1.5">
                  <input
                    className="h-auto min-h-0 border-0 bg-transparent p-0 w-full font-normal font-mono text-3xl text-[var(--swap-amount)] outline-none placeholder:text-[var(--neutral-text-placeholder)]"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    placeholder="0.0"
                  />
                  <div className="text-xs flex items-center gap-1 text-[var(--neutral-text-textWeak)]">~$0 <ArrowDownUp className="size-3" /></div>
                </div>
                <TokenPill
                  token={selectedFromToken}
                  selectedChainIcon={selectedChainIcon}
                  selectedChainKey={selectedChainKey}
                  onClick={() => setSelectorTarget('from')}
                />
              </div>
            </div>
          </div>
          <button
            type="button"
            className="-my-5 z-100 relative size-10 flex items-center justify-center mx-auto rounded-full border border-[var(--swap-divider-border)] bg-[var(--neutral-background-raised)] text-[24px] shadow-[0_0_0_4.5px_var(--swap-panel-bg)]"
            onClick={onFlipTokens}
            aria-label="Swap from and to tokens"
          >
            <ArrowDownUp className="text-[var(--arrow-icon-btn)] size-4" />
          </button>
          <div className={TOKEN_SECTION_CLASS}>
            <div className={TOKEN_TOP_WALLET_CLASS}>
              <WalletTrigger />
            </div>
            <div className={TOKEN_BOX_CLASS}>
              <div className="text-[16px] leading-none text-[var(--neutral-text-textWeak)]">
                Receive
              </div>
              <div className="grid grid-cols-[1fr_auto] items-end gap-3">
                <div className="grid gap-1.5">
                  <div className="flex min-h-12 items-center text-3xl font-normal font-mono text-[var(--neutral-text-placeholder)]">
                    0.0
                  </div>
                  <div className="text-xs flex items-center gap-1 text-[var(--neutral-text-textWeak)]">~$0 <ArrowDownUp className="size-3" /></div>
                </div>
                <TokenPill
                  token={selectedToToken}
                  selectedChainIcon={selectedChainIcon}
                  selectedChainKey={selectedChainKey}
                  onClick={() => setSelectorTarget('to')}
                />
              </div>
            </div>
          </div>
        </div>

        <button
          className="rounded-full border-0 bg-[var(--swap-action-bg)] px-4 py-3 font-medium text-[var(--swap-action-text)] text-base disabled:opacity-50 disabled:!cursor-not-allowed"
          onClick={() => primaryWallet ? onReview() : setShowAuthFlow(true)}
        >
          {primaryWallet ? 'Review' : 'Connect Wallet'}
        </button>

        {simulation ? (
          <div className="grid gap-1.5 border-t border-dashed border-[var(--border)] pt-3">
            <h3>Review</h3>
            <p>{simulation.summary}</p>
            <p className={MUTED_CLASS}>
              Revert likelihood: {simulation.revertLikelihood}
            </p>
            <p className={MUTED_CLASS}>
              Approval risk: {simulation.approvalRisk}
            </p>
            <p className={MUTED_CLASS}>
              MEV RPC: {simulation.mevProtectedRpcUsed ?? 'fallback only'}
            </p>
            {simulation.warnings.map((warning) => (
              <div
                key={`${warning.type}-${warning.message}`}
                className="rounded-lg border border-[var(--border)] bg-[var(--warning-bg)] p-2"
              >
                <strong>{warning.severity.toUpperCase()}</strong>{' '}
                {warning.message}
              </div>
            ))}
          </div>
        ) : null}
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
