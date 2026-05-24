import { copyFile, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { toAssetPath } from '../video/asset-path';
import type { LoadedProject } from './load';

export interface StagedProjectAssets {
  outputPath: string;
  publicDirPath: string;
}

export async function stageProjectAssets(
  loadedProject: LoadedProject,
): Promise<StagedProjectAssets> {
  const { definition, directoryPath } = loadedProject;
  const publicDirPath = path.join('.tmp', 'remotion-public', definition.id);
  const outputPath = path.join(
    'output',
    definition.id,
    definition.outputFileName,
  );

  await rm(publicDirPath, { force: true, recursive: true });
  await mkdir(publicDirPath, { recursive: true });
  await mkdir(path.dirname(outputPath), { recursive: true });

  const clipCopyJobs = definition.clips.map((clip) =>
    copyProjectAsset({
      mediaPath: clip.mediaPath,
      projectDirectoryPath: directoryPath,
      projectId: definition.id,
      publicDirPath,
    }),
  );
  const audioCopyJobs = definition.audio.map((track) =>
    copyProjectAsset({
      mediaPath: track.mediaPath,
      projectDirectoryPath: directoryPath,
      projectId: definition.id,
      publicDirPath,
    }),
  );

  await Promise.all([...clipCopyJobs, ...audioCopyJobs]);

  return {
    outputPath,
    publicDirPath,
  };
}

interface ProjectAssetCopyJob {
  mediaPath: string;
  projectDirectoryPath: string;
  projectId: string;
  publicDirPath: string;
}

async function copyProjectAsset(job: ProjectAssetCopyJob): Promise<void> {
  const sourcePath = path.resolve(job.projectDirectoryPath, job.mediaPath);
  const destinationRelativePath = toAssetPath(job.projectId, job.mediaPath);
  const destinationPath = path.join(job.publicDirPath, destinationRelativePath);

  await mkdir(path.dirname(destinationPath), { recursive: true });
  await copyFile(sourcePath, destinationPath);
}
