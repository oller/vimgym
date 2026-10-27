# VimGym

pnpm monorepo: interactive Vim training game (`src/`) + `packages/vimsplain` (published npm library).

## Structure

```
/                   # vimgym app (private, Vite + React)
packages/vimsplain/ # vimsplain npm package (MIT, published to npm)
```

## Commands

### App (root)

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm tsc          # Type check
pnpm lint:fix     # Fix linting and formatting issues (run before committing)
pnpm test         # Run all tests
pnpm test <file>  # Run single test file
pnpm deploy       # Full pre-deploy check (build vimsplain, typecheck, lint, test, build app)
```

### vimsplain (`packages/vimsplain`)

```bash
pnpm --filter vimsplain test:run       # Run tests
pnpm --filter vimsplain test:coverage  # Run tests with coverage (must stay ≥90% lines)
pnpm --filter vimsplain build          # Build (tsdown → dist/)
pnpm --filter vimsplain typecheck      # Type check
pnpm --filter vimsplain gen:commands   # Regenerate Supported Commands tables in README.md
pnpm changeset                         # Create a changeset for a vimsplain release
```

## Key Context

- **Package manager:** pnpm workspaces
- **Linter/Formatter:** Biome (run `pnpm lint:fix` before committing)
- **Editor:** CodeMirror with `@replit/codemirror-vim`
- **State:** Zustand and `nuqs` for URL param state management
- **Network:** Supabase RPC-first + Zod validation

## Working on `packages/vimsplain`

When modifying `packages/vimsplain/`:

1. Work on a feature branch off `main`.
2. When adding, removing, or renaming an entry in `NORMAL_COMMANDS` (`src/handlers/normal.ts`) or `VISUAL_OPERATORS` (`src/handlers/visual.ts`), run `pnpm --filter vimsplain gen:commands` and commit the updated `README.md`.
3. Run `pnpm changeset` (`vimsplain`, `patch` / `minor` / `major`) and commit the generated `.changeset/*.md` file with your changes (leave `pnpm changeset version` to the release CI).

- **[`packages/vimsplain/README.md`](packages/vimsplain/README.md)** — `vimsplain` parser architecture, handler API, and command table markers when editing `packages/vimsplain/`.

## Coding Standards

Read the relevant section of [`CODING_STANDARDS.md`](CODING_STANDARDS.md) when your task touches that branch:

- **[TypeScript](CODING_STANDARDS.md#typescript)** — Generated database helper types (`src/types/database.ts`) and `varlock` env schema (`src/env.ts`).
- **[Network Layer & Data Patterns](CODING_STANDARDS.md#network-layer--data-patterns)** — Supabase nullable client, RPC error contracts (`src/api/`), Zod dashboard schemas (`src/schemas/`), and React Query hooks (`src/hooks/api/`).
- **[React Components](CODING_STANDARDS.md#react-components)** — `cn()` class merging, React 19 `use()` context, `<VimEditor key={levelId} />` remounting, `motion`, and `tokyo-night-storm` styling.
- **[Zustand State Management](CODING_STANDARDS.md#zustand-state-management)** — `useGameStore` architecture (`devtools`-only, no `persist`) and slice selectors.
- **[Testing](CODING_STANDARDS.md#testing)** — `tests/setup.ts` auto-mocks, store reset via `setLevel`, `renderWithRouter` (`<NuqsAdapter>`), dynamic imports for Supabase singleton tests, and CodeMirror integration tests.
