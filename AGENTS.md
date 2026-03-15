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
pnpm lint:fix     # Fix linting and formatting issues
pnpm test         # Run all tests
pnpm test <file>  # Run single test file
pnpm deploy       # Full pre-deploy check (build vimsplain, typecheck, lint, test, build app)
```

### vimsplain package

```bash
pnpm --filter vimsplain test    # Run vimsplain tests
pnpm --filter vimsplain build   # Build vimsplain (tsdown → dist/)
pnpm --filter vimsplain typecheck
```

## Key Context

- **Package manager:** pnpm workspaces
- **Linter/Formatter:** Biome (run `pnpm lint:fix` before committing)
- **Editor:** CodeMirror with @replit/codemirror-vim
- **State:** Zustand and nuqs for url param state management
- **Network:** Supabase RPC-first + Zod validation (see [Network Layer](.agent/conventions/network-layer.md))

## Working on vimsplain

`packages/vimsplain/` is a **published npm package**. Changes to it require a branch + PR workflow — never commit vimsplain changes directly to `main`.

### Required workflow for any change to packages/vimsplain/

1. **Branch from main** — never commit vimsplain changes directly to `main`
2. Make your changes
3. **Run `pnpm changeset`** — select `vimsplain`, pick bump type (`patch` / `minor` / `major`), write a one-line summary. Commit the generated `.changeset/*.md` file alongside your code
4. **Open a PR** — the Changesets bot will comment showing the pending version bump
5. **Do NOT run `pnpm changeset version` locally** — that consumes the changeset and bypasses the automated flow
6. Merge the PR to `main`
7. The Changesets bot automatically opens a **"Version Packages" PR** — the human reviews and merges this when ready to release
8. Merging that PR triggers GitHub Actions to publish to npm automatically

### vimsplain commands

```bash
pnpm --filter vimsplain test:run       # Run tests
pnpm --filter vimsplain test:coverage  # Run tests with coverage (must stay ≥90% lines)
pnpm --filter vimsplain build          # Build (tsdown → dist/)
pnpm --filter vimsplain typecheck      # Type check
pnpm changeset                         # Create a changeset for a vimsplain release
```

See `packages/vimsplain/README.md` and `docs/plans/PUBLISHING.md` for full details.

## Conventions

See [.agent/conventions/](.agent/conventions/) for detailed guidelines:

- [TypeScript](.agent/conventions/typescript.md) - Type patterns specific to this codebase
- [Network Layer](.agent/conventions/network-layer.md) - Supabase RPCs, Zod schema validation, and real-time views
- [React Components](.agent/conventions/react-components.md) - Component patterns and `cn()` utility
- [Testing](.agent/conventions/testing.md) - Vitest setup, store testing, CodeMirror testing
- [Zustand](.agent/conventions/zustand.md) - Store patterns and persistence
