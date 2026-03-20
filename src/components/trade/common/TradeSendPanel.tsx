'use client';

import { TradeTokenPanel } from '@/components/trade/common/TradeTokenPanel';
import { formatAmount } from '@/lib/formatAmount';
import type { UiToken } from '@/lib/tokens';

type Props = {
  amount: string;
  usdInput: string;
  valueMode: 'token' | 'usd';
  token?: UiToken;
  usdValue?: number | null;
  chainIcon?: string | null;
  onSelectToken: () => void;
  onAmountChange: (value: string) => void;
  onUsdChange: (value: string) => void;
  onToggleValueMode: () => void;
};

export function TradeSendPanel({
  amount,
  usdInput,
  valueMode,
  token,
  usdValue,
  chainIcon,
  onSelectToken,
  onAmountChange,
  onUsdChange,
  onToggleValueMode,
}: Props) {
  return (
    <TradeTokenPanel
      label='Send'
      amount={valueMode === 'token' ? amount : usdInput}
      amountDisplayMode={valueMode}
      token={token}
      usdValue={usdValue}
      selectedChainIcon={chainIcon}
      onSelectToken={onSelectToken}
      editable
      onAmountChange={valueMode === 'token' ? onAmountChange : onUsdChange}
      bottomLabel={
        valueMode === 'usd' && token
          ? `~${formatAmount(amount)} ${token.symbol}`
          : undefined
      }
      onToggleValueDisplay={onToggleValueMode}
    />
  );
}
