import { parseMedia } from '@remotion/media-parser';
import type { CalculateMetadataFunction } from 'remotion';
import type { ResolvedMediaClip, ResolvedSpec } from './definition';

export const calculateMetadata: CalculateMetadataFunction<
  ResolvedSpec
> = async ({ props }) => {
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
  clip: ResolvedMediaClip,
  fps: number,
  projectId: string,
): Promise<ResolvedMediaClip> {
  const { slowDurationInSeconds } = await parseMedia({
    acknowledgeRemotionLicense: true,
    fields: {
      slowDurationInSeconds: true,
    },
    src: clip.src,
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
  clip: ResolvedMediaClip,
  projectId: string,
): number {
  if (clip.durationInFrames !== undefined) {
    return clip.durationInFrames;
  }

  throw new Error(
    `Clip duration has not been resolved. project=${projectId}, clip=${clip.id}`,
  );
}
