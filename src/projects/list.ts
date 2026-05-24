import { constants } from 'node:fs';
import { access, readdir } from 'node:fs/promises';
import path from 'node:path';

export async function listProjectDirectories(): Promise<string[]> {
  const projectsRootPath = path.resolve('projects');
  const entries = await readdir(projectsRootPath, { withFileTypes: true });
  const projectDirectories: string[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const projectDirectoryPath = path.join(projectsRootPath, entry.name);
    const projectFilePath = path.join(projectDirectoryPath, 'project.ts');
    const isProjectDirectory = await access(projectFilePath, constants.R_OK)
      .then(() => true)
      .catch(() => false);

    if (isProjectDirectory) {
      projectDirectories.push(
        path.relative(process.cwd(), projectDirectoryPath),
      );
    }
  }

  return projectDirectories.sort((left, right) => left.localeCompare(right));
}
