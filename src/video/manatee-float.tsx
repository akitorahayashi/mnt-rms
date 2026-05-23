import { parseMedia } from '@remotion/media-parser';
import type { CSSProperties } from 'react';
import type { CalculateMetadataFunction } from 'remotion';
import {
  AbsoluteFill,
  Html5Audio,
  interpolate,
  OffthreadVideo,
  Sequence,
  Series,
  staticFile,
  useCurrentFrame,
} from 'remotion';

interface VideoCanvas {
  durationInFrames: number;
  fps: number;
  height: number;
  width: number;
}

interface ClipTrack {
  durationInFrames?: number;
  fit: 'contain' | 'cover';
  id: string;
  publicPath: string;
  sourceDurationInFrames?: number;
  sourcePath: string;
  src: string;
  trimAfterInFrames?: number;
  trimBeforeInFrames?: number;
  volume?: number;
}

interface TelopCue {
  animationName?: keyof typeof telopMotionCatalog;
  durationInFrames: number;
  from: number;
  id: string;
  styleName: keyof typeof telopStyleCatalog;
  text: string;
}

interface BgmTrack {
  publicPath: string;
  sourcePath: string;
  src: string;
  trimAfter: number;
  trimBefore: number;
  volume: number;
}

export interface VideoProject extends Record<string, unknown> {
  bgm: BgmTrack;
  canvas: VideoCanvas;
  clips: ClipTrack[];
  id: 'manatee-float';
  outputFileName: string;
  telops: TelopCue[];
}

