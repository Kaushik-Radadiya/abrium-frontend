import { HistoryTableRow } from '@/components/history/HistoryTableRow';
import { HistoryItem } from '@/components/history/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type HistoryTableProps = {
  items: HistoryItem[];
};

export function HistoryTable({ items }: HistoryTableProps) {
  return (
    <div className=''>
      <Table>
        <TableHeader>
          <TableRow className='hover:bg-transparent'>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Pair / Route</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className='text-right'>Explorer</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <HistoryTableRow key={item.id} item={item} />
          ))}
          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className='h-24 text-center'>
                No history entries found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
