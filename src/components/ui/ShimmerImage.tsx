'use client';

import Image, { type ImageLoaderProps } from 'next/image';
import { type ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';

const passthroughImageLoader = ({ src }: ImageLoaderProps) => src;

type ShimmerImageProps = {
  src?: string | null;
  alt: string;
  fallback?: ReactNode;
  showFallback?: boolean;
  sizes?: string;
  containerClassName?: string;
  imageClassName?: string;
  width?: number;
  height?: number;
  priority?: boolean;
};

export function ShimmerImage({
  src,
  alt,
  fallback,
  showFallback = true,
  sizes = '64px',
  containerClassName,
  imageClassName,
  width,
  height,
  priority = false,
}: ShimmerImageProps) {
  const srcKey = src ?? 'no-src';
  const [status, setStatus] = useState<{
    srcKey: string;
    loaded: boolean;
    failed: boolean;
  }>({
    srcKey,
    loaded: false,
    failed: !src,
  });

  const loaded = status.srcKey === srcKey ? status.loaded : false;
  const failed = status.srcKey === srcKey ? status.failed : !src;
  const canShowImage = Boolean(src) && !failed;

  return (
    <span
      className={cn(
        'relative block overflow-hidden rounded-[inherit]',
        containerClassName,
      )}
      style={width && height ? { width, height } : undefined}
    >
      {canShowImage ? (
        <Image
          key={srcKey}
          src={src ?? ''}
          alt={alt}
          loader={passthroughImageLoader}
          unoptimized
          fill
          sizes={sizes}
          priority={priority}
          className={cn('h-full w-full object-cover', imageClassName)}
          onLoad={() => {
            setStatus({
              srcKey,
              loaded: true,
              failed: false,
            });
          }}
          onError={() => {
            setStatus({
              srcKey,
              loaded: false,
              failed: true,
            });
          }}
        />
      ) : null}

      {canShowImage && !loaded ? (
        <span
          className="absolute inset-0 rounded-[inherit] bg-[linear-gradient(90deg,var(--shimmer-a)_25%,var(--shimmer-b)_37%,var(--shimmer-c)_63%)] bg-[length:300%_100%] animate-pulse"
          aria-hidden="true"
        />
      ) : null}

      {showFallback && !canShowImage ? (
        <span className="absolute inset-0 grid place-items-center text-xs font-semibold text-[var(--neutral-text-textWeak)]">
          {fallback ?? alt[0]?.toUpperCase() ?? 'I'}
        </span>
      ) : null}
    </span>
  );
}
