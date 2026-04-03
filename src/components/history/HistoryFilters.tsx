import { CalendarDays, ChevronDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { STATUS, TRADE_OPTIONS } from '@/lib/constant/trade';

const FILTER_BUTTON_CLASS =
  'rounded-full border border-(--neutral-border) bg-(--neutral-background-raised) px-3 py-2 text-sm text-(--neutral-text)';

export function HistoryFilters() {
  return (
    <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
      <div className='flex flex-wrap items-center gap-2'>
        <Select defaultValue='all'>
          <SelectTrigger className='w-max'>
            <SelectValue placeholder='Type' />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {[{ label: 'Type', value: 'all' }, ...TRADE_OPTIONS]?.map(
                (option, index) => (
                  <SelectItem key={index} value={option.value}>
                    {option.label}
                  </SelectItem>
                ),
              )}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select defaultValue='all'>
          <SelectTrigger className='w-max'>
            <SelectValue placeholder='Status' />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {[{ label: 'Status', value: 'all' }, ...STATUS]?.map(
                (option, index) => (
                  <SelectItem key={index} value={option.value}>
                    {option.label}
                  </SelectItem>
                ),
              )}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button size='none' className={FILTER_BUTTON_CLASS}>
          <CalendarDays className='size-4 text-(--neutral-text-textWeak)' />
          Last 30 days{' '}
          <ChevronDown className='size-4 text-(--neutral-text-textWeak)' />
        </Button>
      </div>
      <div className='relative w-full md:w-[320px]'>
        <Search className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-(--neutral-text-textWeak)' />
        <Input
          className='h-10 rounded-xl border-(--neutral-border) bg-(--neutral-background-raised) pl-9'
          placeholder='Search by hash or token...'
        />
      </div>
    </div>
  );
}
