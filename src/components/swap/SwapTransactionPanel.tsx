import { Info } from 'lucide-react';
import type { UiToken } from '@/lib/tokens';
import type { SwapQuoteResponsePayload } from '@/lib/quotes.types';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

type Props = {
  fromToken?: UiToken;
  toToken?: UiToken;
  quote?: SwapQuoteResponsePayload | null;
  isRateLoading?: boolean;
  rateErrorMessage?: string | null;
};

const RATE_SCALE = BigInt(1_000_000);

function formatExchangeRate(
  quote?: SwapQuoteResponsePayload | null,
  fromToken?: UiToken,
  toToken?: UiToken,
) {
  if (!quote || !fromToken || !toToken) return null;

  try {
    const inputAmount = BigInt(quote.input.amount);
    const outputAmount = BigInt(quote.output.amount);
    if (inputAmount <= BigInt(0) || outputAmount <= BigInt(0)) return null;

    const fromDecimalsFactor = BigInt(10) ** BigInt(fromToken.decimals);
    const toDecimalsFactor = BigInt(10) ** BigInt(toToken.decimals);

    const scaledRate =
      (outputAmount * fromDecimalsFactor * RATE_SCALE) /
      (inputAmount * toDecimalsFactor);

    const whole = scaledRate / RATE_SCALE;
    const fraction = (scaledRate % RATE_SCALE)
      .toString()
      .padStart(6, '0')
      .replace(/0+$/, '');

    return `1 ${fromToken.symbol} = ${fraction ? `${whole}.${fraction}` : whole.toString()} ${toToken.symbol}`;
  } catch {
    return null;
  }
}

const SwapTransactionPanel = ({
  fromToken,
  toToken,
  quote,
  isRateLoading = false,
  rateErrorMessage = null,
}: Props) => {
  const exchangeRate = formatExchangeRate(quote, fromToken, toToken);
  const hasTokenPair = Boolean(fromToken && toToken);
  const rateLabel =
    exchangeRate ??
    rateErrorMessage ??
    (hasTokenPair
      ? 'Rate unavailable for this token pair'
      : 'Select tokens to see rate');

  return (
    <div className='px-2'>
      <div className='flex items-center gap-2'>
        <Info className='h-3 w-3' color='var(--neutral-text-textWeak)' />
        {isRateLoading && hasTokenPair ? (
          <span
            aria-hidden='true'
            className='inline-block h-3 w-36 rounded-full bg-[linear-gradient(90deg,var(--shimmer-a)_25%,var(--shimmer-b)_37%,var(--shimmer-c)_63%)] bg-[length:300%_100%] animate-pulse'
          />
        ) : (
          <span className='text-xs text-[var(--neutral-text-textWeak)]'>
            {rateLabel}
          </span>
        )}
      </div>
      <hr className='my-3 border-(--neutral-border)' />
      <div className='flex flex-col gap-3'>
        <div className='flex items-center justify-between'>
          <span className='text-xs text-[var(--neutral-text-textWeak)]'>
            Network Cost
          </span>
          <span className='text-xs text-[var(--neutral-text)]'>$7.2</span>
        </div>
        <div className='flex items-center justify-between'>
          <span className='text-xs text-[var(--neutral-text-textWeak)]'>
            Price Impact
          </span>
          <span className='text-xs text-[var(--neutral-text-success)]'>
            0.12%
          </span>
        </div>
        <div className='flex items-center justify-between'>
          <span className='text-xs text-[var(--neutral-text-textWeak)]'>
            Route
            <Tooltip>
              <TooltipTrigger
                type='button'
                className='ml-1 inline-flex cursor-help align-middle'
              >
                <Info
                  className='h-3 w-3'
                  color='var(--neutral-text-textWeak)'
                />
              </TooltipTrigger>
              <TooltipContent className='z-[100] text-center'>
                The route is the path used to execute this swap.
              </TooltipContent>
            </Tooltip>
          </span>
          <span className='text-xs text-[var(--neutral-text-success)]'>
            0.12%
          </span>
        </div>
      </div>
    </div>
  );
};

export default SwapTransactionPanel;
