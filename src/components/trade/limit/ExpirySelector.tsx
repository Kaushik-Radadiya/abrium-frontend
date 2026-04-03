'use client';

import { PillRadioGroup } from '@/components/ui/radio-group';
import { EXPIRY_OPTIONS } from '@/lib/constant/trade';

type ExpirySelectorProps = {
  value: string;
  onChange: (value: string) => void;
};

const EXPIRY_RADIO_OPTIONS = EXPIRY_OPTIONS.map((expiry) => ({
  label: expiry,
  value: expiry,
}));

export function ExpirySelector({ value, onChange }: ExpirySelectorProps) {
  return (
    <div className='flex flex-wrap items-center justify-between gap-3 px-1'>
      <span className='text-base text-[var(--neutral-text-textWeak)]'>
        Expiry
      </span>
      <PillRadioGroup
        value={value}
        onChange={onChange}
        options={EXPIRY_RADIO_OPTIONS}
      />
    </div>
  );
}
