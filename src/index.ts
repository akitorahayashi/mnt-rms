export async function runFromCli(): Promise<void> {
  console.log('Hello, bun-spt!');
}

runFromCli().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
