import { runStudioCommand, type StudioAction } from './studio/cli';
import { listProjectIds } from './video/manatee-float';

async function runFromCli(): Promise<void> {
  const [action, projectId] = Bun.argv.slice(2);

  if (action === undefined || action === 'help') {
    printUsage();
    return;
  }

  if (!isStudioAction(action)) {
    throw new Error(`Unknown action: ${action}`);
  }

  if (projectId === undefined) {
    throw new Error(
      'Missing <project-id> argument. Run `bun run start help` to see valid values.',
    );
  }

  await runStudioCommand({
    action,
    projectId,
  });
}

function isStudioAction(value: string): value is StudioAction {
  return value === 'compositions' || value === 'render' || value === 'studio';
}

function printUsage(): void {
  const projectIds = listProjectIds();
  const joinedProjectIds = projectIds.join(', ');

  process.stdout.write('mnt-rms: Remotion verification product\n');
  process.stdout.write('Usage:\n');
  process.stdout.write('  bun run start <action> <project-id>\n');
  process.stdout.write('  bun run start help\n');
  process.stdout.write('Actions:\n');
  process.stdout.write('  compositions, studio, render\n');
  process.stdout.write(`Project IDs:\n  ${joinedProjectIds}\n`);
  process.stdout.write('Example:\n');
  process.stdout.write('  bun run start render manatee-float\n');
}

runFromCli().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
