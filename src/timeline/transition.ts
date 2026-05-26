import type { ClipTransition, Project } from './project';
import { toFrameCount, toFrameOffset } from './time';

export type ResolvedTransition =
  | {
      kind: 'cut';
    }
  | {
      frameCount: number;
      kind: 'crossfade';
    };

export function resolveTransition(
  clips: Project['clips'],
  index: number,
  fps: number,
  projectId: string,
): ResolvedTransition {
  const clip = clips[index];

  if (clip === undefined) {
    throw new Error(`Clip is missing. project=${projectId}, index=${index}`);
  }

  const overlapFrameCount = resolveOverlapFrameCount(
    clips,
    index,
    fps,
    projectId,
  );

  if (overlapFrameCount <= 0) {
    if (clip.transition?.kind === 'crossfade') {
      throw new Error(
        `Clip crossfade requires overlap. project=${projectId}, clip=${clip.id}`,
      );
    }

    return { kind: 'cut' };
  }

  const transition = requireClipTransition(clip, projectId);

  if (transition.kind === 'cut') {
    throw new Error(
      `Clip transition kind "cut" cannot be used with overlap. project=${projectId}, clip=${clip.id}`,
    );
  }

  const transitionFrameCount = toFrameCount(transition.durationSeconds, fps);

  if (transitionFrameCount > overlapFrameCount) {
    throw new Error(
      `Clip crossfade exceeds overlap. project=${projectId}, clip=${clip.id}, overlapFrames=${overlapFrameCount}, crossfadeFrames=${transitionFrameCount}`,
    );
  }

  if (transitionFrameCount >= requireResolvedClipFrameCount(clip, projectId)) {
    throw new Error(
      `Clip crossfade must be shorter than the incoming clip. project=${projectId}, clip=${clip.id}, crossfadeFrames=${transitionFrameCount}`,
    );
  }

  return {
    frameCount: transitionFrameCount,
    kind: 'crossfade',
  };
}

export function validateTransitions(
  clips: Project['clips'],
  fps: number,
  projectId: string,
): void {
  clips.forEach((clip, index) => {
    if (index === 0) {
      return;
    }

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
    const clipStartFrame = toFrameOffset(clip.startSeconds, fps);

    const previousClipEndFrame =
      previousClipStartFrame +
      requireResolvedClipFrameCount(previousClip, projectId);
    const overlapFrameCount = previousClipEndFrame - clipStartFrame;
    const transition = clip.transition;

    if (overlapFrameCount > 0) {
      if (transition === undefined) {
        throw new Error(
          `Clip transition is required when clips overlap. project=${projectId}, clip=${clip.id}`,
        );
      }

      if (transition.kind === 'cut') {
        throw new Error(
          `Clip transition kind "cut" cannot be used with overlap. project=${projectId}, clip=${clip.id}`,
        );
      }

      const transitionFrameCount = toFrameCount(
        transition.durationSeconds,
        fps,
      );

      if (transitionFrameCount > overlapFrameCount) {
        throw new Error(
          `Clip crossfade exceeds overlap. project=${projectId}, clip=${clip.id}, overlapFrames=${overlapFrameCount}, crossfadeFrames=${transitionFrameCount}`,
        );
      }

      if (
        transitionFrameCount >= requireResolvedClipFrameCount(clip, projectId)
      ) {
        throw new Error(
          `Clip crossfade must be shorter than the incoming clip. project=${projectId}, clip=${clip.id}, crossfadeFrames=${transitionFrameCount}`,
        );
      }

      return;
    }

    if (transition?.kind === 'crossfade') {
      throw new Error(
        `Clip crossfade requires overlap. project=${projectId}, clip=${clip.id}`,
      );
    }
  });
}

function resolveOverlapFrameCount(
  clips: Project['clips'],
  index: number,
  fps: number,
  projectId: string,
): number {
  const clip = clips[index];
  const previousClip = clips[index - 1];

  if (clip === undefined) {
    throw new Error(`Clip is missing. project=${projectId}, index=${index}`);
  }

  if (previousClip === undefined) {
    return 0;
  }

  const previousClipEndFrame =
    toFrameOffset(previousClip.startSeconds, fps) +
    requireResolvedClipFrameCount(previousClip, projectId);
  const clipStartFrame = toFrameOffset(clip.startSeconds, fps);

  return previousClipEndFrame - clipStartFrame;
}

function requireClipTransition(
  clip: Project['clips'][number],
  projectId: string,
): ClipTransition {
  if (clip.transition !== undefined) {
    return clip.transition;
  }

  throw new Error(
    `Clip transition is required when clips overlap. project=${projectId}, clip=${clip.id}`,
  );
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
