# mnt-rms

`mnt-rms` is a Bun + TypeScript CLI for Remotion rendering across multiple
projects.

The repository is organized into three layers:

- `projects/`: per-project data and media (`project.ts`, `media/`)
- `src/captions/`: reusable caption styles and motions
- `src/timeline/`, `src/composition/`, `src/projects/`, `src/commands/`:
  timeline model and validation, Remotion composition runtime, project
  loading/staging, and CLI execution

## Setup

```bash
bun install
```

## Quick Start

```bash
bun run start help
bun run rms compositions projects/manatee-float
bun run rms render projects/manatee-float
```

Render output is written to:

`output/<project-id>/<output-file-name>`

## CLI

```bash
bun run rms <action> <project-path>
bun run start
```

- `action`
  - `compositions`: list available compositions for the project
  - `studio`: open Remotion Studio for the project
  - `render`: render the project to `output/`
- `project-path`
  - project directory containing `project.ts` (for example
    `projects/manatee-float`)
  - or direct path to `project.ts`

Common shortcuts:

```bash
bun run rms compositions projects/manatee-float
bun run rms studio projects/manatee-float
bun run rms render projects/manatee-float
```

## `project.ts` Contract

Each project must export a default object matching the runtime contract.

Required top-level fields:

- `id`
- `outputFileName`
- `backgroundColor`
- `canvas`
- `clips`
- `captions`
- `audio`

Minimal example:

```ts
import type { Project } from '../../src/timeline/project';

const project: Project = {
  id: 'sample',
  outputFileName: 'sample.mp4',
  backgroundColor: '#000000',
  canvas: {
    width: 1080,
    height: 1920,
    fps: 30,
    durationSeconds: 10,
  },
  clips: [
    {
      id: 'intro',
      mediaPath: 'media/intro.mp4',
      startSeconds: 0,
      fit: 'cover',
      volume: 0,
    },
    {
      id: 'follow-up',
      mediaPath: 'media/follow-up.mp4',
      startSeconds: 4.6,
      fit: 'cover',
      transition: {
        kind: 'crossfade',
        durationSeconds: 0.4,
      },
      volume: 0,
    },
  ],
  captions: [
    {
      id: 'hook',
      startSeconds: 0.3,
      durationSeconds: 2,
      text: 'Hello',
      styleName: 'centerHeadline',
      motionName: 'centerPop',
    },
  ],
  audio: [
    {
      id: 'bgm-main',
      mediaPath: 'media/bgm.mp3',
      startSeconds: 0,
      durationSeconds: 10,
      loop: true,
      trimBeforeSeconds: 0,
      trimAfterSeconds: 30,
      volume: 0.2,
    },
  ],
};

export default project;
```

Rules:

- `mediaPath` is relative to the project directory.
- `mediaPath` must stay inside the project directory (`..` is invalid).
- `styleName` and `motionName` must exist in `src/captions/`.
- Time fields are expressed in seconds and may be decimals.
- Seconds are rounded to the nearest frame using project `fps` during rendering.

## Add A New Project

1. Create `projects/<new-id>/project.ts`.
2. Put assets under `projects/<new-id>/media/`.
3. Run:

```bash
bun run rms compositions projects/<new-id>
bun run rms render projects/<new-id>
```

## Troubleshooting

- `Missing readable project.ts`
  - `project-path` does not point to a directory/file containing `project.ts`.
- `Unknown caption styleName` / `Unknown caption motionName`
  - the value is not defined in `src/captions/style.ts` or `src/captions/motion.ts`.
- `mediaPath must be inside the project directory`
  - path traversal (`..`) or invalid relative path is used.

## Validation

```bash
bun run check
bun run test
```
