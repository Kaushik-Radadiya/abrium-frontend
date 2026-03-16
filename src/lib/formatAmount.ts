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

  // For small values that would be misrepresented by fixed decimal places,
  // use significant digits to preserve meaningful precision.
  const threshold = Math.pow(10, -decimals);
  if (num > 0 && num < threshold) {
    return new Intl.NumberFormat('en-US', {
      maximumSignificantDigits: 3,
      useGrouping: false,
    }).format(num);
  }

  if (decimals === TOKEN_DECIMALS) {
    return TOKEN_FORMATTER.format(num);
  }

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
    useGrouping: false,
  }).format(num);
}

export function formatApproxUsd(value: number | null | undefined): string {
  if (!value || !Number.isFinite(value) || value <= 0) return '~$0';
  if (value < 1) return `~${USD_SMALL_FORMATTER.format(value)}`;
  return `~${USD_FORMATTER.format(value)}`;
}

export function formatUsd(value: number | null | undefined): string {
  const num = value ?? 0;
  if (!Number.isFinite(num)) return '~$0';
  return `${USD_FORMATTER.format(num)}`;
}

export function formatBalance(
  value: string | number | null | undefined,
  decimals: number = TOKEN_DECIMALS + 3,
): string {
  const num = typeof value === 'string' ? parseFloat(value) : (value ?? NaN);
  if (!Number.isFinite(num) || num <= 0) return '0';
  return formatAmount(num, decimals);
}
