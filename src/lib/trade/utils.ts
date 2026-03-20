import { UiToken } from '@/lib/tokens';
import { formatUsd } from '@/lib/formatAmount';
import {
  CHANGE_NEGATIVE_CLASS,
  CHANGE_POSITIVE_CLASS,
  type PerformanceRow,
  TOKEN_PERFORMANCE_ROW_CONFIG,
} from '@/lib/constant/swap';

export function displayBalance(value?: string) {
  if (!value) return '0.0000';
  return value;
}

export function formatPriceDetails(value?: number | null) {
  if (!Number.isFinite(value ?? NaN)) return '--';
  const amount = Number(value);
  if (amount >= 1) return formatUsd(amount);
  return `$${amount.toFixed(2)}`;
}

export function formatPercentChange(value?: number | null) {
  if (!Number.isFinite(value ?? NaN)) {
    return {
      value: '--',
      className: 'text-[var(--neutral-text-textWeak)]',
    };
  }

  const numeric = Number(value);
  return {
    value: `${numeric > 0 ? '+' : ''}${numeric.toFixed(2)}%`,
    className: numeric >= 0 ? CHANGE_POSITIVE_CLASS : CHANGE_NEGATIVE_CLASS,
  };
}

export function buildTokenPerformanceRows(token: UiToken): PerformanceRow[] {
  return TOKEN_PERFORMANCE_ROW_CONFIG.map((config) => {
    if (config.type === 'price') {
      return {
        label: config.label,
        value: formatPriceDetails(token.priceUsd),
        valueClassName: 'font-medium text-[var(--neutral-text)]',
      };
    }

    const formatted = formatPercentChange(token[config.field]);
    return {
      label: config.label,
      value: formatted.value,
      valueClassName: `font-medium ${formatted.className}`,
    };
  });
}
