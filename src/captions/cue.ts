import type { motionCatalog } from './motion';
import type { styleCatalog } from './style';

export type MotionName = keyof typeof motionCatalog;
export type StyleName = keyof typeof styleCatalog;

export interface Cue {
  durationSeconds: number;
  id: string;
  motionName?: MotionName;
  startSeconds: number;
  styleName: StyleName;
  text: string;
}
