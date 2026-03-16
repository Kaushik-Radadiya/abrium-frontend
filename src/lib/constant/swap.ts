export type TradeOption = {
  label: string;
  value: string;
};

export const TRADE_OPTIONS: TradeOption[] = [
  { label: 'Swap', value: 'swap' },
  { label: 'Buy', value: 'buy' },
  { label: 'Limit', value: 'limit' },
  { label: 'DCA', value: 'dca' },
  { label: 'Hydra', value: 'hydra' },
];

export const SLIPPAGE_OPTIONS = [
  { label: '0.5%', value: '0.5' },
  { label: '1%', value: '1' },
  { label: '2%', value: '2' },
  { label: 'Custom', value: 'custom' },
];

export const TRANSACTION_DEADLINE_OPTIONS = [
  { label: '10 min', value: '10' },
  { label: '20 min', value: '20' },
  { label: '30 min', value: '30' },
];


export const RECEIVE_AMOUNT_FORMATTER = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  useGrouping: false,
});

export const CHANGE_POSITIVE_CLASS = 'text-[#00ff00b3]';
export const CHANGE_NEGATIVE_CLASS = 'text-[#ff3b30b3]';

export type PerformanceRow = {
  label: string;
  value: string;
  valueClassName: string;
};

export const TOKEN_PERFORMANCE_ROW_CONFIG = [
  { label: 'Price', type: 'price' as const },
  {
    label: 'Price change 1h',
    type: 'percent' as const,
    field: 'priceChange1hPercent' as const,
  },
  {
    label: 'Price change 24h',
    type: 'percent' as const,
    field: 'priceChange24hPercent' as const,
  },
  {
    label: 'Price change 7d',
    type: 'percent' as const,
    field: 'priceChange7dPercent' as const,
  },
  {
    label: 'Apy',
    type: 'percent' as const,
    field: 'apy' as const,
  },
];
