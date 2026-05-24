import type { Cue } from '../captions/cue';

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
  captions: Cue[];
  clips: Array<{
    frameCount?: number;
    fit: 'contain' | 'cover';
    id: string;
    mediaPath: string;
    sourceFrameCount?: number;
    src?: string;
    trimAfterSeconds?: number;
    trimBeforeSeconds?: number;
    volume?: number;
  }>;
  id: string;
  outputFileName: string;
}
