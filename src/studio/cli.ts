import { copyFile, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { resolveProject, type VideoProject } from '../video/manatee-float';

export type StudioAction = 'compositions' | 'render' | 'studio';

export interface StudioCommand {
  action: StudioAction;
  projectId: string;
}

export async function runStudioCommand(command: StudioCommand): Promise<void> {
  const project = resolveProject(command.projectId);
  const publicDir = path.join('.tmp', 'remotion-public', project.id);
  const outputPath = path.join('output', project.outputFileName);

  await mkdir(path.dirname(outputPath), { recursive: true });
  await prepareProjectPublicDir(project, publicDir);

  const remotionProcess = Bun.spawn(
    remotionArgs(command.action, project.id, publicDir, outputPath),
    {
      stderr: 'inherit',
      stdout: 'inherit',
    },
  );

  const exitCode = await remotionProcess.exited;
  process.exitCode = exitCode;
}

function remotionArgs(
  action: StudioAction,
  projectId: string,
  publicDir: string,
  outputPath: string,
): string[] {
  const executable = path.join('node_modules', '.bin', 'remotion');
  const rootEntryPoint = 'src/studio/root.tsx';

  if (action === 'compositions') {
    return [
      executable,
      'compositions',
      rootEntryPoint,
      '--public-dir',
      publicDir,
    ];
  }

  if (action === 'studio') {
    return [executable, 'studio', rootEntryPoint, '--public-dir', publicDir];
  }

  return [
    executable,
    'render',
    rootEntryPoint,
    projectId,
    outputPath,
    '--public-dir',
    publicDir,
  ];
}

async function prepareProjectPublicDir(
  project: VideoProject,
  publicDir: string,
): Promise<void> {
  await rm(publicDir, { force: true, recursive: true });
  await mkdir(publicDir, { recursive: true });

  const assetCopies = [
    copyPublicAsset(
      project.bgm.sourcePath,
      path.join(publicDir, project.bgm.publicPath),
    ),
    ...project.clips.map((clip) =>
      copyPublicAsset(clip.sourcePath, path.join(publicDir, clip.publicPath)),
    ),
  ];

  await Promise.all(assetCopies);
}

async function copyPublicAsset(sourcePath: string, destinationPath: string) {
  await mkdir(path.dirname(destinationPath), { recursive: true });
  await copyFile(path.resolve(sourcePath), destinationPath);
}
