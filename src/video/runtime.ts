import { staticFile } from 'remotion';
import { toAssetPath } from './asset-path';
import type { Project } from './project';

export function applyMediaSrc(project: Project): Project {
  const clips = project.clips.map((clip) => {
    const publicPath = toAssetPath(project.id, clip.mediaPath);

    return {
      ...clip,
      src: staticFile(publicPath),
    };
  });

  const audioPublicPath = toAssetPath(project.id, project.audio.mediaPath);

  return {
    ...project,
    audio: {
      ...project.audio,
      src: staticFile(audioPublicPath),
    },
    clips,
  };
}
