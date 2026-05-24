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

  test('requires caption motionName to be explicit', async () => {
    const projectPath = await writeProjectFixture('missing-motion-name', {
      captions: [
        {
          durationSeconds: 1,
          id: 'caption-1',
          startSeconds: 0,
          styleName: 'centerHeadline',
          text: 'Hello',
        },
      ],
    });

    await expect(loadProject(projectPath)).rejects.toThrow(
      'project.captions[0].motionName must be a non-empty string',
    );
  });
});

async function writeProjectFixture(
  directoryName: string,
  overrides: Record<string, unknown>,
): Promise<string> {
  const projectDirectoryPath = path.join(tempRootPath, directoryName);
  await mkdir(projectDirectoryPath, { recursive: true });

  const projectDefinition = {
    audio: [
      {
        durationSeconds: 2,
        id: 'audio-1',
        mediaPath: 'media/audio.mp3',
        startSeconds: 0,
        trimBeforeSeconds: 0,
        volume: 0.5,
      },
    ],
    backgroundColor: '#000000',
    canvas: {
      durationSeconds: 2,
      fps: 30,
      height: 1920,
      width: 1080,
    },
    captions: [
      {
        durationSeconds: 1,
        id: 'caption-1',
        motionName: 'centerPop',
        startSeconds: 0,
        styleName: 'centerHeadline',
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
