import { staticFile } from 'remotion';
import { toAssetPath } from './asset-path';
import type { ResolvedSpec, Spec } from './definition';

export function buildRuntimeSpec(definition: Spec): ResolvedSpec {
  const clips = definition.clips.map((clip) => {
    const publicPath = toAssetPath(definition.id, clip.mediaPath);

    return {
      ...clip,
      src: staticFile(publicPath),
    };
  });

  const audioPublicPath = toAssetPath(
    definition.id,
    definition.audio.mediaPath,
  );

  return {
    ...definition,
    audio: {
      ...definition.audio,
      src: staticFile(audioPublicPath),
    },
    clips,
  };
}
