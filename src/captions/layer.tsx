import { useCurrentFrame } from 'remotion';
import type { CaptionCue } from '../video/definition';
import { motionCatalog } from './motion';
import { styleCatalog } from './style';

export function CaptionLayer({ cue }: { cue: CaptionCue }) {
  const frame = useCurrentFrame();
  const style = styleCatalog[cue.styleName];
  const motion = motionCatalog[cue.motionName ?? 'none'](frame);

  return (
    <div
      style={{
        ...style,
        ...motion,
      }}
    >
      {cue.text}
    </div>
  );
}
