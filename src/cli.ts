import { runVideoCommand, type VideoCommandAction } from './commands/run';
import { listProjectDirectories } from './projects/list';

async function runFromCli(): Promise<void> {
  const [action, projectPath] = Bun.argv.slice(2);

  if (action === undefined || action === 'help') {
    await printUsage();
    return;
  }

  if (!isVideoCommandAction(action)) {
    throw new Error(`Unknown action: ${action}`);
  }

  if (projectPath === undefined) {
    throw new Error(
      'Missing <project-path> argument. Run `bun run rms help` for usage.',
    );
  }

  await runVideoCommand({
    action,
    projectPath,
  });
}

function isVideoCommandAction(value: string): value is VideoCommandAction {
  return value === 'compositions' || value === 'render' || value === 'studio';
}

async function printUsage(): Promise<void> {
  const projectDirectories = await listProjectDirectories();
  const projectList =
    projectDirectories.length === 0
      ? '  (none)'
      : projectDirectories.map((project) => `  ${project}`).join('\n');

  process.stdout.write('mnt-rms: Remotion rendering CLI\n');
  process.stdout.write('Usage:\n');
  process.stdout.write('  bun run rms <action> <project-path>\n');
  process.stdout.write('  bun run rms help\n');
  process.stdout.write('Actions:\n');
  process.stdout.write('  compositions, studio, render\n');
  process.stdout.write(`Project paths:\n${projectList}\n`);
  process.stdout.write('Example:\n');
  process.stdout.write('  bun run rms render projects/manatee-float\n');
}

runFromCli().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
