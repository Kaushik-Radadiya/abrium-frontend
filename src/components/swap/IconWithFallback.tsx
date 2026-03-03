'use client';

import { ShimmerImage } from '@/components/ui/ShimmerImage';

type Props = {
  src?: string | null;
  alt: string;
  fallback: string;
  sizes?: string;
  showFallback?: boolean;
};

export function IconWithFallback({
  src,
  alt,
  fallback,
  sizes = '64px',
  showFallback = true,
}: Props) {
  return (
    <ShimmerImage
      src={src}
      alt={alt}
      fallback={fallback}
      sizes={sizes}
      showFallback={showFallback}
      containerClassName="absolute inset-0 rounded-[inherit]"
      imageClassName="rounded-[inherit] object-cover"
    />
  );
}
