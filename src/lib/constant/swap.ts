export type TradeOption = {
    label: string
    value: string
}

export const TRADE_OPTIONS: TradeOption[] = [
    { label: "Swap", value: "swap" },
    { label: "Buy", value: "buy" },
    { label: "Limit", value: "limit" },
    { label: "DCA", value: "dca" },
    { label: "Hydra", value: "hydra" },
]

export const SLIPPAGE_OPTIONS = [
    { label: '0.5%', value: '0.5' },
    { label: '1%', value: '1' },
    { label: '2%', value: '2' },
    { label: 'Custom', value: 'custom' },
]

export const TRANSACTION_DEADLINE_OPTIONS = [
    { label: '10 min', value: '10' },
    { label: '20 min', value: '20' },
    { label: '30 min', value: '30' },
]

