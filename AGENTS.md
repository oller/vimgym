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

## Releasing vimsplain

Changesets manages versioning and npm publishing via GitHub Actions.

1. After changing `packages/vimsplain/`, run `pnpm changeset` — select `vimsplain`, pick bump type, write summary
2. Commit the generated `.changeset/*.md` file with your code changes
3. Merge PR to `main` → Changesets bot opens a "Version Packages" PR
4. Merge that PR → GitHub Actions publishes to npm automatically (OIDC, no tokens needed)

See `packages/vimsplain/README.md` for full details.

## Conventions

See [.agent/conventions/](.agent/conventions/) for detailed guidelines:

- [TypeScript](.agent/conventions/typescript.md) - Type patterns specific to this codebase
- [Network Layer](.agent/conventions/network-layer.md) - Supabase RPCs, Zod schema validation, and real-time views
- [React Components](.agent/conventions/react-components.md) - Component patterns and `cn()` utility
- [Testing](.agent/conventions/testing.md) - Vitest setup, store testing, CodeMirror testing
- [Zustand](.agent/conventions/zustand.md) - Store patterns and persistence
