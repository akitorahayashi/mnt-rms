import type { ProjectDefinition } from '../../src/timeline/project';

const project: ProjectDefinition = {
  audio: {
    effects: [],
    music: [
      {
        id: 'bgm',
        loop: true,
        mediaPath: 'media/bgm/ちょっと楽しい.mp3',
        startSeconds: 0,
        trimBeforeSeconds: 0,
        volume: 0.25,
      },
    ],
    narration: [
      {
        id: 'narration-01',
        mediaPath: 'media/audio/01_この丸々としていて、.mp3',
        startSeconds: 0,
        trimBeforeSeconds: 0,
        volume: 1.0,
      },
      {
        id: 'narration-02',
        mediaPath: 'media/audio/02_体長は約3メートル、.mp3',
        startSeconds: 15,
        trimBeforeSeconds: 0,
        volume: 1.0,
      },
      {
        id: 'narration-03',
        mediaPath: 'media/audio/03_特に衝撃的なのが、そ.mp3',
        startSeconds: 30,
        trimBeforeSeconds: 0,
        volume: 1.0,
      },
      {
        id: 'narration-04',
        mediaPath: 'media/audio/04_まるで最新鋭の潜水艦.mp3',
        startSeconds: 45,
        trimBeforeSeconds: 0,
        volume: 1.0,
      },
      {
        id: 'narration-05',
        mediaPath: 'media/audio/05_ところが、この完璧す.mp3',
        startSeconds: 60,
        trimBeforeSeconds: 0,
        volume: 1.0,
      },
      {
        id: 'narration-06',
        mediaPath: 'media/audio/06_まず、泳いでいる間は.mp3',
        startSeconds: 75,
        trimBeforeSeconds: 0,
        volume: 1.0,
      },
      {
        id: 'narration-07',
        mediaPath: 'media/audio/07_過去には、おなかがパ.mp3',
        startSeconds: 90,
        trimBeforeSeconds: 0,
        volume: 1.0,
      },
      {
        id: 'narration-08',
        mediaPath: 'media/audio/08_それが、究極の癒やし.mp3',
        startSeconds: 105,
        trimBeforeSeconds: 0,
        volume: 1.0,
      },
    ],
  },
  backgroundColor: '#020403',
  canvas: {
    fps: 30,
    height: 1080,
    width: 1920,
  },
  overlays: [],
  subtitleDefaults: {
    motionName: 'centerPop',
    styleName: 'centerHeadline',
    x: 960,
    y: 540,
  },
  subtitles: [],
  clips: [
    {
      fit: 'cover',
      id: 'scene-01',
      mediaPath: 'media/movies/01_manatee_intro.mp4',
      volume: 0,
    },
    {
      fit: 'cover',
      id: 'scene-02',
      mediaPath: 'media/movies/02_massive_herbivory.mp4',
      volume: 0,
    },
    {
      fit: 'cover',
      id: 'scene-03',
      mediaPath: 'media/movies/03_precise_buoyancy_control.mp4',
      volume: 0,
    },
    {
      fit: 'cover',
      id: 'scene-04',
      mediaPath: 'media/movies/04_perfect_underwater_motion.mp4',
      volume: 0,
    },
    {
      fit: 'cover',
      id: 'scene-05',
      mediaPath: 'media/movies/05_fart_buoyancy_control.mp4',
      volume: 0,
    },
    {
      fit: 'cover',
      id: 'scene-06',
      mediaPath: 'media/movies/06_overinflation_trouble.mp4',
      volume: 0,
    },
    {
      fit: 'cover',
      id: 'scene-07',
      mediaPath: 'media/movies/07_forced_fart_treatment.mp4',
      volume: 0,
    },
    {
      fit: 'cover',
      id: 'scene-08',
      mediaPath: 'media/movies/08_fart_engine_manatee.mp4',
      volume: 0,
    },
  ],
  id: 'manatee-float',
  outputFileName: 'manatee-float.mp4',
};

export default project;
