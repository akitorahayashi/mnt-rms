import type { MotionName, StyleName } from '../captions/cue';

export type ClipTransition =
  | {
      kind: 'cut';
    }
  | {
      durationSeconds: number;
      kind: 'crossfade';
    };

export interface SubtitleDefaults {
  motionName: MotionName;
  styleName: StyleName;
  x: number;
  y: number;
}

export interface Subtitle {
  durationSeconds: number;
  id: string;
  motionName?: MotionName;
  startSeconds: number;
  styleName?: StyleName;
  text: string;
  x?: number;
  y?: number;
}

export type Overlay =
  | {
      durationSeconds: number;
      id: string;
      kind: 'image';
      layer?: number;
      mediaPath: string;
      opacity?: number;
      src?: string;
      startSeconds: number;
      width: number;
      x: number;
      y: number;
      fit?: 'contain' | 'cover';
      height: number;
    }
  | {
      durationSeconds: number;
      id: string;
      kind: 'text';
      layer?: number;
      motionName?: MotionName;
      startSeconds: number;
      styleName?: StyleName;
      text: string;
      x: number;
      y: number;
    };

export interface Project extends Record<string, unknown> {
  audio: Array<{
    durationSeconds: number;
    id: string;
    loop?: boolean;
    mediaPath: string;
    startSeconds: number;
    src?: string;
    trimAfterSeconds?: number;
    trimBeforeSeconds: number;
    volume: number;
  }>;
  backgroundColor: string;
  canvas: {
    durationSeconds: number;
    fps: number;
    height: number;
    width: number;
  };
  overlays: Overlay[];
  subtitleDefaults: SubtitleDefaults;
  subtitles: Subtitle[];
  clips: Array<{
    frameCount?: number;
    fit: 'contain' | 'cover';
    id: string;
    mediaPath: string;
    sourceFrameCount?: number;
    startSeconds: number;
    src?: string;
    transition?: ClipTransition;
    trimAfterSeconds?: number;
    trimBeforeSeconds?: number;
    volume: number;
  }>;
  id: string;
  outputFileName: string;
}
