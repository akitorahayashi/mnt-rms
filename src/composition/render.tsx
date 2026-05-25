import {
  AbsoluteFill,
  Html5Audio,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  useCurrentFrame,
} from 'remotion';
import { TextLayer } from '../captions/layer';
import type { Project } from '../timeline/project';
import { toFrameCount, toFrameOffset } from '../timeline/time';
import { resolveTransition } from '../timeline/transition';
import { requireClipDuration } from './metadata';

export function Composition({
  audio,
  backgroundColor,
  canvas,
  clips,
  id,
  overlays,
  subtitleDefaults,
  subtitles,
}: Project) {
  const fps = canvas.fps;
  const orderedOverlays = [...overlays].sort(
    (a, b) => (a.layer ?? 0) - (b.layer ?? 0),
  );

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
      {subtitles.map((subtitle) => (
        <Sequence
          key={subtitle.id}
          from={toFrameOffset(subtitle.startSeconds, fps)}
          durationInFrames={toFrameCount(subtitle.durationSeconds, fps)}
        >
          <TextLayer
            spec={{
              motionName: subtitle.motionName ?? subtitleDefaults.motionName,
              styleName: subtitle.styleName ?? subtitleDefaults.styleName,
              text: subtitle.text,
              x: subtitle.x ?? subtitleDefaults.x,
              y: subtitle.y ?? subtitleDefaults.y,
            }}
          />
        </Sequence>
      ))}
      {orderedOverlays.map((overlay) => (
        <Sequence
          key={overlay.id}
          from={toFrameOffset(overlay.startSeconds, fps)}
          durationInFrames={toFrameCount(overlay.durationSeconds, fps)}
        >
          {overlay.kind === 'text' ? (
            <TextLayer
              spec={{
                motionName: overlay.motionName ?? subtitleDefaults.motionName,
                styleName: overlay.styleName ?? subtitleDefaults.styleName,
                text: overlay.text,
                x: overlay.x,
                y: overlay.y,
              }}
            />
          ) : (
            <Img
              src={requireOverlaySrc(overlay, id)}
              style={{
                height: overlay.height,
                left: overlay.x,
                objectFit: overlay.fit ?? 'contain',
                opacity: overlay.opacity ?? 1,
                position: 'absolute',
                top: overlay.y,
                width: overlay.width,
              }}
            />
          )}
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

function requireOverlaySrc(
  overlay: Extract<Project['overlays'][number], { kind: 'image' }>,
  projectId: string,
): string {
  if (overlay.src !== undefined) {
    return overlay.src;
  }

  throw new Error(
    `Overlay source path has not been resolved. project=${projectId}, overlay=${overlay.id}`,
  );
}
