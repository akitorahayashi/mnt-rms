import { useCurrentFrame } from 'remotion';
import type { Cue } from './cue';
import { motionCatalog } from './motion';
import { styleCatalog } from './style';

export function CaptionLayer({ cue }: { cue: Cue }) {
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
