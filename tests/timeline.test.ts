import { describe, expect, test } from 'bun:test';
import type { Project } from '../src/timeline/project';
import {
  resolveTransition,
  validateTransitions,
} from '../src/timeline/transition';

describe('timeline transitions', () => {
  test('uses explicit crossfade duration for overlap', () => {
    const clips = [
      clip({ frameCount: 240, id: 'first', startSeconds: 0 }),
      clip({
        frameCount: 240,
        id: 'second',
        startSeconds: 7,
        transition: { durationSeconds: 0.5, kind: 'crossfade' },
      }),
    ];

    expect(resolveTransition(clips, 1, 30, 'sample')).toEqual({
      frameCount: 15,
      kind: 'crossfade',
    });
  });

  test('requires transition when clips overlap', () => {
    const clips = [
      clip({ frameCount: 240, id: 'first', startSeconds: 0 }),
      clip({ frameCount: 240, id: 'second', startSeconds: 7 }),
    ];

    expect(() => validateTransitions(clips, 30, 'sample')).toThrow(
      'Clip transition is required when clips overlap',
    );
  });

  test('rejects crossfade duration that exceeds overlap', () => {
    const clips = [
      clip({ frameCount: 240, id: 'first', startSeconds: 0 }),
      clip({
        frameCount: 240,
        id: 'second',
        startSeconds: 7.8,
        transition: { durationSeconds: 1, kind: 'crossfade' },
      }),
    ];

    expect(() => validateTransitions(clips, 30, 'sample')).toThrow(
      'Clip crossfade exceeds overlap',
    );
  });

  test('resolveTransition fails fast for overlap + cut', () => {
    const clips = [
      clip({ frameCount: 240, id: 'first', startSeconds: 0 }),
      clip({
        frameCount: 240,
        id: 'second',
        startSeconds: 7,
        transition: { kind: 'cut' },
      }),
    ];

    expect(() => resolveTransition(clips, 1, 30, 'sample')).toThrow(
      'Clip transition kind "cut" cannot be used with overlap',
    );
  });

  test('allows gap between clips with no transition', () => {
    const clips = [
      clip({ frameCount: 240, id: 'first', startSeconds: 0 }),
      clip({ frameCount: 240, id: 'second', startSeconds: 9 }),
    ];

    // no error: gap is fine when startSeconds are auto-derived sequentially
    expect(() => validateTransitions(clips, 30, 'sample')).not.toThrow();
  });
});

function clip(input: {
  frameCount: number;
  id: string;
  startSeconds: number;
  transition?: Project['clips'][number]['transition'];
}): Project['clips'][number] {
  return {
    fit: 'cover',
    frameCount: input.frameCount,
    id: input.id,
    mediaPath: `media/${input.id}.mp4`,
    startSeconds: input.startSeconds,
    transition: input.transition,
    volume: 0,
  };
}
