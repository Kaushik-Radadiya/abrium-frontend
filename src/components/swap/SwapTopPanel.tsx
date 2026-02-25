import { ChartCandlestick } from 'lucide-react';
import { Button } from '../ui/Button';
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

const SwapTopPanel = () => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <Select defaultValue="swap">
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

export default SwapTopPanel;
