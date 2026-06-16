import path from 'node:path';
import { bundle } from '@remotion/bundler';
import {
  getCompositions,
  renderMedia,
  selectComposition,
} from '@remotion/renderer';
import { loadProject } from '../projects/load';
import { stageProjectAssets } from '../projects/stage';

export type VideoCommandAction = 'compositions' | 'render';

export interface VideoCommand {
  action: VideoCommandAction;
  projectPath: string;
}

export async function runVideoCommand(command: VideoCommand): Promise<void> {
  const loadedProject = await loadProject(command.projectPath);
  const stagedAssets = await stageProjectAssets(loadedProject);
  const inputProps = loadedProject.definition;
  const serveUrl = await bundle({
    entryPoint: path.resolve(import.meta.dir, '../composition/root.tsx'),
    publicDir: path.resolve(stagedAssets.publicDirPath),
    rootDir: process.cwd(),
  });

  if (command.action === 'compositions') {
    const compositions = await getCompositions(serveUrl, { inputProps });
    process.stdout.write(
      compositions
        .map(
          (composition) =>
            `${composition.id} ${composition.width}x${composition.height} ${composition.fps}fps ${composition.durationInFrames}f`,
        )
        .join('\n'),
    );
    process.stdout.write('\n');
    return;
  }

  const composition = await selectComposition({
    serveUrl,
    id: loadedProject.definition.id,
    inputProps,
    timeoutInMilliseconds: 120000,
  });

  await renderMedia({
    codec: 'h264',
    composition,
    inputProps,
    outputLocation: stagedAssets.outputPath,
    serveUrl,
    timeoutInMilliseconds: 120000,
  });
}
