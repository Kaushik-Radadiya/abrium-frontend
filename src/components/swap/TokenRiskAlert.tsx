'use client';

import { useState } from 'react';
import { CircleAlert, X } from 'lucide-react';
import type { TokenRiskResponse } from '@/lib/api';
import { Button } from '@/components/ui/Button';

type AlertLevel = 'error' | 'warning' | 'info';

type Props = {
  risk: TokenRiskResponse | null;
  riskError: string | null;
  onClose: () => void;
};

const ALERT_TONE_CLASS: Record<AlertLevel, string> = {
  error:
    'text-[var(--alert-error-text)] border-[var(--alert-error-border)] bg-[var(--alert-error-bg)]',
  warning:
    'text-[var(--alert-warning-text)] border-[var(--alert-warning-border)] bg-[var(--alert-warning-bg)]',
  info: 'text-[var(--alert-info-text)] border-[var(--alert-info-border)] bg-[var(--alert-info-bg)]',
};

const RISK_BADGE_TONE_CLASS: Record<AlertLevel, string> = {
  error:
    'text-[var(--alert-error-text)] border-[var(--alert-error-border)] bg-[var(--alert-error-bg)]',
  warning:
    'text-[var(--alert-warning-text)] border-[var(--alert-warning-border)] bg-[var(--alert-warning-bg)]',
  info: 'text-[var(--alert-info-text)] border-[var(--alert-info-border)] bg-[var(--alert-info-bg)]',
};

export function TokenRiskAlert({ risk, riskError, onClose }: Props) {
  const [expanded, setExpanded] = useState(false);

  if (!risk && !riskError) return null;

  const level: AlertLevel = riskError
    ? 'warning'
    : (risk?.alertLevel ?? 'info');
  const message = riskError || risk?.alertMessage || '';
  const badges = risk?.badges ?? [];
  const showScore = risk ? risk.score !== null : false;
  const hasExpandableDetails = Boolean(risk);

  return (
    <div
      className={`flex items-start justify-between gap-3 rounded-xl border px-4 py-3 ${ALERT_TONE_CLASS[level]}`}
    >
      <div className='flex min-w-0 flex-1 items-start gap-3'>
        {riskError ? (
          <CircleAlert color='#eb7e00' size={18} className='mt-0.5 shrink-0' />
        ) : null}
        <div className='grid min-w-0 gap-2'>
          <div className='flex min-w-0 items-center gap-2'>
            <span className='min-w-0 truncate text-base font-normal leading-[1.35]'>
              {message}
            </span>
          </div>
          {expanded && risk ? (
            <div className='flex flex-wrap items-center gap-2 pb-0.5 text-[11px] leading-[1.35] opacity-90'>
              <span>
                Decision: {risk.decision}
                {showScore ? ` | Score: ${risk.score}` : ''}
              </span>
              {badges.length > 0 ? (
                <div className='flex flex-wrap items-center gap-1.5'>
                  {badges.map((badge) => (
                    <span
                      key={badge.id}
                      title={badge.detail}
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.03em] ${RISK_BADGE_TONE_CLASS[badge.level]}`}
                    >
                      {badge.label}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
      <div className='flex shrink-0 items-center gap-2'>
        {hasExpandableDetails ? (
          <button
            type='button'
            className='shrink-0 text-[11px] font-medium leading-none opacity-90 transition-opacity hover:opacity-100'
            onClick={() => setExpanded((current) => !current)}
          >
            {expanded ? 'Show less' : 'Show more'}
          </button>
        ) : null}
        <Button
          variant='ghost'
          size='none'
          type='button'
          className='text-[var(--neutral-text-textWeak)] !p-0'
          aria-label='Close risk alert'
          onClick={onClose}
        >
          <X size={20} />
        </Button>
      </div>
    </div>
  );
}
