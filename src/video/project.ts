import type { Cue } from '../captions/cue';

export interface Project extends Record<string, unknown> {
  audio: {
    mediaPath: string;
    src?: string;
    trimAfter: number;
    trimBefore: number;
    volume: number;
  };
  backgroundColor: string;
  canvas: {
    durationInFrames: number;
    fps: number;
    height: number;
    width: number;
  };
  captions: Cue[];
  clips: Array<{
    durationInFrames?: number;
    fit: 'contain' | 'cover';
    id: string;
    mediaPath: string;
    sourceDurationInFrames?: number;
    src?: string;
    trimAfterInFrames?: number;
    trimBeforeInFrames?: number;
    volume?: number;
  }>;
  id: string;
  outputFileName: string;
}
