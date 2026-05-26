import { parseMedia } from '@remotion/media-parser';
import type { CalculateMetadataFunction } from 'remotion';
import type { AudioClip, Project } from '../timeline/project';
import { toFrameCount, toFrameOffset } from '../timeline/time';
import { validateTransitions } from '../timeline/transition';

export const calculateMetadata: CalculateMetadataFunction<Project> = async ({
  props,
}) => {
  const fps = props.canvas.fps;

  // Step 1: resolve clip durations from container headers (parallel)
  const resolvedClips = await Promise.all(
    props.clips.map((clip) => resolveClipDuration(clip, fps, props.id)),
  );

  // Step 2: assign sequential startSeconds from actual durations
  const clips = assignSequentialStartTimes(resolvedClips, fps, props.id);

  validateTransitions(clips, fps, props.id);
  validateTextAndOverlayRanges(props, clips);

  const clipTimelineDuration = clips.reduce((max, clip) => {
    const clipEndFrame =
      toFrameOffset(clip.startSeconds, fps) +
      requireClipDuration(clip, props.id);
    return Math.max(max, clipEndFrame);
  }, 0);

  if (clipTimelineDuration < 1) {
    throw new Error(
      `Project ${props.id} resolved to zero duration. Check clip definitions.`,
    );
  }

  // Step 3: resolve audio durations (parallel)
  const audio = await Promise.all(
    props.audio.map((track) =>
      resolveAudioDuration(track, fps, clipTimelineDuration, props.id),
    ),
  );

  const audioTimelineDuration = audio.reduce((max, audioClip) => {
    const audioEndFrame =
      toFrameOffset(audioClip.startSeconds, fps) +
      toFrameCount(audioClip.durationSeconds, fps);
    return Math.max(max, audioEndFrame);
  }, 0);

  const subtitleTimelineDuration = props.subtitles.reduce((max, subtitle) => {
    const subtitleEndFrame =
      toFrameOffset(subtitle.startSeconds, fps) +
      toFrameCount(subtitle.durationSeconds, fps);
    return Math.max(max, subtitleEndFrame);
  }, 0);

  const overlayTimelineDuration = props.overlays.reduce((max, overlay) => {
    const overlayEndFrame =
      toFrameOffset(overlay.startSeconds, fps) +
      toFrameCount(overlay.durationSeconds, fps);
    return Math.max(max, overlayEndFrame);
  }, 0);

  const durationInFrames = Math.max(
    clipTimelineDuration,
    audioTimelineDuration,
    subtitleTimelineDuration,
    overlayTimelineDuration,
  );

  return {
    durationInFrames,
    props: {
      ...props,
      audio,
      clips,
    },
  };
};

function assignSequentialStartTimes(
  clips: Project['clips'],
  fps: number,
  projectId: string,
): Project['clips'] {
  let currentFrame = 0;

  return clips.map((clip, index) => {
    if (index > 0) {
      const prev = clips[index - 1];
      if (prev === undefined) {
        throw new Error(
          `Previous clip is missing. project=${projectId}, index=${index}`,
        );
      }
      const prevEndFrame =
        toFrameOffset(prev.startSeconds, fps) +
        requireClipDuration(prev, projectId);
      const transition = clip.transition;
      const crossfadeFrames =
        transition?.kind === 'crossfade'
          ? toFrameCount(transition.durationSeconds, fps)
          : 0;
      currentFrame = prevEndFrame - crossfadeFrames;
    }
    return { ...clip, startSeconds: currentFrame / fps };
  });
}

