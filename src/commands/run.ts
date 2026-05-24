import path from 'node:path';
import { loadProject } from '../projects/load';
import { stageProjectAssets } from '../projects/stage';
import { writeRootEntry } from './write-root-entry';

export type VideoCommandAction = 'compositions' | 'render' | 'studio';

export interface VideoCommand {
  action: VideoCommandAction;
  projectPath: string;
}

export async function runVideoCommand(command: VideoCommand): Promise<void> {
  const loadedProject = await loadProject(command.projectPath);
  const stagedAssets = await stageProjectAssets(loadedProject);
  const remotionRootEntry = await writeRootEntry({
    projectFilePath: loadedProject.filePath,
    projectId: loadedProject.definition.id,
  });
  const remotionProcess = Bun.spawn(
    remotionArgs({
      action: command.action,
      compositionId: loadedProject.definition.id,
      outputPath: stagedAssets.outputPath,
      publicDirPath: stagedAssets.publicDirPath,
      rootEntryPath: remotionRootEntry,
    }),
    {
      stderr: 'inherit',
      stdout: 'inherit',
    },
  );

  process.exitCode = await remotionProcess.exited;
}

interface RemotionArgsInput {
  action: VideoCommandAction;
  compositionId: string;
  outputPath: string;
  publicDirPath: string;
  rootEntryPath: string;
}

function remotionArgs(input: RemotionArgsInput): string[] {
  const executable = path.join('node_modules', '.bin', 'remotion');

  if (input.action === 'compositions') {
    return [
      executable,
      'compositions',
      input.rootEntryPath,
      '--public-dir',
      input.publicDirPath,
    ];
  }

  if (input.action === 'studio') {
    return [
      executable,
      'studio',
      input.rootEntryPath,
      '--public-dir',
      input.publicDirPath,
    ];
  }

  return [
    executable,
    'render',
    input.rootEntryPath,
    input.compositionId,
    input.outputPath,
    '--public-dir',
    input.publicDirPath,
  ];
}
