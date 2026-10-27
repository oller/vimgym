# VimGym

## Verification

- **Worktree**: Build `vimsplain` (`pnpm --filter vimsplain build`) before `pnpm tsc` (`tsc -b` resolves against `packages/vimsplain/dist`).
- **Gates**: Format with `pnpm lint:fix` before committing; run `pnpm deploy` for the full pre-deploy check.

## Coding Standards ([`CODING_STANDARDS.md`](CODING_STANDARDS.md))

- **[`vimsplain`](CODING_STANDARDS.md#vimsplain)** — `packages/vimsplain/`
- **[TypeScript & Env](CODING_STANDARDS.md#typescript--env)** — `src/types/database.ts`, `src/env.ts`
- **[Network Layer](CODING_STANDARDS.md#network-layer)** — `src/lib/supabase/`, `src/api/`, `src/schemas/`, `src/hooks/api/`, `src/lib/analytics.ts`
- **[React & State](CODING_STANDARDS.md#react--state)** — `src/components/`, `src/store/useGameStore.ts`
- **[Testing](CODING_STANDARDS.md#testing)** — `src/**/__tests__/`, `tests/`
