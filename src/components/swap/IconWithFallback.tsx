'use client'

import Image from 'next/image'
import { useState } from 'react'

type Props = {
  src?: string | null
  alt: string
  fallback: string
  sizes?: string
  showFallback?: boolean
}

export function IconWithFallback({
  src,
  alt,
  fallback,
  sizes = '64px',
  showFallback = true,
}: Props) {
  const srcKey = src ?? 'no-src'
  const [status, setStatus] = useState<{
    srcKey: string
    loaded: boolean
    failed: boolean
  }>({
    srcKey,
    loaded: false,
    failed: !src,
  })

  const loaded = status.srcKey === srcKey ? status.loaded : false
  const failed = status.srcKey === srcKey ? status.failed : !src
  const canShowImage = Boolean(src) && !failed

  return (
    <>
      {canShowImage ? (
        <Image
          key={srcKey}
          src={src ?? ''}
          alt={alt}
          fill
          unoptimized
          sizes={sizes}
          className='h-full w-full rounded-[inherit] object-cover'
          onLoad={() => {
            setStatus({
              srcKey,
              loaded: true,
              failed: false,
            })
          }}
          onError={() => {
            setStatus({
              srcKey,
              loaded: false,
              failed: true,
            })
          }}
        />
      ) : null}
      {canShowImage && !loaded ? (
        <span
          className='absolute inset-0 rounded-[inherit] bg-[linear-gradient(90deg,var(--shimmer-a)_25%,var(--shimmer-b)_37%,var(--shimmer-c)_63%)] bg-[length:300%_100%] animate-pulse'
          aria-hidden='true'
        />
      ) : null}
      {showFallback && !canShowImage ? (
        <span className='absolute inset-0 grid place-items-center text-xs font-bold'>
          {fallback}
        </span>
      ) : null}
    </>
  )
}
