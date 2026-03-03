'use client';

import { type CSSProperties, type ReactNode, useRef, useState } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

type OverflowTooltipTriggerProps = {
  setTriggerElement: (node: HTMLElement | null) => void;
  onPointerEnter: () => void;
  onFocus: () => void;
  onPointerLeave: () => void;
  onBlur: () => void;
};

type Props = {
  text: string;
  ariaLabel?: string;
  className?: string;
  style?: CSSProperties;
  tooltipClassName?: string;
  renderTrigger?: (props: OverflowTooltipTriggerProps) => ReactNode;
};

export function OverflowTooltipText({
  text,
  ariaLabel,
  className,
  style,
  tooltipClassName,
  renderTrigger,
}: Props) {
  const triggerRef = useRef<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    const element = triggerRef.current;
    if (!element) return;
    setOpen(element.scrollWidth > element.clientWidth);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const setTriggerElement = (node: HTMLElement | null) => {
    triggerRef.current = node;
  };

  return (
    <Tooltip open={open}>
      <TooltipTrigger asChild>
        {renderTrigger ? (
          renderTrigger({
            setTriggerElement,
            onPointerEnter: handleOpen,
            onFocus: handleOpen,
            onPointerLeave: handleClose,
            onBlur: handleClose,
          })
        ) : (
          <span
            ref={setTriggerElement}
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
      <TooltipContent side="top" sideOffset={2} className={cn('max-w-none font-mono text-sm', tooltipClassName)}>
        {text}
      </TooltipContent>
    </Tooltip>
  );
}
