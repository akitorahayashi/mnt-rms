import { staticFile } from 'remotion';
import { toAssetPath } from '../projects/asset-path';
import {
  flattenAudioLanes,
  type Project,
  type ProjectDefinition,
} from '../timeline/project';

export function applyMediaSrc(projectDefinition: ProjectDefinition): Project {
  const flatAudio = flattenAudioLanes(projectDefinition.audio);

  const clips = projectDefinition.clips.map((clip) => {
    const publicPath = toAssetPath(projectDefinition.id, clip.mediaPath);
    return {
      ...clip,
      src: staticFile(publicPath),
      startSeconds: 0, // assigned sequentially by calculateMetadata
    };
  });

  const audio = flatAudio.map((track) => {
    const publicPath = toAssetPath(projectDefinition.id, track.mediaPath);
    return {
      ...track,
      durationSeconds: 0, // resolved by calculateMetadata via parseMedia
      src: staticFile(publicPath),
    };
  });

  const overlays = projectDefinition.overlays.map((overlay) => {
    if (overlay.kind !== 'image') {
      return overlay;
    }

    const publicPath = toAssetPath(projectDefinition.id, overlay.mediaPath);
    return {
      ...overlay,
      src: staticFile(publicPath),
    };
  });

  return {
    ...projectDefinition,
    audio,
    clips,
    overlays,
  };
}
