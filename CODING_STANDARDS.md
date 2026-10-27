# Coding Standards

## `vimsplain`

1. Work on a feature branch off `main`.
2. Run `pnpm --filter vimsplain gen:commands` and commit `packages/vimsplain/README.md` whenever adding, removing, or renaming an entry in `NORMAL_COMMANDS` (`src/handlers/normal.ts`) or `VISUAL_OPERATORS` (`src/handlers/visual.ts`).
3. Keep `pnpm --filter vimsplain test:coverage` at ≥90% lines/functions and ≥80% branches.
4. Run `pnpm changeset` (`vimsplain`, `patch` / `minor` / `major`) and commit the `.changeset/*.md` file; Changesets CI handles versioning and npm publishing on merge.
5. Read [`packages/vimsplain/README.md`](packages/vimsplain/README.md) when modifying parser architecture, handlers, or command table markers.

## TypeScript

- **Generated Database Types (`src/types/database.ts`)**: Regenerate via `pnpm types:gen` and type rows with the generated helpers:
  ```typescript
  import type { Tables, TablesInsert } from "../types/database";
  type LevelCompletion = Tables<"level_completions">;
  ```
- **Environment Variables (`src/env.ts`)**: Read env vars through the typed `env` export in `src/env.ts` (`varlock` schema in `env.d.ts`).

## Network Layer

- **Architecture**: Query via unified Supabase RPCs, validate boundary I/O with Zod schemas, and read real-time aggregates from standard Postgres VIEWs (`level_stats`, `view_user_level_bests`).
- **Supabase Client (`src/lib/supabase/client.ts`)**: Singleton typed with `createClient<Database, "public">(url, key)` using anonymous user IDs (`persistSession: false`, `autoRefreshToken: false`). `getSupabaseClient()` returns `null` when env vars are unset; treat `null` as a feature-flag fallback in every caller.
- **RPC Contracts (`src/api/index.ts`, `src/lib/analytics.ts`)**:
  - `getPlayerDashboard(userId)`: Returns `{}` fallback on `null` client, RPC error, or Zod validation failure.
  - `getLevelScoreDistribution(levelId)`: Returns `[]` on `null` client; **throws** on Supabase error.
  - `submitCompletionAnalytics`: Fire-and-forget from the store on level completion; catches all errors silently.
- **Schemas & Hooks**: Derive types via `z.infer<typeof schema>` in `src/schemas/index.ts` (`playerDashboardSchema` is a `z.record` keyed by `levelId`). In `src/hooks/api/index.ts`, `usePlayerDashboard(userId)` uses `staleTime: 60_000` (enabled when `userId` is truthy), and `useLevelScoreDistribution(levelId, isStatsOpen)` enables on demand.

## React Components

- **Styling & Theme**: Merge conditional classes with `cn()` (`src/utils/cn.ts`) using `tokyo-night-storm` palette tokens and semantic status classes (`text-green-400`).
- **Context**: Read context with React 19's `use(Context)`.
- **Editor Remounts**: Pass `key={levelId}` (`<VimEditor key={levelId} />`) so CodeMirror remounts cleanly on level change.
- **Animations**: Build transitions with `motion` (Framer Motion v12), following `CrtEffect`.

## Zustand Store

- **Single Store (`src/store/useGameStore.ts`)**: Uses `devtools` middleware exclusively; persist UI preferences (such as collapsed categories) directly in `localStorage`.
- **Access**: Pass slice selectors in components (`useGameStore((s) => s.currentLevel)`) and read synchronously via `useGameStore.getState()` in tests and actions.

## Testing

- **Layout & Global Setup (`tests/setup.ts`)**: Co-locate unit tests in `src/**/__tests__/*.test.ts(x)` and integration tests in `tests/integration/*.test.tsx`. `tests/setup.ts` pre-configures `@testing-library/jest-dom/vitest`, silent logging, rejecting `fetch`, mocked `src/lib/supabase/client`, in-memory `localStorage`, and CodeMirror DOM range/rect polyfills.
- **Store Reset**: Initialize clean store state in `beforeEach` via `setLevel` (runs full level setup) and restore flags via `setState` in `afterEach`:
  ```typescript
  beforeEach(() => useGameStore.getState().setLevel(LEVELS[0].id));
  afterEach(() => useGameStore.setState({ isPoweredOff: false }));
  ```
- **Assertions, Router, & CodeMirror**: Assert game state against `useGameStore.getState()`, wrap direct store mutations in `act()`, render `useLevelId` (`nuqs`) components with `renderWithRouter(<Component />)` (`tests/helpers/renderWithRouter.tsx`), and verify CodeMirror behavior through component integration tests.
- **API Singleton Mocking**: Configure `vi.mocked(getSupabaseClient)` first, then dynamically import the API module:
  ```typescript
  vi.mocked(getSupabaseClient).mockReturnValue(mockClient);
  const { getPlayerDashboard } = await import("../index");
  ```
