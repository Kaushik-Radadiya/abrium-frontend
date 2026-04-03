'use client';

import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '@/lib/utils';

function Progress({
  className,
  value = 0,
  max = 100,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  const safeValue = Math.max(0, Math.min(value ?? 0, max));
  const percentage = max > 0 ? (safeValue / max) * 100 : 0;

  return (
    <ProgressPrimitive.Root
      value={safeValue}
      max={max}
      data-slot='progress'
      className={cn(
        'bg-(--neutral-background) relative h-1 w-full overflow-hidden rounded-full',
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot='progress-indicator'
        className='bg-[#22C55E] h-full w-full flex-1 transition-transform duration-700 ease-out'
        style={{ transform: `translateX(-${100 - percentage}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

function ProgressTrack({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='progress-track'
      className={cn(
        'bg-(--neutral-background) relative h-1 w-full overflow-hidden rounded-full',
        className,
      )}
      {...props}
    />
  );
}

function ProgressIndicator({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='progress-indicator'
      className={cn('bg-primary h-full w-full transition-transform', className)}
      {...props}
    />
  );
}

function ProgressLabel({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='progress-label'
      className={cn('text-sm font-medium', className)}
      {...props}
    />
  );
}

function ProgressValue({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='progress-value'
      className={cn(
        'text-muted-foreground ml-auto text-sm tabular-nums',
        className,
      )}
      {...props}
    />
  );
}

export {
  Progress,
  ProgressTrack,
  ProgressIndicator,
  ProgressLabel,
  ProgressValue,
};
