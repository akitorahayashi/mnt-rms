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
    props: applyMediaSrc(requireProject(input.props)),
  });

function RuntimeComposition(project: Project) {
  return <ProjectComposition {...applyMediaSrc(requireProject(project))} />;
}

function Root() {
  const project = requireProject(getInputProps<Partial<Project>>());

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

function requireProject(project: Partial<Project> | null | undefined): Project {
  if (
    project === null ||
    project === undefined ||
    typeof project.id !== 'string' ||
    project.canvas === undefined ||
    !Array.isArray(project.clips) ||
    !Array.isArray(project.audio) ||
    !Array.isArray(project.overlays)
  ) {
    throw new Error(
      'Remotion input props must include a validated project. Use the mnt-rms command runner to render this composition.',
    );
  }

  return project as Project;
}
