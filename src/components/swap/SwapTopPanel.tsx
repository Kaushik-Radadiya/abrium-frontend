import { ChartCandlestick, Settings } from "lucide-react";
import { Button } from "../ui/Button";

const SwapTopPanel = () => {
    return (
        <div className="flex items-center justify-between">
            <div>
                <Button>
                    Swap
                </Button>
            </div>
            <div className="flex items-center leading-base gap-2">
                <Button>
                    View Orders
                </Button>
                <Button variant="icon">
                    <ChartCandlestick size={16} />
                </Button>
                <Button variant="icon">
                    <Settings size={16} />
                </Button>
            </div>
        </div>
    );
};

export default SwapTopPanel;