async function resolveClipDuration(
  clip: Project['clips'][number],
  fps: number,
  projectId: string,
): Promise<Project['clips'][number]> {
  const clipSrc = requireClipSrc(clip, projectId);
  const { durationInSeconds } = await parseMedia({
    acknowledgeRemotionLicense: true,
    fields: {
      durationInSeconds: true,
    },
    src: clipSrc,
  });

  if (durationInSeconds === null) {
    throw new Error(
      `Could not read duration from clip container header. project=${projectId}, clip=${clip.id}`,
    );
  }

  const sourceDurationInFrames = Math.max(
    1,
    Math.floor(durationInSeconds * fps),
  );
  const trimBeforeFrames = toFrameOffset(clip.trimBeforeSeconds ?? 0, fps);
  const trimAfterFrames =
    clip.trimAfterSeconds === undefined
      ? sourceDurationInFrames
      : toFrameOffset(clip.trimAfterSeconds, fps);

  if (trimBeforeFrames < 0) {
    throw new Error(
      `Clip trimBeforeSeconds must be >= 0. project=${projectId}, clip=${clip.id}`,
    );
  }

  if (
    clip.trimAfterSeconds !== undefined &&
    trimAfterFrames > sourceDurationInFrames
  ) {
    throw new Error(
      `Clip trimAfterSeconds exceeds source duration. project=${projectId}, clip=${clip.id}, trimAfterSeconds=${clip.trimAfterSeconds}, sourceDurationSeconds=${durationInSeconds}`,
    );
  }

  if (trimAfterFrames <= trimBeforeFrames) {
    throw new Error(
      `Clip trim window is invalid. project=${projectId}, clip=${clip.id}, trimBeforeFrames=${trimBeforeFrames}, trimAfterFrames=${trimAfterFrames}`,
    );
  }

  return {
    ...clip,
    frameCount: trimAfterFrames - trimBeforeFrames,
    sourceFrameCount: sourceDurationInFrames,
  };
}

async function resolveAudioDuration(
  audioClip: Project['audio'][number],
  fps: number,
  clipTimelineDuration: number,
  projectId: string,
): Promise<AudioClip> {
  const audioSrc = requireAudioSrc(audioClip, projectId);
  const { durationInSeconds } = await parseMedia({
    acknowledgeRemotionLicense: true,
    fields: {
      durationInSeconds: true,
    },
    src: audioSrc,
  });

  if (durationInSeconds === null) {
    throw new Error(
      `Could not read duration from audio container header. project=${projectId}, audio=${audioClip.id}`,
    );
  }

  const trimBefore = audioClip.trimBeforeSeconds;
  const trimAfter = audioClip.trimAfterSeconds ?? 0;

  if (
    audioClip.trimAfterSeconds !== undefined &&
    trimAfter > durationInSeconds
  ) {
    throw new Error(
      `Audio trimAfterSeconds exceeds source duration. project=${projectId}, audio=${audioClip.id}, trimAfterSeconds=${trimAfter}, sourceDurationSeconds=${durationInSeconds}`,
    );
  }

  let effectiveDurationSeconds: number;

  if (audioClip.loop === true && audioClip.trimAfterSeconds === undefined) {
    // Auto-extend looping track to the end of the clip timeline
    effectiveDurationSeconds =
      clipTimelineDuration / fps - audioClip.startSeconds;
  } else {
    effectiveDurationSeconds = durationInSeconds - trimBefore - trimAfter;
  }

  if (effectiveDurationSeconds <= 0) {
    throw new Error(
      `Audio effective duration must be positive. project=${projectId}, audio=${audioClip.id}`,
    );
  }

  return { ...audioClip, durationSeconds: effectiveDurationSeconds };
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

function requireAudioSrc(
  audioClip: Project['audio'][number],
  projectId: string,
): string {
  if (audioClip.src !== undefined) {
    return audioClip.src;
  }

  throw new Error(
    `Audio source path has not been resolved. project=${projectId}, audio=${audioClip.id}`,
  );
}

function validateTextAndOverlayRanges(
  project: Project,
  clips: Project['clips'],
): void {
  const clipTimelineDuration = clips.reduce((max, clip) => {
    const clipEndFrame =
      toFrameOffset(clip.startSeconds, project.canvas.fps) +
      requireClipDuration(clip, project.id);
    return Math.max(max, clipEndFrame);
  }, 0);

  project.subtitles.forEach((subtitle) => {
    const subtitleEndFrame =
      toFrameOffset(subtitle.startSeconds, project.canvas.fps) +
      toFrameCount(subtitle.durationSeconds, project.canvas.fps);

    if (subtitleEndFrame > clipTimelineDuration) {
      throw new Error(
        `Subtitle exceeds clip timeline duration. project=${project.id}, subtitle=${subtitle.id}`,
      );
    }
  });

  project.overlays.forEach((overlay) => {
    const overlayEndFrame =
      toFrameOffset(overlay.startSeconds, project.canvas.fps) +
      toFrameCount(overlay.durationSeconds, project.canvas.fps);

    if (overlayEndFrame > clipTimelineDuration) {
      throw new Error(
        `Overlay exceeds clip timeline duration. project=${project.id}, overlay=${overlay.id}`,
      );
    }
  });
}
