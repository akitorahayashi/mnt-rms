import { Composition, registerRoot } from 'remotion';
import {
  calculateProjectMetadata,
  ManateeFloatComposition,
  manateeFloatProject,
} from '../video/manatee-float';

function RemotionRoot() {
  const project = manateeFloatProject;

  return (
    <Composition
      id={project.id}
      component={ManateeFloatComposition}
      width={project.canvas.width}
      height={project.canvas.height}
      fps={project.canvas.fps}
      durationInFrames={project.canvas.durationInFrames}
      defaultProps={project}
      calculateMetadata={calculateProjectMetadata}
    />
  );
}

registerRoot(RemotionRoot);
