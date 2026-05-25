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
  validateTextAndOverlayRanges(props);
  const timelineDuration = clips.reduce((max, clip) => {
    const clipEndFrame =
      toFrameOffset(clip.startSeconds, props.canvas.fps) +
      requireClipDuration(clip, props.id);

    return Math.max(max, clipEndFrame);
  }, 0);
  const subtitleTimelineDuration = props.subtitles.reduce((max, subtitle) => {
    const subtitleEndFrame =
      toFrameOffset(subtitle.startSeconds, props.canvas.fps) +
      toFrameCount(subtitle.durationSeconds, props.canvas.fps);

    return Math.max(max, subtitleEndFrame);
  }, 0);
  const overlayTimelineDuration = props.overlays.reduce((max, overlay) => {
    const overlayEndFrame =
      toFrameOffset(overlay.startSeconds, props.canvas.fps) +
      toFrameCount(overlay.durationSeconds, props.canvas.fps);

    return Math.max(max, overlayEndFrame);
  }, 0);
  const audioTimelineDuration = props.audio.reduce((max, audioClip) => {
    const audioEndFrame =
      toFrameOffset(audioClip.startSeconds, props.canvas.fps) +
      toFrameCount(audioClip.durationSeconds, props.canvas.fps);

    return Math.max(max, audioEndFrame);
  }, 0);
  const contentDuration = Math.max(
    timelineDuration,
    subtitleTimelineDuration,
    overlayTimelineDuration,
    audioTimelineDuration,
  );
  const maxDurationInFrames = toFrameCount(
    props.canvas.durationSeconds,
    props.canvas.fps,
  );
  const durationInFrames = Math.min(maxDurationInFrames, contentDuration);

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

function validateTextAndOverlayRanges(project: Project): void {
  const maxDurationInFrames = toFrameCount(
    project.canvas.durationSeconds,
    project.canvas.fps,
  );

  project.subtitles.forEach((subtitle) => {
    const subtitleEndFrame =
      toFrameOffset(subtitle.startSeconds, project.canvas.fps) +
      toFrameCount(subtitle.durationSeconds, project.canvas.fps);

    if (subtitleEndFrame > maxDurationInFrames) {
      throw new Error(
        `Subtitle exceeds canvas duration. project=${project.id}, subtitle=${subtitle.id}`,
      );
    }
  });

  project.overlays.forEach((overlay) => {
    const overlayEndFrame =
      toFrameOffset(overlay.startSeconds, project.canvas.fps) +
      toFrameCount(overlay.durationSeconds, project.canvas.fps);

    if (overlayEndFrame > maxDurationInFrames) {
      throw new Error(
        `Overlay exceeds canvas duration. project=${project.id}, overlay=${overlay.id}`,
      );
    }
  });
}
