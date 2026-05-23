import { describe, expect, test } from 'bun:test';
import path from 'node:path';

function runScript(): number {
  const command = Bun.spawnSync(['bun', 'src/index.ts'], {
    cwd: path.join(import.meta.dir, '..'),
    stdout: 'pipe',
    stderr: 'pipe',
  });

  return command.exitCode ?? 1;
}

describe('mnt-rms entrypoint', () => {
  test('runs without errors', () => {
    expect(runScript()).toBe(0);
  });
});
