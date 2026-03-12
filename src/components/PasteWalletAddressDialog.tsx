'use client';

import { useState } from 'react';
import { Clipboard, X } from 'lucide-react';
import { getAddress, isAddress } from 'viem';
import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { showAddress } from '@/lib/utils';

type Props = {
  open: boolean;
  recentAddresses: string[];
  initialAddress?: string;
  onOpenChange: (open: boolean) => void;
  onSave: (address: string) => void;
};

export function PasteWalletAddressDialog({
  open,
  recentAddresses,
  initialAddress = '',
  onOpenChange,
  onSave,
}: Props) {
  const [addressInput, setAddressInput] = useState(initialAddress);
  const [addressError, setAddressError] = useState<string | null>(null);

  const handleSave = () => {
    const trimmedValue = addressInput.trim();

    if (!isAddress(trimmedValue)) {
      setAddressError('Enter a valid wallet address.');
      return;
    }

    onSave(getAddress(trimmedValue));
    setAddressError(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className='max-w-105 rounded-[22px] border border-(--neutral-border) bg-[var(--neutral-background)] p-4 shadow-[0_20px_60px_rgba(15,23,42,0.18)]'
        showCloseButton={false}
      >
        <DialogHeader className='flex-row items-center justify-between p-0'>
          <DialogTitle className='text-lg font-semibold leading-none text-[var(--neutral-text-textStrong)]'>
            To Address
          </DialogTitle>
          <Button
            type='button'
            variant='outline'
            size='none'
            className='p-1 rounded-lg'
            onClick={() => onOpenChange(false)}
          >
            <X size={16} />
          </Button>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='flex flex-col gap-1'>
            <div className='relative'>
              <Input
                value={addressInput}
                onChange={(event) => {
                  setAddressInput(event.target.value);
                  setAddressError(null);
                }}
                className='border-(--neutral-border) rounded-lg pr-8'
                placeholder='Wallet address'
              />
              {addressInput ? (
                <Button
                  variant='ghost'
                  className='absolute right-2 top-1/2 p-0! size-5 flex -translate-y-1/2 place-items-center justify-center rounded-full hover:bg-[var(--neutral-background)]'
                  onClick={() => {
                    setAddressInput('');
                    setAddressError(null);
                  }}
                >
                  <X size={14} />
                </Button>
              ) : null}
            </div>
            {addressError ? (
              <p className='text-sm text-[var(--neutral-text-error)]'>
                {addressError}
              </p>
            ) : null}
          </div>

          {recentAddresses.length > 0 ? (
            <div className='flex flex-col gap-2'>
              <div className='text-sm font-medium text-[var(--neutral-text-textWeak)]'>
                Recent addresses
              </div>
              <div className='flex flex-wrap gap-2'>
                {recentAddresses.map((address) => {
                  return (
                    <Button
                      key={address}
                      onClick={() => {
                        setAddressInput(address);
                        setAddressError(null);
                      }}
                      className='text-sm'
                    >
                      <Clipboard size={14} />
                      <span>{showAddress(address)}</span>
                    </Button>
                  );
                })}
              </div>
            </div>
          ) : null}

          <Button
            className='justify-center py-3 w-full text-[var(--neutral-background)] !bg-[var(--neutral-background-strong)] font-bold'
            onClick={handleSave}
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
