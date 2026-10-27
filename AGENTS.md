# VimGym

## Verification & Gotchas

- **Fresh worktree typecheck**: Run `pnpm --filter vimsplain build` before `pnpm tsc` (`tsc -b` resolves against `packages/vimsplain/dist`).
- **Pre-commit formatting**: Run `pnpm lint:fix` (Biome) before committing.
- **Pre-deploy check**: Run `pnpm deploy` to build `vimsplain`, typecheck, lint, test, and build the app.

## Coding Standards

Read the matching section of [`CODING_STANDARDS.md`](CODING_STANDARDS.md) when your task enters that branch:

- **[`vimsplain`](CODING_STANDARDS.md#vimsplain)** — Editing `packages/vimsplain/`.
- **[TypeScript](CODING_STANDARDS.md#typescript)** — Touching `src/types/database.ts` or `src/env.ts`.
- **[Network Layer](CODING_STANDARDS.md#network-layer)** — Touching `src/lib/supabase/`, `src/api/`, `src/schemas/`, `src/hooks/api/`, or `src/lib/analytics.ts`.
- **[React Components](CODING_STANDARDS.md#react-components)** — Touching `src/components/` or `src/utils/cn.ts`.
- **[Zustand Store](CODING_STANDARDS.md#zustand-store)** — Touching `src/store/useGameStore.ts`.
- **[Testing](CODING_STANDARDS.md#testing)** — Touching `src/**/__tests__/` or `tests/`.
