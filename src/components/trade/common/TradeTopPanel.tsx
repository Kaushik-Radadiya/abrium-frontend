'use client';

import { ChartCandlestick } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TRADE_OPTIONS } from '@/lib/constant/swap';
import AdvancedSettingsPanel from './AdvancedSettingsPanel';

const TradeTopPanel = () => {
  const router = useRouter();
  const pathname = usePathname();
  const currentMode = pathname?.includes('/limit') ? 'limit' : 'swap';

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <Select
          value={currentMode}
          onValueChange={(mode) => {
            router.push(mode === 'limit' ? '/limit' : '/swap');
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a fruit" />
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
      <div className="flex items-center leading-base gap-2">
        <Button>View Orders</Button>
        <Button variant="icon">
          <ChartCandlestick size={16} />
        </Button>
        <AdvancedSettingsPanel />
      </div>
    </div>
  );
};

export default TradeTopPanel;
