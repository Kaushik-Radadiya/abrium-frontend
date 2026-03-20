'use client';

import { TradeTokenPanel } from '@/components/trade/common/TradeTokenPanel';
import { formatAmount, formatApproxUsd, formatUsd } from '@/lib/formatAmount';
import type { UiToken } from '@/lib/tokens';
import type { SecurityLevel } from '@/lib/api';
import type { WalletSelection } from '@/lib/receive-wallet';

type PriceImpact = {
  usdLabel: string;
  pctLabel: string;
  dollarTooltip: string;
};

type Props = {
  amount: string;
  displayAmount: string;
  valueMode: 'token' | 'usd';
  token?: UiToken;
  usdValue?: number | null;
  chainIcon?: string | null;
  loading?: boolean;
  priceImpact?: PriceImpact;
  receiveWalletSelection?: WalletSelection | null;
  onReceiveWalletChange?: (selection: WalletSelection | null) => void;
  riskLevel?: SecurityLevel | null;
  riskReasons?: string[] | null;
  animateRiskBorder?: boolean;
  onSelectToken: () => void;
};

export function TradeReceivePanel({
  amount,
  displayAmount,
  valueMode,
  token,
  usdValue,
  chainIcon,
  loading,
  priceImpact,
  receiveWalletSelection,
  onReceiveWalletChange,
  riskLevel,
  riskReasons,
  animateRiskBorder,
  onSelectToken,
}: Props) {
  const receiveValueMode = token ? valueMode : 'token';

  return (
    <TradeTokenPanel
      label='Receive'
      amount={receiveValueMode === 'usd' ? formatUsd(usdValue) : displayAmount}
      amountDisplayMode={receiveValueMode}
      token={token}
      usdValue={usdValue}
      selectedChainIcon={chainIcon}
      onSelectToken={onSelectToken}
      loading={loading}
      bottomLabel={
        receiveValueMode === 'usd' && token
          ? `~${formatAmount(amount)} ${token.symbol}`
          : (priceImpact?.usdLabel ?? formatApproxUsd(usdValue) ?? undefined)
      }
      impactPctLabel={priceImpact?.pctLabel}
      impactDollarTooltip={priceImpact?.dollarTooltip}
      onReceiveWalletChange={onReceiveWalletChange}
      receiveWalletSelection={receiveWalletSelection}
      riskLevel={riskLevel}
      riskReasons={riskReasons}
      animateRiskBorder={animateRiskBorder}
    />
  );
}
