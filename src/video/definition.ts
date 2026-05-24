import type { motionCatalog } from '../captions/motion';
import type { styleCatalog } from '../captions/style';

export interface VideoCanvas {
  durationInFrames: number;
  fps: number;
  height: number;
  width: number;
}

export interface MediaClipDefinition {
  fit: 'contain' | 'cover';
  id: string;
  mediaPath: string;
  trimAfterInFrames?: number;
  trimBeforeInFrames?: number;
  volume?: number;
}

export type CaptionMotionName = keyof typeof motionCatalog;
export type CaptionStyleName = keyof typeof styleCatalog;

export interface CaptionCue {
  durationInFrames: number;
  from: number;
  id: string;
  motionName?: CaptionMotionName;
  styleName: CaptionStyleName;
  text: string;
}

export interface AudioTrackDefinition {
  mediaPath: string;
  trimAfter: number;
  trimBefore: number;
  volume: number;
}

export interface Spec extends Record<string, unknown> {
  audio: AudioTrackDefinition;
  backgroundColor: string;
  canvas: VideoCanvas;
  captions: CaptionCue[];
  clips: MediaClipDefinition[];
  id: string;
  outputFileName: string;
}

export interface ResolvedMediaClip extends MediaClipDefinition {
  durationInFrames?: number;
  sourceDurationInFrames?: number;
  src: string;
}

export interface ResolvedAudioTrack extends AudioTrackDefinition {
  src: string;
}

export interface ResolvedSpec extends Record<string, unknown> {
  audio: ResolvedAudioTrack;
  backgroundColor: string;
  canvas: VideoCanvas;
  captions: CaptionCue[];
  clips: ResolvedMediaClip[];
  id: string;
  outputFileName: string;
}
