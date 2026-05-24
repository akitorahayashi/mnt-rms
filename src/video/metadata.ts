import { parseMedia } from '@remotion/media-parser';
import type { CalculateMetadataFunction } from 'remotion';
import type { Project } from './project';

export const calculateMetadata: CalculateMetadataFunction<Project> = async ({
  props,
}) => {
  const clips = await Promise.all(
    props.clips.map((clip) =>
      resolveClipDuration(clip, props.canvas.fps, props.id),
    ),
  );

  const timelineDuration = clips.reduce(
    (sum, clip) => sum + requireClipDuration(clip, props.id),
    0,
  );
  const durationInFrames = Math.min(
    props.canvas.durationInFrames,
    timelineDuration,
  );

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
  const trimBeforeInFrames = clip.trimBeforeInFrames ?? 0;
  const trimAfterInFrames = clip.trimAfterInFrames ?? sourceDurationInFrames;
  const boundedTrimAfterInFrames = Math.min(
    trimAfterInFrames,
    sourceDurationInFrames,
  );

  if (trimBeforeInFrames < 0) {
    throw new Error(
      `Clip trimBeforeInFrames must be >= 0. project=${projectId}, clip=${clip.id}`,
    );
  }

  if (boundedTrimAfterInFrames <= trimBeforeInFrames) {
    throw new Error(
      `Clip trim window is invalid. project=${projectId}, clip=${clip.id}, trimBefore=${trimBeforeInFrames}, trimAfter=${boundedTrimAfterInFrames}`,
    );
  }

  return {
    ...clip,
    durationInFrames: boundedTrimAfterInFrames - trimBeforeInFrames,
    sourceDurationInFrames,
  };
}

export function requireClipDuration(
  clip: Project['clips'][number],
  projectId: string,
): number {
  if (clip.durationInFrames !== undefined) {
    return clip.durationInFrames;
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
