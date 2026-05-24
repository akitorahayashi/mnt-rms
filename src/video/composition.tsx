import {
  AbsoluteFill,
  Html5Audio,
  OffthreadVideo,
  Sequence,
  Series,
} from 'remotion';
import { CaptionLayer } from '../captions/layer';
import { requireClipDuration } from './metadata';
import type { Project } from './project';
import { toFrameCount, toFrameOffset } from './time';

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
      <Series>
        {clips.map((clip) => (
          <Series.Sequence
            key={clip.id}
            durationInFrames={requireClipDuration(clip, id)}
          >
            <OffthreadVideo
              endAt={
                clip.trimAfterSeconds === undefined
                  ? undefined
                  : toFrameOffset(clip.trimAfterSeconds, fps)
              }
              muted={clip.volume === 0}
              startFrom={toFrameOffset(clip.trimBeforeSeconds ?? 0, fps)}
              src={requireClipSrc(clip, id)}
              volume={clip.volume}
              style={{
                height: '100%',
                objectFit: clip.fit,
                width: '100%',
              }}
            />
          </Series.Sequence>
        ))}
      </Series>
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
