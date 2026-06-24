import { Command, Option } from 'clipanion';
import { runVideoCommand } from './run';

export class RenderCommand extends Command {
  static override paths = [['render']];
  static override usage = Command.Usage({
    description: 'Render a project to output/.',
  });

  projectPath = Option.String({ name: 'project-path', required: true });

  async execute(): Promise<void> {
    await runVideoCommand({ action: 'render', projectPath: this.projectPath });
  }
}
