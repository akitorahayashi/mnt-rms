export function toAssetPath(projectId: string, mediaPath: string): string {
  const normalizedProjectId = normalizeProjectId(projectId);
  const normalizedMediaPath = normalizeMediaPath(mediaPath);
  return ['projects', normalizedProjectId, normalizedMediaPath].join('/');
}

function normalizeMediaPath(mediaPath: string): string {
  const posixPath = mediaPath.replaceAll('\\', '/');

  if (posixPath.startsWith('/') || /^[A-Za-z]:\//u.test(posixPath)) {
    throw new Error(
      `mediaPath must be inside the project directory: ${mediaPath}`,
    );
  }

  const segments = posixPath.split('/');
  const normalizedSegments: string[] = [];

  for (const segment of segments) {
    if (segment === '' || segment === '.') {
      continue;
    }

    if (segment === '..') {
      throw new Error(
        `mediaPath must be inside the project directory: ${mediaPath}`,
      );
    }

    normalizedSegments.push(segment);
  }

  if (normalizedSegments.length === 0) {
    throw new Error(
      `mediaPath must be inside the project directory: ${mediaPath}`,
    );
  }

  return normalizedSegments.join('/');
}

function normalizeProjectId(projectId: string): string {
  const normalizedProjectId = projectId.trim();

  if (
    normalizedProjectId === '' ||
    normalizedProjectId === '.' ||
    normalizedProjectId === '..' ||
    normalizedProjectId.includes('/') ||
    normalizedProjectId.includes('\\')
  ) {
    throw new Error(
      `projectId must be a single safe path segment: ${projectId}`,
    );
  }

  return normalizedProjectId;
}
