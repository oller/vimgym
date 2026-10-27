# Coding Standards

## vimsplain

1. **Branch**: Work on a feature branch off `main`.
2. **Command Tables**: Run `pnpm --filter vimsplain gen:commands` and commit the updated [`packages/vimsplain/README.md`](packages/vimsplain/README.md) tables whenever adding, removing, or renaming an entry in `NORMAL_COMMANDS` (`src/handlers/normal.ts`) or `VISUAL_OPERATORS` (`src/handlers/visual.ts`).
3. **Coverage**: Keep `pnpm --filter vimsplain test:coverage` at ≥90% lines/functions and ≥80% branches.
4. **Changeset**: Run `pnpm changeset` (`vimsplain`, `patch` / `minor` / `major`) and commit `.changeset/*.md`; leave `changeset version` and npm publishing to CI on merge.
- **Reference**: Read [`packages/vimsplain/README.md`](packages/vimsplain/README.md) when modifying parser architecture, handlers, or command table markers.

## TypeScript & Env

- **Database Types (`src/types/database.ts`)**: Regenerate via `pnpm types:gen` and type rows with `Tables<"level_completions">` / `TablesInsert<"level_completions">`.
- **Environment (`src/env.ts`)**: Read env vars through the typed `env` export (`varlock` schema in `env.d.ts`).

## Network Layer

- **Schemas (`src/schemas/index.ts`)**: Validate RPC boundary I/O with Zod and derive types via `z.infer<typeof schema>` (`playerDashboardSchema` is a `z.record` keyed by `levelId`).
- **Offline Fallback (`src/lib/supabase/client.ts`)**: Handle a `null` return from `getSupabaseClient()` as a feature-flag fallback in every caller.
- **RPC Contracts (`src/api/index.ts`, `src/lib/analytics.ts`)**: Return `{}` from `getPlayerDashboard(userId)` on `null` client, RPC error, or Zod failure; return `[]` from `getLevelScoreDistribution(levelId)` on `null` client and throw on Supabase error; keep `submitCompletionAnalytics` fire-and-forget (swallowing errors silently).

## React & State

- **Components (`src/components/`)**: Read context with React 19 `use(Context)` and pass `key={levelId}` (`<VimEditor key={levelId} />`) so CodeMirror remounts cleanly on level change.
- **Store (`src/store/useGameStore.ts`)**: Keep `devtools` as the sole store middleware and persist UI preferences (such as collapsed categories) directly in `localStorage`.

## Testing

- **Preloaded Setup (`tests/setup.ts`)**: Rely on `tests/setup.ts` for `@testing-library/jest-dom/vitest`, silent logging, rejecting `fetch`, mocked `src/lib/supabase/client`, in-memory `localStorage`, and CodeMirror DOM range/rect polyfills.
- **Store Reset**: Initialize clean store state in `beforeEach(() => useGameStore.getState().setLevel(LEVELS[0].id))` and restore flags in `afterEach(() => useGameStore.setState({ isPoweredOff: false }))`.
- **Assertions, Router, & CodeMirror**: Assert game state against `useGameStore.getState()`, wrap direct store mutations in `act()`, render `useLevelId` (`nuqs`) components with `renderWithRouter(<Component />)` (`tests/helpers/renderWithRouter.tsx`), and verify CodeMirror behavior through component integration tests (`tests/integration/`).
- **API Singleton Mocking**: Configure `vi.mocked(getSupabaseClient).mockReturnValue(mockClient)` first, then dynamically import the module under test (`const { getPlayerDashboard } = await import("../index")`).
