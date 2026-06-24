import { Command, Option } from 'clipanion';
import { runVideoCommand } from './run';

export class CompositionsCommand extends Command {
  static override paths = [['compositions']];
  static override usage = Command.Usage({
    description: 'List available compositions for a project.',
  });

  projectPath = Option.String({ name: 'project-path', required: true });

  async execute(): Promise<void> {
    await runVideoCommand({
      action: 'compositions',
      projectPath: this.projectPath,
    });
  }
}
