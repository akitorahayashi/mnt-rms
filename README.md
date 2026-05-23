# mnt-rms

`mnt-rms` is a minimal repository to verify Remotion locally with one
composition and one rendered output video.

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

`bun run video:render` writes `output/manatee-float.mp4`.

## Runtime

- Script entrypoint: `src/index.ts`
- Remotion entrypoint: `src/studio/root.tsx`
- Project definition: `src/video/manatee-float.tsx`
- Asset source for staging: `src/assets/manatee/`
- Render output: `output/`
