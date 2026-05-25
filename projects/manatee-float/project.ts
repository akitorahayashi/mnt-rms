import type { Project } from '../../src/timeline/project';

const project: Project = {
  audio: [
    {
      durationSeconds: 30,
      id: 'main-bgm',
      loop: true,
      mediaPath: 'media/music/おならエンジン.mp3',
      startSeconds: 0,
      trimAfterSeconds: 90,
      trimBeforeSeconds: 60,
      volume: 0.28,
    },
  ],
  backgroundColor: '#020403',
  canvas: {
    durationSeconds: 30,
    fps: 30,
    height: 1920,
    width: 1080,
  },
  overlays: [],
  subtitleDefaults: {
    motionName: 'centerPop',
    styleName: 'centerHeadline',
    x: 540,
    y: 960,
  },
  subtitles: [
    {
      durationSeconds: 7.2,
      id: 'hook',
      startSeconds: 0,
      text: 'マナティ、浮き方がゆるすぎる',
    },
    {
      durationSeconds: 6.8,
      id: 'gas-engine',
      startSeconds: 7.2,
      text: '今日のBGMは、おならエンジン',
    },
    {
      durationSeconds: 6.8,
      id: 'no-gravity',
      startSeconds: 14,
      text: '水中だけ、ほぼ無重力',
    },
    {
      durationSeconds: 9,
      id: 'ending',
      startSeconds: 21,
      text: 'この丸さで、ちゃんと野生',
    },
  ],
  clips: [
    {
      fit: 'cover',
      id: 'still-in-water',
      mediaPath: 'media/pool/vertical/01_still_in_water_202605162110.mp4',
      startSeconds: 0,
      volume: 0,
    },
    {
      fit: 'cover',
      id: 'slowly-rises-surface',
      mediaPath: 'media/pool/vertical/02_slowly_rises_surface_202605162110.mp4',
      startSeconds: 7,
      transition: {
        durationSeconds: 0.8,
        kind: 'crossfade',
      },
      volume: 0,
    },
    {
      fit: 'cover',
      id: 'circles-water',
      mediaPath:
        'media/pool/vertical/03_circles_water_avoiding_o…_202605162110.mp4',
      startSeconds: 14,
      transition: {
        durationSeconds: 0.8,
        kind: 'crossfade',
      },
      volume: 0,
    },
    {
      fit: 'cover',
      id: 'floats-in-clear-spring',
      mediaPath:
        'media/pool/vertical/04_floats_in_clear_spring_202605162111.mp4',
      startSeconds: 21,
      transition: {
        durationSeconds: 0.8,
        kind: 'crossfade',
      },
      volume: 0,
    },
  ],
  id: 'manatee-float',
  outputFileName: 'manatee-float.mp4',
};

export default project;
