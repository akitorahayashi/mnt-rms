import type { motionCatalog } from './motion';
import type { styleCatalog } from './style';

export type MotionName = keyof typeof motionCatalog;
export type StyleName = keyof typeof styleCatalog;

export interface Cue {
  durationInFrames: number;
  from: number;
  id: string;
  motionName?: MotionName;
  styleName: StyleName;
  text: string;
}
