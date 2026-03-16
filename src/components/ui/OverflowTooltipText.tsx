'use client';

import {
  type CSSProperties,
  type FocusEvent,
  type PointerEvent,
  type ReactElement,
  useState,
} from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

type Props = {
  text: string;
  ariaLabel?: string;
  className?: string;
  style?: CSSProperties;
  tooltipClassName?: string;
  trigger?: ReactElement;
};

export function OverflowTooltipText({
  text,
  ariaLabel,
  className,
  style,
  tooltipClassName,
  trigger,
}: Props) {
  const [open, setOpen] = useState(false);

  const handleOpen = (
    event: PointerEvent<HTMLElement> | FocusEvent<HTMLElement>,
  ) => {
    const container = event.currentTarget;
    const measurableElement =
      container.querySelector<HTMLElement>(
        'input, textarea, [data-overflow-target="true"]',
      ) ?? container;

    setOpen(measurableElement.scrollWidth > measurableElement.clientWidth);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Tooltip open={open}>
      <TooltipTrigger asChild>
        {trigger ? (
          <span
            className='block min-w-0'
            aria-label={ariaLabel}
            onPointerEnter={handleOpen}
            onFocus={handleOpen}
            onPointerLeave={handleClose}
            onBlur={handleClose}
          >
            {trigger}
          </span>
        ) : (
          <span
            className={cn('block truncate cursor-pointer', className)}
            style={style}
            aria-label={ariaLabel}
            onPointerEnter={handleOpen}
            onFocus={handleOpen}
            onPointerLeave={handleClose}
            onBlur={handleClose}
          >
            {text}
          </span>
        )}
      </TooltipTrigger>
      <TooltipContent
        side='top'
        sideOffset={2}
        className={cn('max-w-none font-mono text-sm', tooltipClassName)}
      >
        {text}
      </TooltipContent>
    </Tooltip>
  );
}
