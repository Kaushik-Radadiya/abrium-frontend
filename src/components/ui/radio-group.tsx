'use client'

import * as RadioGroup from '@radix-ui/react-radio-group'
import { cn } from '@/lib/utils'

type Option = {
    label: string
    value: string
}

interface PillRadioGroupProps {
    value: string
    onChange: (value: string) => void
    options: Option[]
}

export function PillRadioGroup({
    value,
    onChange,
    options,
}: PillRadioGroupProps) {
    return (
        <>
            <RadioGroup.Root
                value={value}
                onValueChange={onChange}
                className="flex gap-2"
            >
                {options.map((opt) => (
                    <RadioGroup.Item
                        key={opt.value}
                        value={opt.value}
                        className={cn(
                            'px-2 py-1 rounded-full text-xs min-w-[42px] border font-medium transition-colors',
                            'bg-[var(--neutral-background-raised)] text-[var(--neutral-text-text)]',
                            'data-[state=checked]:border-[var(--neutral-text)]',
                            'data-[state=checked]:text-[var(--neutral-text)]',
                        )}
                    >
                        {opt.label}
                    </RadioGroup.Item>
                ))}
            </RadioGroup.Root>
        </>
    )
}