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
  const entryPoint = path.resolve(import.meta.dir, '../composition/root.tsx');

  if (command.action === 'compositions') {
    const serveUrl = await bundleRuntime({
      entryPoint,
      publicDirPath: stagedAssets.publicDirPath,
    });
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

  if (command.action === 'render') {
    const serveUrl = await bundleRuntime({
      entryPoint,
      publicDirPath: stagedAssets.publicDirPath,
    });
    const composition = await selectComposition({
      serveUrl,
      id: loadedProject.definition.id,
      inputProps,
      timeoutInMilliseconds: 120000,
    });

    let lastPercent = -1;
    await renderMedia({
      codec: 'h264',
      composition,
      inputProps,
      onProgress: ({ progress }) => {
        const percent = Math.round(progress * 100);
        if (percent === lastPercent) {
          return;
        }

        lastPercent = percent;
        process.stdout.write(`Rendering progress: ${percent}%\r`);
      },
      outputLocation: stagedAssets.outputPath,
      serveUrl,
      timeoutInMilliseconds: 120000,
    });
    process.stdout.write('\n');
    return;
  }

  throw new Error(`Unsupported action: ${command.action satisfies never}`);
}

interface BundleRuntimeInput {
  entryPoint: string;
  publicDirPath: string;
}

function bundleRuntime(input: BundleRuntimeInput): Promise<string> {
  return bundle({
    entryPoint: input.entryPoint,
    publicDir: path.resolve(input.publicDirPath),
    rootDir: process.cwd(),
  });
}
