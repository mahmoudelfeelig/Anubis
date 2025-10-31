# Agent Operations Guide

This repository is designed to be agent-friendly. Use this guide whenever an automation or AI agent needs to work in the project.

## Repository Layout
- `app/`: Next.js app routes (RSC + client components).
- `components/`: Shared client components (hydration-safe).
- `levels/`: Individual level bundles. Each level folder contains `level.json`, `prompt.mdx`, and an `assets/` directory with a manifest that lists required media.
- `lib/`: Server-side helpers (database, session, storage, etc.).

## Agent Checklist
1. **Install deps** - `npm install`.
2. **Run tests** - `npm test` (Vitest) for library coverage, or `npm run test:watch` during development.
3. **Start dev server** - `npm run dev` to boot Next.js.
4. **Build for prod** - `npm run build`.

## Testing Strategy
- Unit tests live under `tests/` and use [Vitest](https://vitest.dev/).
- Tests rely on dependency mocking (`vi.mock`) for database, Cloudinary, and filesystem calls.
- Snapshot tests are avoided; always assert explicit behaviour or payloads.
- Keep fixtures small and colocated in `tests/fixtures`.

## Level Workflow
1. Edit the target `levels/lv-xxx` folder directly (`level.json`, `prompt.mdx`, and `assets/manifest.md`).
2. Keep manifests accurate - note whether a puzzle relies on external assets or is fully self-contained.
3. Record solving notes in `solutions/lv-xxx.md`; the `solutions/` directory is git-ignored so detailed walkthroughs stay private.
4. Update hashes or supporting files whenever binaries change.

## Credentials & Env
- Required env vars: `MONGODB_URI`, `SESSION_SECRET`, Cloudinary credentials (`CLD_*`).
- Never commit real secrets; use `.env.local` for local overrides.
- Tests stub out env usage, so headless agents can run them without real services.

## PR Expectations
- Linting and formatting follow Next.js defaults (ESLint + Prettier). Agents should run `npm run lint` before opening a PR if changes touch JS/TS files.
- Include test results in CI or PR descriptions.
- Update this guide whenever agent workflows change.


