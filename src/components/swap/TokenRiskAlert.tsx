'use client';

import { CircleAlert, X } from 'lucide-react';
import type { TokenRiskResponse } from '@/lib/api';

type AlertLevel = 'error' | 'warning' | 'info';

type Props = {
  risk: TokenRiskResponse | null;
  riskError: string | null;
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

export function TokenRiskAlert({ risk, riskError }: Props) {
  if (!risk && !riskError) return null;

  const level: AlertLevel = riskError ? 'warning' : risk?.alertLevel ?? 'info';
  const message = riskError || risk?.alertMessage || '';
  const badges = risk?.badges ?? [];

  return (
    <div
      className={`flex items-center gap-4 rounded-lg border p-4 ${ALERT_TONE_CLASS[level]}`}
    >
      {riskError ? <CircleAlert color="#eb7e00" size={20} /> : null}
      <div className="grid gap-1">
        <span className="text-base font-normal">{message}</span>
        {risk ? (
          <span className="text-[11px] leading-[1.35] opacity-90">
            Decision: {risk.decision} | Score: {risk.score}
          </span>
        ) : null}
        {badges.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 pt-1">
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
      <button
        type="button"
        className="text-[var(--neutral-text-textWeak)]"
        aria-label="Close risk alert"
      >
        <X size={20} />
      </button>
    </div>
  );
}
