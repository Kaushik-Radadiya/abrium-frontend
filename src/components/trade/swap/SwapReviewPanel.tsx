'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSignIntent } from '@/lib/eip712';
import { fetchBestRoute } from '@/lib/lifi';
import type { SwapQuoteResponsePayload } from '@/lib/quotes.types';
import type { NormalizedRoute } from '@/lib/routeDecisionService';
import type { SignedIntent } from '@/lib/intent.types';

type Props = {
  open: boolean;
  quote: SwapQuoteResponsePayload;
  fromSymbol?: string;
  toSymbol?: string;
  fromDecimals?: number;
  toDecimals?: number;
  onClose: () => void;
  onConfirm: () => void;
};

type RouteStatus = 'loading' | 'ready' | 'error';
type SignStep = 'idle' | 'signing' | 'signed' | 'error';

export function SwapReviewPanel(props: Props) {
  if (!props.open) return null;
  return <SwapReviewPanelInner {...props} />;
}

function SwapReviewPanelInner({
  quote,
  fromSymbol = 'Token',
  toSymbol = 'Token',
  fromDecimals = 18,
  toDecimals = 6,
  onClose,
  onConfirm,
}: Props) {
  const signIntent = useSignIntent();

  // These start at their initial values on every mount — no reset needed.
  const [best, setBest] = useState<NormalizedRoute | null>(null);
  const [routeStatus, setRouteStatus] = useState<RouteStatus>('loading');
  const [signStep, setSignStep] = useState<SignStep>('idle');
  const [signed, setSigned] = useState<SignedIntent | null>(null);
  const [signError, setSignError] = useState<string | null>(null);

  // Fetch ranked routes once on mount (async callback → setState is correct).
  useEffect(() => {
    let cancelled = false;

    fetchBestRoute({
      amount: quote.input.amount,
      swapper: quote.swapper,
      tokenIn: quote.input.token,
      tokenInChainId: quote.input.chainId,
      tokenOut: quote.output.token,
      tokenOutChainId: quote.output.chainId,
      recipient: quote.output.recipient,
    })
      .then((route) => {
        if (cancelled) return;
        if (route) {
          setBest(route);
          setRouteStatus('ready');
        } else {
          setRouteStatus('error');
        }
      })
      .catch(() => {
        if (!cancelled) setRouteStatus('error');
      });

    return () => { cancelled = true; };
  // quote is stable for the lifetime of this mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSign() {
    if (!best) return;
    setSignError(null);
    setSignStep('signing');
    try {
      const result = await signIntent({
        intentType: 'swap',
        chainIn: best.fromChainId,
        tokenIn: best.fromToken,
        chainOut: best.toChainId,
        tokenOut: best.toToken,
        amount: best.fromAmount,
        minAmountOut: best.minAmountOut,
        deadline: Math.floor(Date.now() / 1000) + 600,
        constraints: { maxSlippage: best.slippage },
        preferInstantSettlement: false,
        routeId: best.routeId,
      });
      setSigned(result);
      setSignStep('signed');
    } catch (err: unknown) {
      setSignError(err instanceof Error ? err.message : 'Signing failed or rejected');
      setSignStep('error');
    }
  }

  function handleClose() {
    setSignStep('idle');
    setSigned(null);
    setSignError(null);
    onClose();
  }

  const isCross = best?.isCrossChain ?? quote.input.chainId !== quote.output.chainId;
  const fromFormatted = formatAmount(quote.input.amount, fromDecimals);
  const toFormatted = formatAmount(quote.output.amount, toDecimals);

  return (
    <>
      {/* Backdrop */}
      <motion.div
        key='review-backdrop'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className='fixed inset-0 z-40 bg-black/60 backdrop-blur-sm'
        onClick={handleClose}
      />

      {/* Panel */}
      <motion.div
        key='review-panel'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className='fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-110 max-h-[90vh] flex flex-col rounded-t-2xl sm:rounded-2xl sm:inset-x-0 sm:top-1/2 sm:bottom-auto sm:-translate-y-1/2 bg-[#0f0f1a] border border-white/10 overflow-y-auto'
      >
        {/* Header */}
        <div className='flex items-center justify-between px-4 pt-4 pb-2'>
          <span className='text-sm font-semibold text-white'>Review Swap</span>
          <button
            onClick={handleClose}
            className='text-white/40 hover:text-white/80 text-lg leading-none'
          >
            ✕
          </button>
        </div>

        <div className='flex flex-col gap-3 px-4 pb-4'>
          {/* ── Swap summary ── */}
          <div className='rounded-xl bg-white/5 border border-white/8 p-3'>
            <div className='flex items-center justify-between'>
              <div className='flex flex-col gap-0.5'>
                <span className='text-white/40 text-[10px] uppercase tracking-wide'>You send</span>
                <span className='text-white font-semibold text-base'>
                  {fromFormatted} {fromSymbol}
                </span>
                {quote.fromAmountUSD != null && (
                  <span className='text-white/40 text-xs'>${quote.fromAmountUSD.toFixed(2)}</span>
                )}
              </div>
              <span className='text-white/30 text-lg'>→</span>
              <div className='flex flex-col gap-0.5 items-end'>
                <span className='text-white/40 text-[10px] uppercase tracking-wide'>You receive</span>
                <span className='text-white font-semibold text-base'>
                  {toFormatted} {toSymbol}
                </span>
                {quote.toAmountUSD != null && (
                  <span className='text-white/40 text-xs'>${quote.toAmountUSD.toFixed(2)}</span>
                )}
              </div>
            </div>
          </div>

          {/* ── Best Route ── */}
          {routeStatus === 'loading' && (
            <div className='rounded-xl bg-white/5 border border-white/8 p-3 text-xs text-white/40 animate-pulse'>
              Finding best route…
            </div>
          )}

          {routeStatus === 'error' && (
            <div className='rounded-xl bg-red-900/20 border border-red-700/30 p-3 text-xs text-red-400'>
              Could not fetch ranked route. Using quote data.
            </div>
          )}

          {routeStatus === 'ready' && best && (
            <>
              {/* Best route badge + explanation */}
              <div className='rounded-xl bg-white/5 border border-white/8 p-3'>
                <div className='flex items-center gap-2 mb-2'>
                  <span className='text-xs bg-green-900/40 text-green-400 border border-green-700/40 rounded-full px-2 py-0.5'>
                    #1 Best Route · {best.score}/100
                  </span>
                  {isCross && (
                    <span className='text-xs bg-blue-900/30 text-blue-400 border border-blue-700/30 rounded-full px-2 py-0.5'>
                      Cross-chain
                    </span>
                  )}
                </div>

                {best.explanation && (
                  <p className='text-xs text-white/50 leading-relaxed mb-2.5'>
                    {best.explanation}
                  </p>
                )}

                {/* Route steps */}
                <div className='flex items-center flex-wrap gap-y-1'>
                  <RouteToken symbol={fromSymbol} />
                  {best.steps.map((step, i) => (
                    <RouteStep
                      key={i}
                      protocol={step.protocol}
                      type={step.type}
                      toSymbol={i === best.steps.length - 1 ? toSymbol : step.toToken.symbol}
                      isLast={i === best.steps.length - 1}
                    />
                  ))}
                </div>
              </div>

              {/* Score breakdown */}
              <div className='rounded-xl bg-white/5 border border-white/8 p-3 text-xs'>
                <p className='text-white/40 mb-2'>Score breakdown</p>
                <div className='grid grid-cols-2 gap-x-4 gap-y-1'>
                  <ScoreRow label='Net value' score={best.scoreBreakdown.netValue} weight='40%' />
                  <ScoreRow label='Speed' score={best.scoreBreakdown.speed} weight='20%' />
                  <ScoreRow label='Reliability' score={best.scoreBreakdown.reliability} weight='20%' />
                  <ScoreRow label='Gas' score={best.scoreBreakdown.gas} weight='10%' />
                  <ScoreRow label='Slippage risk' score={best.scoreBreakdown.slippageRisk} weight='10%' />
                </div>
              </div>

              {/* Fee breakdown */}
              <div className='rounded-xl bg-white/5 border border-white/8 p-3 flex flex-col gap-1.5 text-xs'>
                <Row label='Protocol' value={best.steps[0]?.protocol ?? '—'} />
                <Row label='Gas fee' value={`$${best.gasFeeUSD.toFixed(4)}`} />
                {isCross && (
                  <Row label='Bridge fee' value={`$${best.bridgeFeeUSD.toFixed(4)}`} />
                )}
                <div className='border-t border-white/10 my-1' />
                <Row label='Net value' value={`$${best.netValueUSD.toFixed(4)}`} highlight />
                <Row
                  label='Min received'
                  value={`${formatAmount(best.minAmountOut, toDecimals)} ${toSymbol}`}
                />
                <Row label='Slippage' value={`${(best.slippage * 100).toFixed(2)}%`} />
                {best.estimatedDurationMs > 0 && (
                  <Row
                    label='Est. time'
                    value={
                      best.estimatedDurationMs < 60_000
                        ? `${Math.round(best.estimatedDurationMs / 1000)}s`
                        : `${Math.round(best.estimatedDurationMs / 60_000)} min`
                    }
                  />
                )}
              </div>

            </>
          )}

          {/* ── Sign result ── */}
          {signStep === 'signed' && signed && (
            <div className='rounded-xl bg-green-900/20 border border-green-700/30 p-3 text-xs'>
              <p className='text-green-400 font-semibold mb-1'>Intent signed</p>
              <p className='text-white/40 mb-1'>Signature</p>
              <p className='text-white/60 break-all font-mono'>{signed.signature}</p>
            </div>
          )}

          {signStep === 'error' && signError && (
            <div className='rounded-xl bg-red-900/20 border border-red-700/30 p-3 text-xs text-red-400'>
              {signError}
            </div>
          )}

          {/* ── Action buttons ── */}
          {signStep !== 'signed' ? (
            <button
              onClick={handleSign}
              disabled={routeStatus !== 'ready' || signStep === 'signing'}
              className='w-full rounded-xl py-3 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-violet-600 hover:bg-violet-500 text-white'
            >
              {routeStatus === 'loading'
                ? 'Loading route…'
                : signStep === 'signing'
                  ? 'Waiting for wallet…'
                  : 'Sign & Confirm'}
            </button>
          ) : (
            <button
              onClick={() => { onConfirm(); handleClose(); }}
              className='w-full rounded-xl py-3 text-sm font-semibold bg-green-700 hover:bg-green-600 text-white transition-colors'
            >
              Done
            </button>
          )}
        </div>
      </motion.div>
    </>
  );
}

// ── Route visualisation ─────────────────────────────────────────────────────

function RouteToken({ symbol }: { symbol: string }) {
  return (
    <span className='text-xs font-medium text-white bg-white/10 rounded-full px-2 py-0.5'>
      {symbol}
    </span>
  );
}

function RouteStep({
  protocol,
  type,
  toSymbol,
  isLast,
}: {
  protocol: string;
  type: string;
  toSymbol: string;
  isLast: boolean;
}) {
  return (
    <>
      <div className='flex items-center gap-1 mx-1'>
        <span className='text-white/20 text-xs'>—</span>
        <span className='text-[10px] text-white/40 bg-white/5 border border-white/10 rounded px-1.5 py-0.5'>
          {protocol || type}
        </span>
        <span className='text-white/20 text-xs'>→</span>
      </div>
      {isLast && <RouteToken symbol={toSymbol} />}
    </>
  );
}

// ── Row helpers ─────────────────────────────────────────────────────────────

function Row({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className='flex justify-between'>
      <span className='text-white/40'>{label}</span>
      <span className={highlight ? 'text-white font-medium' : 'text-white/70'}>{value}</span>
    </div>
  );
}

function ScoreRow({
  label,
  score,
  weight,
}: {
  label: string;
  score: number;
  weight: string;
}) {
  const color =
    score >= 80 ? 'text-green-400' : score >= 50 ? 'text-yellow-400' : 'text-red-400';
  return (
    <div className='flex justify-between'>
      <span className='text-white/40'>
        {label} <span className='text-white/20'>({weight})</span>
      </span>
      <span className={color}>{score}</span>
    </div>
  );
}

// ── Utilities ───────────────────────────────────────────────────────────────

function formatAmount(wei: string, decimals: number): string {
  try {
    const val = Number(BigInt(wei)) / Math.pow(10, decimals);
    return val.toFixed(Math.min(decimals, 6));
  } catch {
    return wei;
  }
}
