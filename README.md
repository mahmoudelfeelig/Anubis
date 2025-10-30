# Anubis ARG Platform

Anubis is a Next.js application for building and hosting alternate reality game (ARG) levels. Players sign in, solve multi-step puzzles, and progress through a curated sequence of challenges that span console sleuthing, cryptography, media manipulation, and meta puzzles.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Getting Started](#getting-started)
4. [Environment Variables](#environment-variables)
5. [Available Scripts](#available-scripts)
6. [Linting](#linting)
7. [Testing](#testing)
8. [Level Authoring Workflow](#level-authoring-workflow)
9. [CI/CD](#cicd)

## Project Overview

- **Framework**: Next.js 16 (app router, RSC + client components).
- **Database**: MongoDB, accessed via the official `mongodb` driver.
- **Storage**: Cloudinary for user avatars; static puzzle assets under `/levels`.
- **Sessions/Auth**: Custom session token system with hashed cookies.
- **ARG Levels**: Stored as JSON + MDX + assets in `levels/lv-XXX`. Each level includes metadata, hints, and associated files.
- **Generator**: `scripts/generate-levels.js` is the single source of truth for all level definitions. Running it regenerates level folders and placeholder assets.

## Tech Stack

- **Frontend**: React 19, Next.js 16, TypeScript.
- **Styling**: CSS Modules / global styles (see `app/`).
- **Testing**: Vitest + @testing-library/react + jsdom.
- **CI**: GitHub Actions (lint, test, build).

## Getting Started

```bash
# Clone and install dependencies
git clone <https://github.com/mahmoudelfeelig/arg>
cd Anubis
npm install

# Start the dev server
npm run dev
```

The app runs on `http://localhost:3000`.

## Environment Variables

Create an `.env.local` file in the project root. Required variables:

```ini
MONGODB_URI=mongodb://localhost:27017/anubis
SESSION_SECRET=dev-session-secret
PWD_PEPPER=dev-pepper

CLD_CLOUD_NAME=your-cloud
CLD_API_KEY=your-key
CLD_API_SECRET=your-secret
```

Additional variables like `NEXT_PUBLIC_*` go here as needed.

## Available Scripts

| Command            | Description                                     |
|--------------------|-------------------------------------------------|
| `npm run dev`      | Start Next.js in development mode.              |
| `npm run lint`     | Run ESLint.                                     |
| `npm test`         | Run the Vitest suite (unit + component tests).  |
| `npm run test:watch` | Watch mode for Vitest.                       |
| `npm run build`    | Create a production build.                      |
| `npm run start`    | Start the production server (after build).      |

## Linting

ESLint is configured through the flat config file `eslint.config.mjs`. It composes three layers:

1. **Ignores**: Skip generated assets (`.next`, `node_modules`, `levels/**/assets`, `public`) to avoid linting build outputs.
2. **Base JavaScript rules**: `@eslint/js` recommended config provides sensible defaults and modern syntax checks.
3. **Next.js best practices**: `eslint-config-next` enforces framework guidelines, including `next/core-web-vitals` rules.

Additional blocks tailor the experience:

- TypeScript files reference `tsconfig.json` so ESLint understands project structure and flags type-aware issues.
- Test files (`tests/**/*`) enable Jest globals and relax noisy rules like `no-console`.
- `no-console` is downgraded to warnings in application code, allowing `console.warn` and `console.error` for debugging.

Run `npm run lint` to execute the ruleset.

## Testing

The project uses Vitest across server and client code.

- **Setup file**: `tests/setup.ts` seeds environment variables, jsdom matchers, and resets spies.
- **Unit coverage**:
  - `lib/normalize`, `lib/mongo-ids`, `lib/progress`, `lib/db`, `lib/mdx`.
  - Cloudinary storage helpers via mocked SDK.
  - Level actions (`solveForm`) with crypto hashing.
  - Level generator script via temporary directories.
- **Component tests**:
  - `components/LevelRunner` rendered in jsdom using React Testing Library.

Run `npm test` to execute everything. Use `npm run test:watch` during development.

## Level Authoring Workflow

1. Modify level definitions within `scripts/generate-levels.js`.
2. Run `node scripts/generate-levels.js` to regenerate the `levels/` directory.
3. Check the generated `assets/manifest.md` inside each level for required media, and replace TODO placeholders with final assets.
4. Update checksums or hashed credential hints as needed.

The generator is idempotent and can safely rebuild all levels anytime.

## CI/CD

GitHub Actions (`.github/workflows/ci.yml`) runs on every push and pull request:

1. Install dependencies via `npm ci`.
2. Run linting (`npm run lint`).
3. Execute the Vitest suite (`npm test`).
4. Build the production bundle (`npm run build`).

CI expects environment variables to be injected via GitHub secrets if production-like tests are added. Current tests rely only on in-memory mocks and do not require external services.