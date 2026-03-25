'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useSignIntent } from '@/lib/eip712';
import type { NormalizedRoute } from '@/lib/routeDecisionService';
import { cn } from '@/lib/utils';
import { jetBrainsMono } from '@/style/font';
import { SignedIntent } from '@/lib/intent.types';

type Props = {
  open: boolean;
  bestRoute: NormalizedRoute;
  fromAmountUSD?: number | null;
  toAmountUSD?: number | null;
  fromSymbol?: string;
  toSymbol?: string;
  fromDecimals?: number;
  toDecimals?: number;
  onClose: () => void;
  onConfirm: () => void;
};

type SignStep = 'idle' | 'signing' | 'signed' | 'error';

export function SwapReviewPanel(props: Props) {
  if (!props.open) return null;
  return <SwapReviewPanelInner {...props} />;
}

function SwapReviewPanelInner({
  bestRoute,
  fromAmountUSD = null,
  toAmountUSD = null,
  fromSymbol = 'Token',
  toSymbol = 'Token',
  fromDecimals = 18,
  toDecimals = 6,
  onClose,
  onConfirm,
}: Props) {
  const signIntent = useSignIntent();
  const best = bestRoute;

  const [signStep, setSignStep] = useState<SignStep>('idle');
  const [signed, setSigned] = useState<SignedIntent | null>(null);
  const [signError, setSignError] = useState<string | null>(null);

  async function handleSign() {
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
      setSignError(
        err instanceof Error ? err.message : 'Signing failed or rejected',
      );
      setSignStep('error');
    }
  }

  function handleClose() {
    setSignStep('idle');
    setSigned(null);
    setSignError(null);
    onClose();
  }

  const isCross = best.isCrossChain;
  const fromFormatted = formatAmount(best.fromAmount, fromDecimals);
  const toFormatted = formatAmount(best.toAmount, toDecimals);

  return (
    <Dialog
      open
      onOpenChange={(nextOpen) => {
        if (!nextOpen) handleClose();
      }}
    >
      <DialogContent
        className='max-w-110 max-h-[90vh] overflow-y-auto border border-(--neutral-border) bg-(--neutral-background) p-0 text-(--neutral-text)'
        showCloseButton={false}
      >
        <DialogHeader className='flex-row items-center justify-between border-b border-(--neutral-border) px-4 py-3'>
          <DialogTitle className='text-base font-semibold text-(--neutral-text)'>
            Review Swap
          </DialogTitle>
          <button
            onClick={handleClose}
            className='inline-flex size-8 items-center justify-center rounded-full text-(--neutral-text-textWeak) hover:bg-(--neutral-background-hover) hover:text-(--neutral-text)'
            aria-label='Close review'
          >
            <X className='size-4' />
          </button>
        </DialogHeader>

        <div className='flex flex-col gap-3 px-4 pb-4'>
          <div className='rounded-xl border border-(--neutral-border) bg-(--neutral-background-raised) p-3'>
            <div className='flex items-center justify-between gap-3'>
              <div className='flex flex-col gap-0.5'>
                <span className='text-xs uppercase tracking-wide text-(--neutral-text-textWeak)'>
                  You send
                </span>
                <span className='text-base font-semibold text-(--neutral-text) font-mono'>
                  {fromFormatted} {fromSymbol}
                </span>
                {fromAmountUSD != null && (
                  <span className='text-white/40 text-xs'>
                    ${fromAmountUSD.toFixed(2)}
                  </span>
                )}
              </div>
              <span className='text-lg text-(--neutral-text-textWeak)'>→</span>
              <div className='flex flex-col items-end gap-0.5'>
                <span className='text-xs uppercase tracking-wide text-(--neutral-text-textWeak)'>
                  You receive
                </span>
                <span className='text-base font-semibold text-(--neutral-text) font-mono'>
                  {toFormatted} {toSymbol}
                </span>
                {toAmountUSD != null && (
                  <span className='text-white/40 text-xs'>
                    ${toAmountUSD.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ── Best Route ── */}
          <>
            {/* Best route badge + explanation */}
            <div className='rounded-xl bg-white/5 border flex gap-2 flex-col border-white/8 p-3'>
              <div className='flex items-center gap-2'>
                <span
                  className={cn(
                    'rounded-full border border-(--neutral-border-sucess) bg-(--neutral-background-sucess) px-2 py-0.5 text-xs text-(--neutral-text-sucess)',
                    jetBrainsMono.className,
                  )}
                >
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
                    toSymbol={
                      i === best.steps.length - 1
                        ? toSymbol
                        : step.toToken.symbol
                    }
                    isLast={i === best.steps.length - 1}
                  />
                ))}
              </div>
            </div>

            {/* Fee breakdown */}
            <div className='flex flex-col gap-1.5 rounded-xl border border-(--neutral-border) bg-(--neutral-background-raised) p-3 text-xs'>
              <Row label='Protocol' value={best.steps[0]?.protocol ?? '—'} />
              <Row label='Gas fee' value={`$${best.gasFeeUSD.toFixed(4)}`} />
              {isCross && (
                <Row
                  label='Bridge fee'
                  value={`$${best.bridgeFeeUSD.toFixed(4)}`}
                />
              )}
              <div className='border-t border-white/10 my-1' />
              <Row
                label='Net value'
                value={`$${best.netValueUSD.toFixed(4)}`}
                highlight
              />
              <Row
                label='Min received'
                value={`${formatAmount(best.minAmountOut, toDecimals)} ${toSymbol}`}
              />
              <Row
                label='Slippage'
                value={`${(best.slippage * 100).toFixed(2)}%`}
              />
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

          {signStep === 'signed' && signed && (
            <div className='rounded-xl border border-(--neutral-border-sucess) bg-[color:color-mix(in_srgb,var(--neutral-background-sucess)_10%,transparent)] p-3 text-xs'>
              <p className='mb-1 font-semibold text-(--neutral-text-sucess)'>
                Intent signed
              </p>
              <p className='mb-1 text-(--neutral-text-textWeak)'>Signature</p>
              <p className='break-all font-mono text-(--neutral-text-textWeak)'>
                {signed.signature}
              </p>
            </div>
          )}

          {signStep === 'error' && signError && (
            <div className='rounded-xl border border-(--neutral-border-error) bg-[color:color-mix(in_srgb,var(--neutral-background-error)_10%,transparent)] p-3 text-xs text-(--neutral-text-error)'>
              {signError}
            </div>
          )}

          {signStep !== 'signed' ? (
            <Button
              onClick={handleSign}
              disabled={signStep === 'signing'}
              className='w-full justify-center rounded-xl bg-[var(--swap-action-bg)] py-3 text-sm font-semibold text-[var(--swap-action-text)] transition-colors hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50'
            >
              {signStep === 'signing'
                ? 'Waiting for wallet…'
                : 'Sign & Confirm'}
            </Button>
          ) : (
            <Button
              onClick={() => {
                onConfirm();
                handleClose();
              }}
              className='w-full justify-center rounded-xl border border-(--neutral-border-sucess)! bg-(--neutral-background-sucess)! py-3 text-sm font-semibold text-(--neutral-background)'
            >
              Done
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function RouteToken({ symbol }: { symbol: string }) {
  return (
    <span className='rounded-full border border-(--neutral-border) bg-(--neutral-background) px-2 py-0.5 text-xs font-medium text-(--neutral-text)'>
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
      <div className='mx-1 flex items-center gap-1'>
        <span className='text-xs text-(--neutral-text-textWeak)'>-</span>
        <span className='rounded border border-(--neutral-border) bg-(--neutral-background) px-1.5 py-1 text-[10px] leading-3 text-(--neutral-text-textWeak)'>
          {protocol || type}
        </span>
        <span className='text-xs text-(--neutral-text-textWeak)'>{'>'}</span>
      </div>
      {isLast && <RouteToken symbol={toSymbol} />}
    </>
  );
}

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
    <div className='flex justify-between gap-2'>
      <span className='text-(--neutral-text-textWeak)'>{label}</span>
      <span
        className={
          highlight
            ? 'font-medium text-(--neutral-text)'
            : 'text-(--neutral-text-textWeak)'
        }
      >
        {value}
      </span>
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
