import { afterEach, describe, expect, test } from 'bun:test';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { loadProject } from '../src/projects/load';

const tempRootPath = path.join(import.meta.dir, '..', '.tmp', 'load-tests');

afterEach(async () => {
  await rm(tempRootPath, { force: true, recursive: true });
});

describe('loadProject', () => {
  test('rejects absolute clip mediaPath values', async () => {
    const projectPath = await writeProjectFixture('absolute-clip-path', {
      clips: [
        {
          fit: 'cover',
          id: 'clip-1',
          mediaPath: '/etc/passwd',
          startSeconds: 0,
          volume: 0,
        },
      ],
    });

    await expect(loadProject(projectPath)).rejects.toThrow(
      'project.clips[0].mediaPath must be relative to the project directory',
    );
  });

  test('rejects unsafe project id path segments', async () => {
    const projectPath = await writeProjectFixture('unsafe-id', {
      id: '../escape',
    });

    await expect(loadProject(projectPath)).rejects.toThrow(
      'project.id must be a single safe path segment',
    );
  });

  test('requires subtitleDefaults motionName to be explicit', async () => {
    const projectPath = await writeProjectFixture('missing-motion-name', {
      subtitleDefaults: {
        styleName: 'centerHeadline',
        x: 540,
        y: 960,
      },
      subtitles: [
        {
          durationSeconds: 1,
          id: 'subtitle-1',
          startSeconds: 0,
          text: 'Hello',
        },
      ],
    });

    await expect(loadProject(projectPath)).rejects.toThrow(
      'project.subtitleDefaults.motionName must be a non-empty string',
    );
  });

  test('rejects durationSeconds on cut transition', async () => {
    const projectPath = await writeProjectFixture('cut-transition-duration', {
      clips: [
        {
          fit: 'cover',
          id: 'clip-1',
          mediaPath: 'media/clip-1.mp4',
          startSeconds: 0,
          volume: 0,
        },
        {
          fit: 'cover',
          id: 'clip-2',
          mediaPath: 'media/clip-2.mp4',
          startSeconds: 1,
          transition: {
            durationSeconds: 0.4,
            kind: 'cut',
          },
          volume: 0,
        },
      ],
    });

    await expect(loadProject(projectPath)).rejects.toThrow(
      'project.clips[1].transition.durationSeconds is not allowed when kind is "cut"',
    );
  });

  test('rejects legacy flat audio array definitions', async () => {
    const projectPath = await writeProjectFixture('legacy-audio-array', {
      audio: [],
    });

    await expect(loadProject(projectPath)).rejects.toThrow(
      'project.audio must be an object with narration, music, and effects lanes',
    );
  });

  test('flattens lane-based audio clips in a deterministic order', async () => {
    const projectPath = await writeProjectFixture('lane-audio-definition', {
      audio: {
        effects: [
          {
            durationSeconds: 1,
            id: 'effect-1',
            mediaPath: 'media/effect.wav',
            startSeconds: 0.5,
            trimBeforeSeconds: 0,
            volume: 0.8,
          },
        ],
        music: [
          {
            durationSeconds: 2,
            id: 'music-1',
            mediaPath: 'media/music.mp3',
            startSeconds: 0,
            trimBeforeSeconds: 0,
            volume: 0.25,
          },
        ],
        narration: [
          {
            durationSeconds: 1.2,
            id: 'narration-1',
            mediaPath: 'media/narration.wav',
            startSeconds: 0.2,
            trimBeforeSeconds: 0,
            volume: 1,
          },
        ],
      },
    });
    const loaded = await loadProject(projectPath);

    expect(loaded.definition.audio.map((clip) => clip.id)).toEqual([
      'music-1',
      'narration-1',
      'effect-1',
    ]);
  });
});

async function writeProjectFixture(
  directoryName: string,
  overrides: Record<string, unknown>,
): Promise<string> {
  const projectDirectoryPath = path.join(tempRootPath, directoryName);
  await mkdir(projectDirectoryPath, { recursive: true });

  const projectDefinition = {
    audio: {
      effects: [],
      music: [
        {
          durationSeconds: 2,
          id: 'audio-1',
          mediaPath: 'media/audio.mp3',
          startSeconds: 0,
          trimBeforeSeconds: 0,
          volume: 0.5,
        },
      ],
      narration: [],
    },
    backgroundColor: '#000000',
    canvas: {
      durationSeconds: 2,
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
        durationSeconds: 1,
        id: 'subtitle-1',
        startSeconds: 0,
        text: 'Hello',
      },
    ],
    clips: [
      {
        fit: 'cover',
        id: 'clip-1',
        mediaPath: 'media/clip.mp4',
        startSeconds: 0,
        volume: 0,
      },
    ],
    id: 'fixture',
    outputFileName: 'fixture.mp4',
    ...overrides,
  };

  await writeFile(
    path.join(projectDirectoryPath, 'project.ts'),
    `export default ${JSON.stringify(projectDefinition, null, 2)};\n`,
  );

  return projectDirectoryPath;
}
