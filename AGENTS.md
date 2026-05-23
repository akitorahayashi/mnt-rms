
# Agent Guide

## Purpose

Template repository for Bun and TypeScript scripts.

## Runtime

- Use Bun commands only.
- Install dependencies with `bun install`.
- Run the script with `bun run start`.
- Run static validation with `bun run check`.
- Run tests with `bun run test`.
- Apply repository formatting with `bun run fix`.

## Development Rules

- Keep dependencies minimal and clearly justified.
- Keep the entry point script-oriented and lightweight.
- Do not add silent fallback behavior.
- Keep tests focused on externally observable behavior.
- Do not read `.mx/*.md` unless explicitly requested by the user.
