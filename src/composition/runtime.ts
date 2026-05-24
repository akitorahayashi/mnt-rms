import { staticFile } from 'remotion';
import { toAssetPath } from '../projects/asset-path';
import type { Project } from '../timeline/project';

export function applyMediaSrc(project: Project): Project {
  const clips = project.clips.map((clip) => {
    const publicPath = toAssetPath(project.id, clip.mediaPath);

    return {
      ...clip,
      src: staticFile(publicPath),
    };
  });

  const audio = project.audio.map((track) => {
    const publicPath = toAssetPath(project.id, track.mediaPath);

    return {
      ...track,
      src: staticFile(publicPath),
    };
  });

  return {
    ...project,
    audio,
    clips,
  };
}
