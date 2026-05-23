# bun-spt

`bun-spt` is a Bun and TypeScript template repository for scripts.

The repository ships a minimal CLI entrypoint with repository-owned checks,
tests, and GitHub Actions validation.

## Setup

```bash
bun install
```

## Task Surface

```bash
bun run start
bun run check
bun run test
```

`bun run fix` applies Biome formatting and safe lint fixes.

## Runtime

The script entrypoint is `src/index.ts`.
Tests live under `tests/`.
GitHub Actions validation runs the same `check` and `test` tasks as local
development.
