import { ArrowUpRight } from 'lucide-react';
import { IconWithFallback } from '@/components/trade/common/IconWithFallback';
import { Button } from '@/components/ui/Button';
import { TableCell, TableRow } from '@/components/ui/table';
import { getTokenIconUrl } from '@/lib/icons';
import { HistoryItem, HistoryStatus } from '@/components/history/types';
import { cn } from '@/lib/utils';
import { jetBrainsMono } from '@/style/font';

type HistoryTableRowProps = {
  item: HistoryItem;
};

const STATUS_STYLES: Record<HistoryStatus, string> = {
  Pending:
    'border-(--alert-warning-border) bg-(--alert-warning-bg) text-(--alert-warning-border)',
  Completed:
    'border-(--neutral-border-sucess) bg-(--neutral-background-sucess) text-(--neutral-text-sucess)',
  Failed:
    'border-(--neutral-border-error) bg-(--neutral-danger-background) text-(--neutral-text-error)',
};

export function HistoryTableRow({ item }: HistoryTableRowProps) {
  return (
    <TableRow>
      <TableCell className='text-(--neutral-text-weak)'>{item.date}</TableCell>
      <TableCell className='text-(--neutral-text-weak)'>{item.type}</TableCell>
      <TableCell>
        <div className='flex items-center gap-2 text-(--neutral-text-weak)'>
          <div className='relative h-5 w-5 rounded-full'>
            <IconWithFallback
              src={getTokenIconUrl(item.fromToken)}
              alt={item.fromToken}
              fallback={item.fromToken.charAt(0)}
              sizes='20px'
            />
          </div>
          <span>{item.fromToken}</span>
          <span className='text-(--neutral-text-textWeak)'>-&gt;</span>
          <div className='relative h-5 w-5 rounded-full'>
            <IconWithFallback
              src={getTokenIconUrl(item.toToken)}
              alt={item.toToken}
              fallback={item.toToken.charAt(0)}
              sizes='20px'
            />
          </div>
          <span>{item.toToken}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className={cn('leading-tight', jetBrainsMono.className)}>
          <p className='font-medium text-(--neutral-text-sucess)'>
            {item.amount}
          </p>
          <p className='text-xs text-(--neutral-text-textWeak)'>
            {item.amountSubtext}
          </p>
        </div>
      </TableCell>
      <TableCell
        className={cn(
          'text-base text-(--neutral-text-textWeak)',
          jetBrainsMono.className,
        )}
      >
        {item.duration}
      </TableCell>
      <TableCell>
        <span
          className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${STATUS_STYLES[item.status]}`}
        >
          {item.status}
        </span>
      </TableCell>
      <TableCell className='text-right'>
        <Button
          size='none'
          className='ml-auto rounded-full gap-1! justify-center text-(--neutral-text) border border-(--neutral-border) bg-(--neutral-background-raised) px-2.5 py-1 text-xs'
        >
          View <ArrowUpRight className='size-3.5' />
        </Button>
      </TableCell>
    </TableRow>
  );
}
