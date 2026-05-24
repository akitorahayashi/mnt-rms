import type { Project } from './project';
import { toFrameCount, toFrameOffset } from './time';

export interface ClipTransition {
  durationSeconds: number;
  kind: 'crossfade';
}

export function resolveFadeInFrameCount(
  clip: Project['clips'][number],
  fps: number,
): number {
  if (clip.transition === undefined) {
    return 0;
  }

  return toFrameCount(clip.transition.durationSeconds, fps);
}

export function resolveFadeOutFrameCount(
  clips: Project['clips'],
  index: number,
  fps: number,
): number {
  const nextClip = clips[index + 1];

  if (nextClip?.transition === undefined) {
    return 0;
  }

  return toFrameCount(nextClip.transition.durationSeconds, fps);
}

export function validateTransitions(
  clips: Project['clips'],
  fps: number,
  projectId: string,
): void {
  clips.forEach((clip, index) => {
    const clipStartFrame = toFrameOffset(clip.startSeconds, fps);

    if (index > 0) {
      const previousClip = clips[index - 1];

      if (previousClip === undefined) {
        throw new Error(
          `Previous clip is missing. project=${projectId}, clip=${clip.id}`,
        );
      }

      const previousClipStartFrame = toFrameOffset(
        previousClip.startSeconds,
        fps,
      );

      if (clipStartFrame < previousClipStartFrame) {
        throw new Error(
          `Clip order must match startSeconds order. project=${projectId}, clip=${clip.id}`,
        );
      }
    }

    if (clip.transition === undefined) {
      return;
    }

    if (index === 0) {
      throw new Error(
        `Clip transition requires a previous clip. project=${projectId}, clip=${clip.id}`,
      );
    }

    const previousClip = clips[index - 1];

    if (previousClip === undefined) {
      throw new Error(
        `Previous clip is missing. project=${projectId}, clip=${clip.id}`,
      );
    }

    const previousClipEndFrame =
      toFrameOffset(previousClip.startSeconds, fps) +
      requireResolvedClipFrameCount(previousClip, projectId);
    const overlapFrames = previousClipEndFrame - clipStartFrame;
    const transitionFrameCount = toFrameCount(
      clip.transition.durationSeconds,
      fps,
    );

    if (overlapFrames < transitionFrameCount) {
      throw new Error(
        `Clip transition exceeds overlap. project=${projectId}, clip=${clip.id}, overlapFrames=${overlapFrames}, transitionFrames=${transitionFrameCount}`,
      );
    }
  });
}

function requireResolvedClipFrameCount(
  clip: Project['clips'][number],
  projectId: string,
): number {
  if (clip.frameCount !== undefined) {
    return clip.frameCount;
  }

  throw new Error(
    `Clip duration has not been resolved. project=${projectId}, clip=${clip.id}`,
  );
}
