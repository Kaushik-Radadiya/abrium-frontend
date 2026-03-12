export const TOKEN_DECIMALS = 3;

const TOKEN_FORMATTER = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 0,
  maximumFractionDigits: TOKEN_DECIMALS,
  useGrouping: false,
});

const USD_FORMATTER = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  useGrouping: false,
});

const USD_SMALL_FORMATTER = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: TOKEN_DECIMALS + 3, // 6 total – enough for micro-cap prices
  useGrouping: false,
});

export function formatAmount(
  value: number | string | null | undefined,
  decimals: number = TOKEN_DECIMALS,
): string {
  const num = typeof value === 'string' ? parseFloat(value) : (value ?? NaN);
  if (!Number.isFinite(num) || num < 0) return '0';

  // Use a custom formatter only when the caller overrides the default decimals
  const formatter =
    decimals === TOKEN_DECIMALS
      ? TOKEN_FORMATTER
      : new Intl.NumberFormat('en-US', {
          minimumFractionDigits: 0,
          maximumFractionDigits: decimals,
          useGrouping: false,
        });

  const formatted = formatter.format(num);

  if (formatted === '0' && num > 0) {
    return new Intl.NumberFormat('en-US', {
      maximumSignificantDigits: 2,
      useGrouping: false,
    }).format(num);
  }

  return formatted;
}

export function formatApproxUsd(value: number | null | undefined): string {
  if (!value || !Number.isFinite(value) || value <= 0) return '~$0';
  if (value < 1) return `~${USD_SMALL_FORMATTER.format(value)}`;
  return `~${USD_FORMATTER.format(value)}`;
}

export function formatUsd(value: number | null | undefined): string {
  const num = value ?? 0;
  if (!Number.isFinite(num)) return '$0.00';
  return USD_FORMATTER.format(num);
}

export function formatBalance(
  value: string | number | null | undefined,
  decimals: number = TOKEN_DECIMALS,
): string {
  return formatAmount(value, decimals);
}
