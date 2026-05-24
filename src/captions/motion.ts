import type { CSSProperties } from 'react';
import { interpolate } from 'remotion';

export const motionCatalog = {
  centerPop: (frame: number): CSSProperties => ({
    opacity: interpolate(frame, [0, 8], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
    transform: `translate(-50%, -50%) scale(${interpolate(
      frame,
      [0, 10],
      [0.84, 1],
      {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      },
    )})`,
  }),
  none: (): CSSProperties => ({}),
} as const;
