import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { loadProject } from '../src/projects/load';
import { stageProjectAssets } from '../src/projects/stage';

const [projectPath] = Bun.argv.slice(2);

if (projectPath === undefined) {
  throw new Error('Missing <project-path> argument.');
}

const loadedProject = await loadProject(projectPath);
const stagedAssets = await stageProjectAssets(loadedProject);
const propsDirectoryPath = path.join('.tmp', 'remotion-props');
const propsFilePath = path.join(
  propsDirectoryPath,
  `${loadedProject.definition.id}.json`,
);

await mkdir(propsDirectoryPath, { recursive: true });
await writeFile(
  propsFilePath,
  `${JSON.stringify(loadedProject.definition, null, 2)}\n`,
);

const studioProcess = Bun.spawn(
  [
    'bun',
    'x',
    'remotion',
    'studio',
    path.resolve(import.meta.dir, '../src/composition/root.tsx'),
    '--public-dir',
    stagedAssets.publicDirPath,
    '--props',
    propsFilePath,
  ],
  {
    stderr: 'inherit',
    stdin: 'inherit',
    stdout: 'inherit',
  },
);

process.exitCode = await studioProcess.exited;
