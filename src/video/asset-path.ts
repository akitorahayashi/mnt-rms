export function toAssetPath(projectId: string, mediaPath: string): string {
  const normalizedMediaPath = normalizeMediaPath(mediaPath);
  return ['projects', projectId, normalizedMediaPath].join('/');
}

function normalizeMediaPath(mediaPath: string): string {
  const posixPath = mediaPath.replaceAll('\\', '/');
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
