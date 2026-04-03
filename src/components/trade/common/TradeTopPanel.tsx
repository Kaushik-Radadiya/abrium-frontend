'use client';

import { ChartCandlestick } from 'lucide-react';
import { Sheet, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/Button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TRADE_OPTIONS } from '@/lib/constant/trade';
import AdvancedSettingsPanel from './AdvancedSettingsPanel';
import ViewOrderSheet from './ViewOrderSheet';

const TradeTopPanel = () => {
  return (
    <div className='flex items-center justify-between mb-6'>
      <div>
        <Select defaultValue='swap'>
          <SelectTrigger className='w-full'>
            <SelectValue placeholder='Select a trade' />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {TRADE_OPTIONS?.map((option, index) => (
                <SelectItem key={index} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className='flex items-center leading-base gap-2'>
        <Sheet>
          <SheetTrigger asChild>
            <Button>View Orders</Button>
          </SheetTrigger>
          <ViewOrderSheet />
        </Sheet>
        <Button variant='icon'>
          <ChartCandlestick size={16} />
        </Button>
        <AdvancedSettingsPanel />
      </div>
    </div>
  );
};

export default TradeTopPanel;
