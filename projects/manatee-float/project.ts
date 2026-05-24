import type { Spec } from '../../src/video/definition';

const project: Spec = {
  audio: {
    mediaPath: 'media/music/おならエンジン.mp3',
    trimAfter: 2700,
    trimBefore: 1800,
    volume: 0.28,
  },
  backgroundColor: '#020403',
  canvas: {
    durationInFrames: 900,
    fps: 30,
    height: 1920,
    width: 1080,
  },
  captions: [
    {
      durationInFrames: 72,
      from: 24,
      id: 'hook',
      motionName: 'centerPop',
      styleName: 'centerHeadline',
      text: 'マナティ、浮き方がゆるすぎる',
    },
    {
      durationInFrames: 78,
      from: 180,
      id: 'gas-engine',
      motionName: 'centerPop',
      styleName: 'centerHeadline',
      text: '今日のBGMは、おならエンジン',
    },
    {
      durationInFrames: 84,
      from: 390,
      id: 'no-gravity',
      motionName: 'centerPop',
      styleName: 'centerHeadline',
      text: '水中だけ、ほぼ無重力',
    },
    {
      durationInFrames: 90,
      from: 660,
      id: 'ending',
      motionName: 'centerPop',
      styleName: 'centerHeadline',
      text: 'この丸さで、ちゃんと野生',
    },
  ],
  clips: [
    {
      fit: 'cover',
      id: 'still-in-water',
      mediaPath: 'media/pool/vertical/01_still_in_water_202605162110.mp4',
      volume: 0,
    },
    {
      fit: 'cover',
      id: 'slowly-rises-surface',
      mediaPath: 'media/pool/vertical/02_slowly_rises_surface_202605162110.mp4',
      volume: 0,
    },
    {
      fit: 'cover',
      id: 'circles-water',
      mediaPath:
        'media/pool/vertical/03_circles_water_avoiding_o…_202605162110.mp4',
      volume: 0,
    },
    {
      fit: 'cover',
      id: 'floats-in-clear-spring',
      mediaPath:
        'media/pool/vertical/04_floats_in_clear_spring_202605162111.mp4',
      volume: 0,
    },
  ],
  id: 'manatee-float',
  outputFileName: 'manatee-float.mp4',
};

export default project;
