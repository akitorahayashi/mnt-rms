import {
  AbsoluteFill,
  Html5Audio,
  OffthreadVideo,
  Sequence,
  Series,
} from 'remotion';
import { CaptionLayer } from '../captions/layer';
import type { ResolvedSpec } from './definition';
import { requireClipDuration } from './metadata';

export function Composition({
  audio,
  backgroundColor,
  captions,
  clips,
  id,
}: ResolvedSpec) {
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
              src={clip.src}
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
        src={audio.src}
        trimAfter={audio.trimAfter}
        trimBefore={audio.trimBefore}
        volume={audio.volume}
      />
    </AbsoluteFill>
  );
}
