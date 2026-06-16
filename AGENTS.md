
# mnt-rms

## Ecosystem Principles
- Bun is the only runtime/tooling entrypoint.
- `project.ts` is the single source of project truth.
- `mediaPath` must stay project-relative and inside project dir.
- Timeline semantics are frame-based and validated.
- Fail fast; no silent fallbacks.

## Project Overview
`mnt-rms` is a Bun + TypeScript CLI for project-based Remotion rendering. It loads and validates `projects/*/project.ts`, stages assets, then runs `compositions` or `render`. The codebase separates project loading/staging, timeline validation, and composition runtime, writing renders to `output/`.

## Directory Structure
```text
.
|- projects/
|- src/
|  |- cli.ts
|  |- commands/
|  |- projects/
|  |- timeline/
|  |- composition/
|  |- captions/
|- tests/
|- output/
```

## Architecture & Implementation Details

### CLI Command Routing
`src/cli.ts` parses `<action> <project-path>` and dispatches only `compositions | render` to `runVideoCommand`.

### Project Loading and Contract Validation
`src/projects/load.ts` resolves directory/file inputs to `project.ts`, imports it, and validates to `Project` (`src/timeline/project.ts`) with explicit path, catalog, and numeric checks.

### Staging and Remotion Runtime Bridge
`src/projects/stage.ts` copies media to `.tmp/remotion-public/<project-id>/...` and prepares `output/<project-id>/...`. `src/composition/root.tsx` is the static Remotion root entry and reads validated project props from the command runner.

### Timeline and Composition Pipeline
`src/timeline/time.ts` and `src/timeline/transition.ts` implement frame conversion and transition invariants. `src/composition/metadata.ts` resolves clip durations and final metadata. `src/composition/render.tsx` renders clips, captions, and audio from resolved props.

## Development Commands
- Fix: `bun run fix`
- Check: `bun run check`
- Test: `bun run test`
- Run: `bun run rms <action> <project-path>`
- Studio: `bun run studio <project-path>`
