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

export function Composition({
  audio,
  backgroundColor,
  captions,
  clips,
  id,
}: Project) {
  return (
    <AbsoluteFill style={{ backgroundColor }}>
      <Series>
        {clips.map((clip) => (
          <Series.Sequence
            key={clip.id}
            durationInFrames={requireClipDuration(clip, id)}
          >
            <OffthreadVideo
              endAt={clip.trimAfterInFrames}
              muted={clip.volume === 0}
              startFrom={clip.trimBeforeInFrames}
              src={requireClipSrc(clip, id)}
              volume={clip.volume ?? 1}
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
          from={cue.from}
          durationInFrames={cue.durationInFrames}
        >
          <CaptionLayer cue={cue} />
        </Sequence>
      ))}
      <Html5Audio
        src={requireAudioSrc(audio, id)}
        trimAfter={audio.trimAfter}
        trimBefore={audio.trimBefore}
        volume={audio.volume}
      />
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

function requireAudioSrc(audio: Project['audio'], projectId: string): string {
  if (audio.src !== undefined) {
    return audio.src;
  }

  throw new Error(
    `Audio source path has not been resolved. project=${projectId}`,
  );
}
