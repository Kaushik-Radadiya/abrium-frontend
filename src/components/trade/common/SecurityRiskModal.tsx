'use client';

import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reasons?: string[] | null;
  onGoBack: () => void;
  onProceedAnyway: () => void;
};

const FALLBACK_REASONS = [
  'Honeypot risk',
  'Cannot sell risk',
  'High/100% tax risk',
];

export function SecurityRiskModal({
  open,
  onOpenChange,
  reasons,
  onGoBack,
  onProceedAnyway,
}: Props) {
  const resolvedReasons =
    reasons && reasons.length > 0 ? reasons : FALLBACK_REASONS;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className='max-w-125 border border-(--neutral-border) bg-(--neutral-background) p-0'
        showCloseButton={false}
      >
        <DialogHeader className='gap-3 border-b border-(--neutral-border) p-4'>
          <DialogTitle className='text-xl font-semibold text-(--neutral-text)'>
            Security Risk Detected
          </DialogTitle>
        </DialogHeader>

        <ul className='px-4 py-2 flex flex-col gap-1'>
          {resolvedReasons.map((reason) => (
            <li key={reason} className='flex items-start gap-2 text-sm text-(--neutral-text)'>
              <span className='mt-1.5 size-1.5 shrink-0 rounded-full bg-(--neutral-text-textWeak)' />
              {reason}
            </li>
          ))}
        </ul>

        <div className='grid grid-cols-2 gap-2 border-t border-(--neutral-border) p-4'>
          <Button
            type='button'
            className='w-full text-sm font-normal justify-center rounded-lg border border-(--neutral-border-sucess)! bg-(--neutral-background-sucess)! text-(--neutral-text-sucess)'
            onClick={onGoBack}
          >
            Go Back (Recommended)
          </Button>
          <Button
            type='button'
            variant='outline'
            className='w-full text-sm font-normal justify-center rounded-lg border border-(--neutral-border-error)! bg-(--neutral-background-error)! text-(--neutral-text-error)'
            onClick={onProceedAnyway}
          >
            Proceed Anyway
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
