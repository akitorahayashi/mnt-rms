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

export type AudioLaneName = 'effects' | 'music' | 'narration';

export const audioLaneOrder: AudioLaneName[] = [
  'music',
  'narration',
  'effects',
];

export interface AudioClip {
  durationSeconds: number;
  id: string;
  loop?: boolean;
  mediaPath: string;
  startSeconds: number;
  src?: string;
  trimAfterSeconds?: number;
  trimBeforeSeconds: number;
  volume: number;
}

export type AuthoredAudioClip = Omit<AudioClip, 'durationSeconds' | 'src'>;

export interface AudioLanes {
  effects: AuthoredAudioClip[];
  music: AuthoredAudioClip[];
  narration: AuthoredAudioClip[];
}

export function flattenAudioLanes(audio: AudioLanes): AudioClip[] {
  return audioLaneOrder.flatMap((laneName) => audio[laneName]) as AudioClip[];
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

export interface Clip {
  fit: 'contain' | 'cover';
  frameCount?: number;
  id: string;
  mediaPath: string;
  sourceFrameCount?: number;
  startSeconds: number;
  src?: string;
  transition?: ClipTransition;
  trimAfterSeconds?: number;
  trimBeforeSeconds?: number;
  volume: number;
}

export type AuthoredClip = Omit<
  Clip,
  'frameCount' | 'sourceFrameCount' | 'src' | 'startSeconds'
>;

export interface ProjectDefinition extends Record<string, unknown> {
  audio: AudioLanes;
  backgroundColor: string;
  canvas: {
    fps: number;
    height: number;
    width: number;
  };
  overlays: Overlay[];
  subtitleDefaults: SubtitleDefaults;
  subtitles: Subtitle[];
  clips: AuthoredClip[];
  id: string;
  outputFileName: string;
}

export interface Project extends Record<string, unknown> {
  audio: AudioClip[];
  backgroundColor: string;
  canvas: {
    fps: number;
    height: number;
    width: number;
  };
  overlays: Overlay[];
  subtitleDefaults: SubtitleDefaults;
  subtitles: Subtitle[];
  clips: Clip[];
  id: string;
  outputFileName: string;
}