const telopMotionCatalog = {
  centerPop: (frame: number): CSSProperties => ({
    opacity: interpolate(frame, [0, 8], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
    transform: `translate(-50%, -50%) scale(${interpolate(
      frame,
      [0, 10],
      [0.84, 1],
      {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      },
    )})`,
  }),
  none: (): CSSProperties => ({}),
} as const;

const telopStyleCatalog = {
  centerHeadline: {
    color: '#fff7db',
    fontFamily: 'Hiragino Sans, Yu Gothic, sans-serif',
    fontSize: 82,
    fontWeight: 900,
    left: '50%',
    letterSpacing: '-0.04em',
    lineHeight: 1.12,
    maxWidth: 920,
    position: 'absolute',
    textAlign: 'center',
    textShadow:
      '0 9px 0 #101010, 9px 0 0 #101010, -9px 0 0 #101010, 0 -9px 0 #101010, 0 18px 28px rgba(0, 0, 0, 0.55)',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: 'max-content',
  },
} satisfies Record<string, CSSProperties>;

export const manateeFloatProject: VideoProject = {
  bgm: {
    publicPath: 'projects/manatee-float/music/おならエンジン.mp3',
    sourcePath: 'src/assets/manatee/music/おならエンジン.mp3',
    src: staticFile('projects/manatee-float/music/おならエンジン.mp3'),
    trimAfter: 2700,
    trimBefore: 1800,
    volume: 0.28,
  },
  canvas: {
    durationInFrames: 900,
    fps: 30,
    height: 1920,
    width: 1080,
  },
  clips: [
    {
      fit: 'cover',
      id: 'still-in-water',
      publicPath:
        'projects/manatee-float/pool/vertical/01_still_in_water_202605162110.mp4',
      sourcePath:
        'src/assets/manatee/pool/vertical/01_still_in_water_202605162110.mp4',
      src: staticFile(
        'projects/manatee-float/pool/vertical/01_still_in_water_202605162110.mp4',
      ),
      volume: 0,
    },
    {
      fit: 'cover',
      id: 'slowly-rises-surface',
      publicPath:
        'projects/manatee-float/pool/vertical/02_slowly_rises_surface_202605162110.mp4',
      sourcePath:
        'src/assets/manatee/pool/vertical/02_slowly_rises_surface_202605162110.mp4',
      src: staticFile(
        'projects/manatee-float/pool/vertical/02_slowly_rises_surface_202605162110.mp4',
      ),
      volume: 0,
    },
    {
      fit: 'cover',
      id: 'circles-water',
      publicPath:
        'projects/manatee-float/pool/vertical/03_circles_water_avoiding_o…_202605162110.mp4',
      sourcePath:
        'src/assets/manatee/pool/vertical/03_circles_water_avoiding_o…_202605162110.mp4',
      src: staticFile(
        'projects/manatee-float/pool/vertical/03_circles_water_avoiding_o…_202605162110.mp4',
      ),
      volume: 0,
    },
    {
      fit: 'cover',
      id: 'floats-in-clear-spring',
      publicPath:
        'projects/manatee-float/pool/vertical/04_floats_in_clear_spring_202605162111.mp4',
      sourcePath:
        'src/assets/manatee/pool/vertical/04_floats_in_clear_spring_202605162111.mp4',
      src: staticFile(
        'projects/manatee-float/pool/vertical/04_floats_in_clear_spring_202605162111.mp4',
      ),
      volume: 0,
    },
  ],
  id: 'manatee-float',
  outputFileName: 'manatee-float.mp4',
  telops: [
    {
      animationName: 'centerPop',
      durationInFrames: 72,
      from: 24,
      id: 'hook',
      styleName: 'centerHeadline',
      text: 'マナティ、浮き方がゆるすぎる',
    },
    {
      animationName: 'centerPop',
      durationInFrames: 78,
      from: 180,
      id: 'gas-engine',
      styleName: 'centerHeadline',
      text: '今日のBGMは、おならエンジン',
    },
    {
      animationName: 'centerPop',
      durationInFrames: 84,
      from: 390,
      id: 'no-gravity',
      styleName: 'centerHeadline',
      text: '水中だけ、ほぼ無重力',
    },
    {
      animationName: 'centerPop',
      durationInFrames: 90,
      from: 660,
      id: 'ending',
      styleName: 'centerHeadline',
      text: 'この丸さで、ちゃんと野生',
    },
  ],
};

export function listProjectIds(): VideoProject['id'][] {
  return [manateeFloatProject.id];
}

export function resolveProject(projectId: string): VideoProject {
  if (projectId === manateeFloatProject.id) {
    return manateeFloatProject;
  }

  throw new Error(
    `Unknown project-id: ${projectId}. Available project-ids: ${listProjectIds().join(', ')}`,
  );
}

export const calculateProjectMetadata: CalculateMetadataFunction<
  VideoProject
> = async ({ props }) => {
  const clips = await Promise.all(
    props.clips.map((clip) =>
      resolveClipDuration(clip, props.canvas.fps, props.id),
    ),
  );

  const timelineDuration = clips.reduce(
    (sum, clip) => sum + requireDuration(clip, props.id),
    0,
  );
  const durationInFrames = Math.min(
    props.canvas.durationInFrames,
    timelineDuration,
  );

  if (durationInFrames < 1) {
    throw new Error(
      `Project ${props.id} resolved to zero duration. Check clip definitions.`,
    );
  }

  return {
    durationInFrames,
    props: {
      ...props,
      clips,
    },
  };
};

export function ManateeFloatComposition({
  bgm,
  clips,
  id,
  telops,
}: VideoProject) {
  return (
    <AbsoluteFill style={{ backgroundColor: '#020403' }}>
      <Series>
        {clips.map((clip) => (
          <Series.Sequence
            key={clip.id}
            durationInFrames={requireDuration(clip, id)}
          >
            <OffthreadVideo
              endAt={clip.trimAfterInFrames}
              muted={clip.volume === 0}
              startFrom={clip.trimBeforeInFrames}
              src={clip.src}
              volume={clip.volume ?? 1}
              style={{
                height: '100%',
                objectFit: clip.fit,
                width: '100%',
              }}
            />
          </Series.Sequence>
        ))}
      </Series>
      {telops.map((cue) => (
        <Sequence
          key={cue.id}
          from={cue.from}
          durationInFrames={cue.durationInFrames}
        >
          <Telop cue={cue} />
        </Sequence>
      ))}
      <Html5Audio
        src={bgm.src}
        trimAfter={bgm.trimAfter}
        trimBefore={bgm.trimBefore}
        volume={bgm.volume}
      />
    </AbsoluteFill>
  );
}

function Telop({ cue }: { cue: TelopCue }) {
  const frame = useCurrentFrame();
  const style = telopStyleCatalog[cue.styleName];
  const animation = telopMotionCatalog[cue.animationName ?? 'none'](frame);

  return (
    <div
      style={{
        ...style,
        ...animation,
      }}
    >
      {cue.text}
    </div>
  );
}

async function resolveClipDuration(
  clip: ClipTrack,
  fps: number,
  projectId: string,
): Promise<ClipTrack> {
  const { slowDurationInSeconds } = await parseMedia({
    acknowledgeRemotionLicense: true,
    fields: {
      slowDurationInSeconds: true,
    },
    src: clip.src,
  });

  const sourceDurationInFrames = Math.max(
    1,
    Math.floor(slowDurationInSeconds * fps),
  );
  const trimBeforeInFrames = clip.trimBeforeInFrames ?? 0;
  const trimAfterInFrames = clip.trimAfterInFrames ?? sourceDurationInFrames;
  const boundedTrimAfterInFrames = Math.min(
    trimAfterInFrames,
    sourceDurationInFrames,
  );

  if (trimBeforeInFrames < 0) {
    throw new Error(
      `Clip trimBeforeInFrames must be >= 0. project=${projectId}, clip=${clip.id}`,
    );
  }

  if (boundedTrimAfterInFrames <= trimBeforeInFrames) {
    throw new Error(
      `Clip trim window is invalid. project=${projectId}, clip=${clip.id}, trimBefore=${trimBeforeInFrames}, trimAfter=${boundedTrimAfterInFrames}`,
    );
  }

  return {
    ...clip,
    durationInFrames: boundedTrimAfterInFrames - trimBeforeInFrames,
    sourceDurationInFrames,
  };
}

function requireDuration(clip: ClipTrack, projectId: string): number {
  if (clip.durationInFrames !== undefined) {
    return clip.durationInFrames;
  }

  throw new Error(
    `Clip duration has not been resolved. project=${projectId}, clip=${clip.id}`,
  );
}
