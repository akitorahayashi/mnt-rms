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
  captions: [
    {
      durationSeconds: 2.4,
      id: 'hook',
      motionName: 'centerPop',
      startSeconds: 0.8,
      styleName: 'centerHeadline',
      text: 'マナティ、浮き方がゆるすぎる',
    },
    {
      durationSeconds: 2.6,
      id: 'gas-engine',
      motionName: 'centerPop',
      startSeconds: 6,
      styleName: 'centerHeadline',
      text: '今日のBGMは、おならエンジン',
    },
    {
      durationSeconds: 2.8,
      id: 'no-gravity',
      motionName: 'centerPop',
      startSeconds: 13,
      styleName: 'centerHeadline',
      text: '水中だけ、ほぼ無重力',
    },
    {
      durationSeconds: 3,
      id: 'ending',
      motionName: 'centerPop',
      startSeconds: 22,
      styleName: 'centerHeadline',
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
      startSeconds: 22,
      volume: 0,
    },
  ],
  id: 'manatee-float',
  outputFileName: 'manatee-float.mp4',
};

export default project;
