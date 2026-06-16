import {
  type CalculateMetadataFunction,
  getInputProps,
  Composition as RemotionComposition,
  registerRoot,
} from 'remotion';
import type { Project } from '../timeline/project';
import { calculateMetadata } from './metadata';
import { Composition as ProjectComposition } from './render';
import { applyMediaSrc } from './runtime';

const calculateRuntimeMetadata: CalculateMetadataFunction<Project> = (input) =>
  calculateMetadata({
    ...input,
    props: applyMediaSrc(input.props),
  });

function RuntimeComposition(project: Project) {
  return <ProjectComposition {...applyMediaSrc(project)} />;
}

function Root() {
  const project = getInputProps<Project>();

  return (
    <RemotionComposition
      id={project.id}
      component={RuntimeComposition}
      width={project.canvas.width}
      height={project.canvas.height}
      fps={project.canvas.fps}
      durationInFrames={1}
      defaultProps={project}
      calculateMetadata={calculateRuntimeMetadata}
    />
  );
}

registerRoot(Root);
