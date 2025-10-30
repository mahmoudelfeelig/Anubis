# Agent Operations Guide

This repository is designed to be agent-friendly. Use this guide whenever an automation or AI agent needs to work in the project.

## Repository Layout
- `app/`: Next.js app routes (RSC + client components).
- `components/`: Shared client components (hydration-safe).
- `levels/`: Individual level bundles. Each level folder contains `level.json`, `prompt.mdx`, and an `assets/` directory with a manifest that lists required media.
- `lib/`: Server-side helpers (database, session, storage, etc.).
- `scripts/generate-levels.js`: Canonical source of level metadata. Running `node scripts/generate-levels.js` regenerates every level folder from the definitions in this script.

## Agent Checklist
1. **Install deps** – `npm install`.
2. **Generate levels (optional)** – Run `node scripts/generate-levels.js` to regenerate level folders after editing the script.
3. **Run tests** – `npm test` (Vitest) for library coverage, or `npm run test:watch` during development.
4. **Start dev server** – `npm run dev` to boot Next.js.
5. **Build for prod** – `npm run build`.

## Testing Strategy
- Unit tests live under `tests/` and use [Vitest](https://vitest.dev/).
- Tests rely on dependency mocking (`vi.mock`) for database, Cloudinary, and filesystem calls.
- Snapshot tests are avoided; always assert explicit behaviour or payloads.
- Keep fixtures small and colocated in `tests/fixtures`.

## Level Workflow
1. Update the level definition inside `scripts/generate-levels.js`.
2. Run the generator to refresh the target `levels/lv-xxx` folder.
3. Replace TODO asset placeholders listed in `assets/manifest.md`.
4. Update checksums or hashes if binary assets change.

## Credentials & Env
- Required env vars: `MONGODB_URI`, `SESSION_SECRET`, Cloudinary credentials (`CLD_*`).
- Never commit real secrets; use `.env.local` for local overrides.
- Tests stub out env usage, so headless agents can run them without real services.

## PR Expectations
- Linting and formatting follow Next.js defaults (ESLint + Prettier). Agents should run `npm run lint` before opening a PR if changes touch JS/TS files.
- Include test results in CI or PR descriptions.
- Update this guide whenever agent workflows change.

