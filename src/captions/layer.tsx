import { useCurrentFrame } from 'remotion';
import type { MotionName, StyleName } from './cue';
import { motionCatalog } from './motion';
import { styleCatalog } from './style';

export interface TextLayerSpec {
  motionName: MotionName;
  styleName: StyleName;
  text: string;
  x: number;
  y: number;
}

export function TextLayer({ spec }: { spec: TextLayerSpec }) {
  const frame = useCurrentFrame();
  const style = styleCatalog[spec.styleName];
  const motionFactory = motionCatalog[spec.motionName];

  if (motionFactory === undefined) {
    throw new Error(`Unknown caption motionName: ${spec.motionName}`);
  }

  const motion = motionFactory(frame);

  return (
    <div
      style={{
        ...motion,
        ...style,
        left: spec.x,
        position: 'absolute',
        top: spec.y,
      }}
    >
      {spec.text}
    </div>
  );
}
