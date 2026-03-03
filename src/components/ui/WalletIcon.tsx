'use client';

import { ShimmerImage } from '@/components/ui/ShimmerImage';

type WalletIconProps = {
  icon?: string;
  label: string;
  size?: string;
  sizes?: string;
  className?: string;
};

export function WalletIcon({
  icon,
  label,
  size = '18px',
  sizes,
  className,
}: WalletIconProps) {
  return (
    <ShimmerImage
      src={icon}
      alt={label}
      fallback={label[0]?.toUpperCase() ?? 'W'}
      sizes={sizes ?? size}
      containerClassName={className ?? `bg-transparent`}
      imageClassName="object-contain"
      width={Number.parseInt(size, 10)}
      height={Number.parseInt(size, 10)}
    />
  );
}
