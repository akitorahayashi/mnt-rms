import { parseMedia } from '@remotion/media-parser';
import type { CalculateMetadataFunction } from 'remotion';
import type { Project } from '../timeline/project';
import { toFrameCount, toFrameOffset } from '../timeline/time';
import { validateTransitions } from '../timeline/transition';

export const calculateMetadata: CalculateMetadataFunction<Project> = async ({
  props,
}) => {
  const clips = await Promise.all(
    props.clips.map((clip) =>
      resolveClipDuration(clip, props.canvas.fps, props.id),
    ),
  );

  validateTransitions(clips, props.canvas.fps, props.id);
  const timelineDuration = clips.reduce((max, clip) => {
    const clipEndFrame =
      toFrameOffset(clip.startSeconds, props.canvas.fps) +
      requireClipDuration(clip, props.id);

    return Math.max(max, clipEndFrame);
  }, 0);
  const maxDurationInFrames = toFrameCount(
    props.canvas.durationSeconds,
    props.canvas.fps,
  );
  const durationInFrames = Math.min(maxDurationInFrames, timelineDuration);

  if (durationInFrames < 1) {
    throw new Error(
      `Project ${props.id} resolved to zero duration. Check clip definitions.`,
    );
  }

  return {
    durationInFrames,
    props: {
      ...props,
      clips,
    },
  };
};

async function resolveClipDuration(
  clip: Project['clips'][number],
  fps: number,
  projectId: string,
): Promise<Project['clips'][number]> {
  const clipSrc = requireClipSrc(clip, projectId);
  const { slowDurationInSeconds } = await parseMedia({
    acknowledgeRemotionLicense: true,
    fields: {
      slowDurationInSeconds: true,
    },
    src: clipSrc,
  });

  const sourceDurationInFrames = Math.max(
    1,
    Math.floor(slowDurationInSeconds * fps),
  );
  const trimBeforeFrames = toFrameOffset(clip.trimBeforeSeconds ?? 0, fps);
  const trimAfterFrames =
    clip.trimAfterSeconds === undefined
      ? sourceDurationInFrames
      : toFrameOffset(clip.trimAfterSeconds, fps);
  const boundedTrimAfterFrames = Math.min(
    trimAfterFrames,
    sourceDurationInFrames,
  );

  if (trimBeforeFrames < 0) {
    throw new Error(
      `Clip trimBeforeSeconds must be >= 0. project=${projectId}, clip=${clip.id}`,
    );
  }

  if (boundedTrimAfterFrames <= trimBeforeFrames) {
    throw new Error(
      `Clip trim window is invalid. project=${projectId}, clip=${clip.id}, trimBeforeFrames=${trimBeforeFrames}, trimAfterFrames=${boundedTrimAfterFrames}`,
    );
  }

  return {
    ...clip,
    frameCount: boundedTrimAfterFrames - trimBeforeFrames,
    sourceFrameCount: sourceDurationInFrames,
  };
}

export function requireClipDuration(
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

function requireClipSrc(
  clip: Project['clips'][number],
  projectId: string,
): string {
  if (clip.src !== undefined) {
    return clip.src;
  }

  throw new Error(
    `Clip source path has not been resolved. project=${projectId}, clip=${clip.id}`,
  );
}
