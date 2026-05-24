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
import { resolveTransition } from '../timeline/transition';
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
            transition={resolveTransition(clips, index, fps, id)}
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
  transition,
  fps,
  projectId,
}: {
  clip: Project['clips'][number];
  transition: ReturnType<typeof resolveTransition>;
  fps: number;
  projectId: string;
}) {
  const frame = useCurrentFrame();
  const opacity =
    transition.kind === 'cut'
      ? 1
      : interpolate(frame, [0, transition.frameCount], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

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
        opacity,
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
