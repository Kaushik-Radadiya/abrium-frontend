'use client';

import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  CalendarDays,
  Ellipsis,
  Repeat2,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { IconWithFallback } from '@/components/trade/common/IconWithFallback';
import {
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { getTokenIconUrl } from '@/lib/icons';
import { Progress } from '@/components/ui/Progress';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TRADE_OPTIONS } from '@/lib/constant/trade';

const ViewOrderSheet = () => {
  const router = useRouter();

  const handleViewAllOrders = () => {
    router.push('/history');
  };

  return (
    <SheetContent
      side='right'
      className='w-full sm:min-w-110 bg-(--neutral-background) pr-1'
    >
      <SheetHeader className='p-6 pe-5'>
        <SheetTitle className='text-(--neutral-text) font-medium text-2xl'>
          Active Orders
        </SheetTitle>
      </SheetHeader>
      <div className='ps-6 grid gap-4 pe-4'>
        <Select defaultValue='all'>
          <SelectTrigger className='w-max'>
            <SelectValue placeholder='Select a trade' />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {[{ label: 'All Orders', value: 'all' }, ...TRADE_OPTIONS]?.map(
                (option, index) => (
                  <SelectItem key={index} value={option.value}>
                    {option.label}
                  </SelectItem>
                ),
              )}
            </SelectGroup>
          </SelectContent>
        </Select>
        <div className='rounded-2xl flex flex-col gap-6 border border-(--neutral-border) bg-(--neutral-background-raised) p-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <h3 className='text-base leading-4 text-(--neutral-text) font-medium'>
                Limit Order
              </h3>
              <span className='rounded-full border border-(--neutral-border-sucess) bg-(--neutral-border-sucess) px-1.5 py-0.5 text-xs text-(--neutral-text-sucess)'>
                Active
              </span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  className='p-0! justify-center rounded-full text-(--neutral-text-textWeak)'
                >
                  <Ellipsis className='size-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align='end'
                className='w-44 border border-[var(--neutral-border)] bg-[var(--neutral-background-raised)]'
              >
                <DropdownMenuItem className='py-[3.5px]! hover:bg-(--neutral-background-hover) leading-4 text-base'>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem className='py-[3.5px]! hover:bg-(--neutral-background-hover) leading-4 text-base'>
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant='destructive'
                  className='py-[3.5px]! hover:bg-(--neutral-background-hover) leading-4 text-(--neutral-text-error) text-base'
                >
                  Cancel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className='flex items-center gap-3'>
            <div className='relative h-6 w-6 rounded-full'>
              <IconWithFallback
                src={getTokenIconUrl('USDC')}
                alt='USDC'
                fallback='U'
                sizes='24px'
              />
            </div>
            <span className='text-base text-(--neutral-text)'>USDC</span>
            <ArrowRight className='size-4 text-(--neutral-text-textWeak)' />
            <div className='relative h-6 w-6 rounded-full'>
              <IconWithFallback
                src={getTokenIconUrl('ETH')}
                alt='ETH'
                fallback='E'
                sizes='24px'
              />
            </div>
            <span className='text-base text-(--neutral-text)'>ETH</span>
          </div>
          <div>
            <Progress value={65} max={100} className='h-1 rounded-full' />

            <div className='mt-3 flex items-center justify-between text-xs text-(--neutral-text-textWeak)'>
              <span>1.5 / 2.3 ETH filled</span>
              <span>Expiring in 3d</span>
            </div>
          </div>
        </div>

        <div className='rounded-2xl flex flex-col gap-6 border border-(--neutral-border) bg-(--neutral-background-raised) p-4'>
          <div className='flex items-start justify-between'>
            <div className='flex items-center gap-2'>
              <h3 className='text-base text-(--neutral-text) font-medium'>
                DCA Plan
              </h3>
              <span className='rounded-full border border-(--neutral-border-sucess) bg-(--neutral-border-sucess) px-1.5 py-0.5 text-xs text-(--neutral-text-sucess)'>
                Active
              </span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  className='p-0! justify-center rounded-full text-(--neutral-text-textWeak)'
                >
                  <Ellipsis className='size-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align='end'
                className='w-44 border border-[var(--neutral-border)] bg-[var(--neutral-background-raised)]'
              >
                <DropdownMenuItem className='py-[3.5px]! hover:bg-(--neutral-background-hover) leading-4 text-base'>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem className='py-[3.5px]! hover:bg-(--neutral-background-hover) leading-4 text-base'>
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant='destructive'
                  className='py-[3.5px]! hover:bg-(--neutral-background-hover) leading-4 text-(--neutral-text-error) text-base'
                >
                  Cancel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className='flex  gap-3 justify-between'>
            <div className='flex items-center gap-2'>
              <span className='grid h-10 w-10 place-items-center rounded-full bg-[var(--neutral-background)] text-(--neutral-text)'>
                <Repeat2 className='size-4' />
              </span>
              <div className='text-xs'>
                <div className='text-(--neutral-text-textWeak)'>Monthly</div>
                <div className='text-(--neutral-text)'>$200</div>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <span className='grid h-10 w-10 place-items-center rounded-full bg-[var(--neutral-background)] text-(--neutral-text)'>
                <CalendarDays className='size-4' />
              </span>
              <div className='text-xs'>
                <div className='text-(--neutral-text-textWeak)'>Next buy</div>
                <div className='text-(--neutral-text)'>Dec 14, 15:10</div>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <span className='grid h-10 w-10 place-items-center rounded-full bg-[var(--neutral-background)] text-(--neutral-text)'>
                <TrendingUp className='size-4' />
              </span>
              <div className='text-xs'>
                <div className='text-(--neutral-text-textWeak)'>Invested</div>
                <div className='text-(--neutral-text)'>$2,400</div>
              </div>
            </div>
          </div>
        </div>

        <div className='rounded-2xl flex flex-col gap-6 border border-(--neutral-border) bg-(--neutral-background-raised) p-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <h3 className='text-base leading-4 text-(--neutral-text) font-medium'>
                Hydra
              </h3>
              <span className='rounded-full border border-(--neutral-border-sucess) bg-(--neutral-border-sucess) px-1.5 py-0.5 text-xs text-(--neutral-text-sucess)'>
                Active
              </span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  className='p-0! justify-center rounded-full text-(--neutral-text-textWeak)'
                >
                  <Ellipsis className='size-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align='end'
                className='w-44 border border-[var(--neutral-border)] bg-[var(--neutral-background-raised)]'
              >
                <DropdownMenuItem className='py-[3.5px]! hover:bg-(--neutral-background-hover) leading-4 text-base'>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem className='py-[3.5px]! hover:bg-(--neutral-background-hover) leading-4 text-base'>
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant='destructive'
                  className='py-[3.5px]! hover:bg-(--neutral-background-hover) leading-4 text-(--neutral-text-error) text-base'
                >
                  Cancel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className='flex items-center gap-3'>
            <div className='relative h-6 w-6 rounded-full'>
              <IconWithFallback
                src={getTokenIconUrl('USDC')}
                alt='USDC'
                fallback='U'
                sizes='24px'
              />
            </div>
            <span className='text-base text-(--neutral-text)'>USDC</span>
            <ArrowRight className='size-4 text-(--neutral-text-textWeak)' />
            <div className='relative h-6 w-6 rounded-full'>
              <IconWithFallback
                src={getTokenIconUrl('ETH')}
                alt='ETH'
                fallback='E'
                sizes='24px'
              />
            </div>
            <span className='text-base text-(--neutral-text)'>ETH</span>
          </div>
          <div>
            <Progress value={30} max={100} className='h-1 rounded-full' />

            <div className='mt-3 flex items-center justify-between text-xs text-(--neutral-text-textWeak)'>
              <span>2 / 6 swaps completed</span>
              <span>2h remaining</span>
            </div>
          </div>
        </div>
      </div>
      <SheetFooter className='p-6 grid grid-cols-2 gap-2 pe-5'>
        <SheetClose className='w-full'>
          <Button className='justify-center w-full px-4 py-3'>Cancel</Button>
        </SheetClose>
        <SheetClose asChild>
          <Button
            onClick={handleViewAllOrders}
            className='rounded-full justify-center border border-transparent bg-[var(--swap-action-bg)] px-4 py-3 font-medium text-[var(--swap-action-text)] text-base'
          >
            View all orders
          </Button>
        </SheetClose>
      </SheetFooter>
    </SheetContent>
  );
};

export default ViewOrderSheet;
