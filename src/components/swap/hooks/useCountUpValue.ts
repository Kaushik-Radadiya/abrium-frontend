'use client';

import { useEffect, useRef, useState } from 'react';

type Options = {
  enabled?: boolean;
  durationMs?: number;
  maxDecimals?: number;
};

export function useCountUpValue(
  value: string,
  { enabled = true, durationMs = 400, maxDecimals = 6 }: Options = {},
) {
  const [animatedValue, setAnimatedValue] = useState(value || '0.0');
  const animationFrameRef = useRef<number | null>(null);
  const lastValueRef = useRef(0);

  useEffect(() => {
    const targetText = value || '0.0';
    const target = Number(targetText);
    const commitValue = (nextValue: string) => {
      animationFrameRef.current = requestAnimationFrame(() => {
        setAnimatedValue(nextValue);
        animationFrameRef.current = null;
      });
    };

    if (!enabled || !Number.isFinite(target)) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      lastValueRef.current = Number.isFinite(target) ? target : 0;
      commitValue(targetText);
      return;
    }

    const start = lastValueRef.current;
    if (Math.abs(target - start) < 1e-12) {
      lastValueRef.current = target;
      commitValue(targetText);
      return;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    const decimalPlaces = Math.min(
      targetText.split('.')[1]?.length ?? 0,
      maxDecimals,
    );
    const startTime = performance.now();

    const frame = (time: number) => {
      const progress = Math.min((time - startTime) / durationMs, 1);
      const easedProgress = 1 - (1 - progress) * (1 - progress);
      const current = start + (target - start) * easedProgress;

      if (progress >= 1) {
        lastValueRef.current = target;
        setAnimatedValue(targetText);
        animationFrameRef.current = null;
        return;
      }

      lastValueRef.current = current;
      const nextValue =
        decimalPlaces > 0
          ? current.toFixed(decimalPlaces).replace(/\.?0+$/, '')
          : current.toFixed(0);
      setAnimatedValue(nextValue || '0');
      animationFrameRef.current = requestAnimationFrame(frame);
    };

    animationFrameRef.current = requestAnimationFrame(frame);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [durationMs, enabled, maxDecimals, value]);

  return animatedValue;
}
