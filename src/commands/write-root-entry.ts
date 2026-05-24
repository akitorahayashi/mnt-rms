import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

interface RemotionRootEntryInput {
  projectFilePath: string;
  projectId: string;
}

export async function writeRootEntry(
  input: RemotionRootEntryInput,
): Promise<string> {
  const rootEntryPath = path.join(
    '.tmp',
    'remotion-root-entry',
    input.projectId,
    'root.tsx',
  );

  await mkdir(path.dirname(rootEntryPath), { recursive: true });
  await writeFile(
    rootEntryPath,
    remotionRootSource({
      projectFilePath: path.resolve(input.projectFilePath),
      rootEntryPath: path.resolve(rootEntryPath),
    }),
  );

  return rootEntryPath;
}

interface RemotionRootSourceInput {
  projectFilePath: string;
  rootEntryPath: string;
}

function remotionRootSource(input: RemotionRootSourceInput): string {
  const projectImportPath = toImportSpecifier(
    input.rootEntryPath,
    input.projectFilePath,
  );
  const runtimeProjectBuilderImportPath = toImportSpecifier(
    input.rootEntryPath,
    path.resolve('src/video/runtime.ts'),
  );
  const compositionImportPath = toImportSpecifier(
    input.rootEntryPath,
    path.resolve('src/video/composition.tsx'),
  );
  const metadataImportPath = toImportSpecifier(
    input.rootEntryPath,
    path.resolve('src/video/metadata.ts'),
  );

  return `import { Composition, registerRoot } from 'remotion';
import projectDefinition from '${projectImportPath}';
import { applyMediaSrc } from '${runtimeProjectBuilderImportPath}';
import { Composition as ProjectComposition } from '${compositionImportPath}';
import { calculateMetadata } from '${metadataImportPath}';

const runtimeProject = applyMediaSrc(projectDefinition);

function RemotionRoot() {
  return (
    <Composition
      id={runtimeProject.id}
      component={ProjectComposition}
      width={runtimeProject.canvas.width}
      height={runtimeProject.canvas.height}
      fps={runtimeProject.canvas.fps}
      durationInFrames={Math.max(
        1,
        Math.round(
          runtimeProject.canvas.durationSeconds * runtimeProject.canvas.fps,
        ),
      )}
      defaultProps={runtimeProject}
      calculateMetadata={calculateMetadata}
    />
  );
}

registerRoot(RemotionRoot);
`;
}

function toImportSpecifier(fromFilePath: string, toFilePath: string): string {
  const relativePath = path.relative(path.dirname(fromFilePath), toFilePath);
  const normalizedPath = relativePath.split(path.sep).join('/');
  const withPrefix = normalizedPath.startsWith('.')
    ? normalizedPath
    : `./${normalizedPath}`;

  return withPrefix.replace(/\.(ts|tsx)$/u, '');
}
