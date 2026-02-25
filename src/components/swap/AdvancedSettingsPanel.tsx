import React, { useState } from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Button } from '../ui/Button';
import { Info, Settings } from 'lucide-react';
import { PillRadioGroup } from '../ui/radio-group';
import { Label } from '../ui/label';
import { SLIPPAGE_OPTIONS, TRANSACTION_DEADLINE_OPTIONS } from '@/lib/constant/swap';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

const AdvancedSettingsPanel = () => {
    const [settingOpen, setSettingOpen] = useState(false);
    const [slippage, setSlippage] = useState('1')
    const [transactionDeadline, setTransactionDeadline] = useState('10')
    return (
        <div>
            <DropdownMenu open={settingOpen} onOpenChange={setSettingOpen}>
                <DropdownMenuTrigger asChild>
                    <Button variant="icon">
                        <Settings size={16} />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="end"
                    className="thin-scrollbar space-y-4 z-[60] grid max-h-[min(62vh,420px)] w-[260px] text-[var(--neutral-text-textWeak)] overflow-y-auto rounded-xl border border-[var(--neutral-border)] bg-[var(--neutral-background-raised)] p-4"
                >
                    <div className="flex items-center justify-between text-[var(--neutral-text)] text-base">
                        Advanced Settings
                    </div>
                    <div className='flex flex-col gap-3'>
                        <div className='flex items-center gap-1'>
                            <Label>Slippage Tolerance</Label>
                            <Tooltip>
                                <TooltipTrigger type="button" className="cursor-help text-[var(--neutral-text-textWeak)]">
                                    <Info size={12} />
                                </TooltipTrigger>
                                <TooltipContent className="z-[100] text-center">
                                    Max price movement accepted. If exceeded, the swap reverts.
                                </TooltipContent>
                            </Tooltip>
                        </div>
                        <PillRadioGroup
                            value={slippage}
                            onChange={setSlippage}
                            options={SLIPPAGE_OPTIONS}
                        />
                    </div>

                    <div className='flex flex-col gap-3'>
                        <Label className=''>Transaction Deadline</Label>
                        <PillRadioGroup
                            value={transactionDeadline}
                            onChange={setTransactionDeadline}
                            options={TRANSACTION_DEADLINE_OPTIONS}
                        />
                    </div>


                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}

export default AdvancedSettingsPanel