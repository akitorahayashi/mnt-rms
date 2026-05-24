import { useCurrentFrame } from 'remotion';
import type { Cue } from './cue';
import { motionCatalog } from './motion';
import { styleCatalog } from './style';

export function CaptionLayer({ cue }: { cue: Cue }) {
  const frame = useCurrentFrame();
  const style = styleCatalog[cue.styleName];
  const motionFactory = motionCatalog[cue.motionName];

  if (motionFactory === undefined) {
    throw new Error(`Unknown caption motionName: ${cue.motionName}`);
  }

  const motion = motionFactory(frame);

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
