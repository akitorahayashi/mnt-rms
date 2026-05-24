import {
  AbsoluteFill,
  Html5Audio,
  interpolate,
  OffthreadVideo,
  Sequence,
  useCurrentFrame,
} from 'remotion';
import { CaptionLayer } from '../captions/layer';
import type { Project } from '../timeline/project';
import { toFrameCount, toFrameOffset } from '../timeline/time';
import {
  resolveFadeInFrameCount,
  resolveFadeOutFrameCount,
} from '../timeline/transition';
import { requireClipDuration } from './metadata';

export function Composition({
  audio,
  backgroundColor,
  canvas,
  captions,
  clips,
  id,
}: Project) {
  const fps = canvas.fps;

  return (
    <AbsoluteFill style={{ backgroundColor }}>
      {clips.map((clip, index) => (
        <Sequence
          key={clip.id}
          from={toFrameOffset(clip.startSeconds, fps)}
          durationInFrames={requireClipDuration(clip, id)}
        >
          <ClipLayer
            clip={clip}
            clipFrameCount={requireClipDuration(clip, id)}
            fadeInFrameCount={resolveFadeInFrameCount(clip, fps)}
            fadeOutFrameCount={resolveFadeOutFrameCount(clips, index, fps)}
            projectId={id}
            fps={fps}
          />
        </Sequence>
      ))}
      {captions.map((cue) => (
        <Sequence
          key={cue.id}
          from={toFrameOffset(cue.startSeconds, fps)}
          durationInFrames={toFrameCount(cue.durationSeconds, fps)}
        >
          <CaptionLayer cue={cue} />
        </Sequence>
      ))}
      {audio.map((audioClip) => (
        <Sequence
          key={audioClip.id}
          from={toFrameOffset(audioClip.startSeconds, fps)}
          durationInFrames={toFrameCount(audioClip.durationSeconds, fps)}
        >
          <Html5Audio
            src={requireAudioSrc(audioClip, id)}
            trimAfter={
              audioClip.trimAfterSeconds === undefined
                ? undefined
                : toFrameOffset(audioClip.trimAfterSeconds, fps)
            }
            trimBefore={toFrameOffset(audioClip.trimBeforeSeconds, fps)}
            volume={audioClip.volume}
            loop={audioClip.loop ?? false}
          />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
}

function ClipLayer({
  clip,
  clipFrameCount,
  fadeInFrameCount,
  fadeOutFrameCount,
  fps,
  projectId,
}: {
  clip: Project['clips'][number];
  clipFrameCount: number;
  fadeInFrameCount: number;
  fadeOutFrameCount: number;
  fps: number;
  projectId: string;
}) {
  const frame = useCurrentFrame();
  const fadeInOpacity =
    fadeInFrameCount === 0
      ? 1
      : interpolate(frame, [0, fadeInFrameCount], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
  const fadeOutOpacity =
    fadeOutFrameCount === 0
      ? 1
      : interpolate(
          frame,
          [clipFrameCount - fadeOutFrameCount, clipFrameCount],
          [1, 0],
          {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          },
        );

  return (
    <OffthreadVideo
      endAt={
        clip.trimAfterSeconds === undefined
          ? undefined
          : toFrameOffset(clip.trimAfterSeconds, fps)
      }
      muted={clip.volume === 0}
      startFrom={toFrameOffset(clip.trimBeforeSeconds ?? 0, fps)}
      src={requireClipSrc(clip, projectId)}
      volume={clip.volume}
      style={{
        height: '100%',
        objectFit: clip.fit,
        opacity: Math.min(fadeInOpacity, fadeOutOpacity),
        width: '100%',
      }}
    />
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
