# mnt-rms

`mnt-rms` is a Bun + TypeScript repository for multi-project Remotion rendering.

## Setup

```bash
bun install
```

## Task Surface

```bash
bun run start
bun run check
bun run test
bun run video:compositions
bun run video:studio
bun run video:render
```

`bun run video:render` writes `output/<project-id>/<output-file-name>`.

## CLI

```bash
bun run start <action> <project-path>
bun run start help
```

- `action`: `compositions`, `studio`, `render`
- `project-path`: a project directory containing `project.ts`, or a direct `project.ts` path

Example:

```bash
bun run start render projects/manatee-float
```

## Project Structure

- Project definitions and media: `projects/<project-id>/`
- Caption assets: `src/captions/`
- Render composition and metadata logic: `src/video/`
- Project loading and staging: `src/projects/`
- CLI command execution: `src/commands/` and `src/cli.ts`
