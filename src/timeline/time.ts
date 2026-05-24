export function toFrameCount(seconds: number, fps: number): number {
  return Math.max(1, Math.round(seconds * fps));
}

export function toFrameOffset(seconds: number, fps: number): number {
  return Math.max(0, Math.round(seconds * fps));
}
