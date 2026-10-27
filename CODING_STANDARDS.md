# Coding Standards

## TypeScript

### Generated Database Types (`src/types/database.ts`)

`src/types/database.ts` is auto-generated via `pnpm types:gen`. Regenerate via `pnpm types:gen` rather than editing `database.ts` by hand, and use the helper types (`Tables`, `TablesInsert`) rather than raw table/view types directly:

```typescript
import type { Tables, TablesInsert } from "../types/database";

type LevelCompletion = Tables<"level_completions">;
type NewCompletion = TablesInsert<"level_completions">;
```

### Environment Variables (`src/env.ts`)

Env vars are typed via `varlock` and declared in `env.d.ts`. Access them through the typed `env` export in `src/env.ts`:

```typescript
import { env } from "./env";
const url = env.VITE_SUPABASE_URL;
```

---

## Network Layer & Data Patterns

The application uses a **Supabase-first** architecture with an RPC-first network layer.

### Core Philosophy

1. **RPC-First**: Prefer unified RPC calls over multiple REST-like queries to minimize round-trips.
2. **Strict Validation**: Validate all I/O with Zod schemas at the boundary.
3. **Real-Time Views**: Use standard Postgres Views (`level_stats`, `view_user_level_bests`) rather than Materialized Views for instant stats updates without app-layer aggregation.

### Supabase Client (`src/lib/supabase/client.ts`)

Singleton pattern typed with `createClient<Database, "public">(url, key)`. Sessions are disabled (`persistSession: false`, `autoRefreshToken: false`) because the app uses anonymous user IDs rather than Supabase Auth.

`getSupabaseClient()` returns `null` when env vars are unset — callers must handle a `null` client gracefully (feature-flag pattern):

```typescript
const client = getSupabaseClient();
if (!client) return {};
```

### RPC Functions (`src/api/index.ts` & `src/lib/analytics.ts`)

- **`getPlayerDashboard(userId: string)`**: Calls `client.rpc("get_player_dashboard", { p_user_id, p_level_ids })`. Returns `{}` on missing client, Supabase error, or validation failure (never throws).
- **`getLevelScoreDistribution(levelId: string)`**: Calls `client.rpc("get_level_score_distribution", { p_level_id })`. Returns `[]` on missing client; **throws** on Supabase error.
- **`submitCompletionAnalytics`** (`src/lib/analytics.ts`): Calls `client.rpc("submit_level_completion", { p_user_id, p_level_id, p_keystrokes_count, p_keystrokes })`. Fire-and-forget from the store on level completion; all errors are caught silently.

### Zod Schemas (`src/schemas/index.ts`)

Derive TypeScript types from Zod schemas (`z.infer<typeof schema>`) as the single source of truth.

`playerDashboardSchema` is a **record keyed by level ID**, not a flat object:

```typescript
export const playerDashboardSchema = z.record(
  z.string(), // key = level id
  z.object({
    user: z.object({
      best: z.number().nullable(),
      percentile: z.number().nullable(),
    }),
    global: z.object({
      best: z.number().nullable(),
      average: z.number().nullable(),
      completions: z.number().nullable(),
      best_score_log: z.array(z.string()).nullable(),
    }),
  }),
);

export type PlayerDashboard = z.infer<typeof playerDashboardSchema>;
```

### React Query Hooks (`src/hooks/api/index.ts`)

Default `staleTime` for dashboard queries is `60_000` ms:

```typescript
// Enabled only when userId is present
const { data: dashboard } = usePlayerDashboard(userId);

// Enabled on demand (e.g., when a stats panel is open)
const { data: distribution } = useLevelScoreDistribution(levelId, isStatsOpen);
```

---

## React Components

### Class Merging (`src/utils/cn.ts`)

Use `cn()` (`clsx` + `tailwind-merge`) for conditional Tailwind classes:

```typescript
import { cn } from "../utils/cn";

<div className={cn("base-class", isActive && "active-class")} />
```

### Context Consumption

Consume React context with React 19's `use()` API:

```typescript
export const LevelSelectorContext = createContext<LevelSelectorContextValue | null>(null);
const ctx = use(LevelSelectorContext);
```

### Editor Remounts, Animations, and Theme

- **Editor remounts**: Pass `key={levelId}` (`<VimEditor key={levelId} />`) so CodeMirror remounts cleanly when the level changes.
- **Animations**: Use `motion` (Framer Motion v12), following patterns in `CrtEffect`.
- **Theme**: Use `tokyo-night-storm` palette tokens and semantic Tailwind classes (e.g., `text-green-400` for success states).

---

## Zustand State Management

### Store Architecture (`src/store/useGameStore.ts`)

The app has a single store (`useGameStore`) using `devtools` middleware only (no `persist` middleware — UI preferences such as collapsed categories use `localStorage` directly).

```typescript
// In components (always select a slice)
const currentLevel = useGameStore((state) => state.currentLevel);

// In tests and non-reactive code
const state = useGameStore.getState();
```

---

## Testing

### Layout & Global Setup (`tests/setup.ts`)

Tests run in jsdom via Vitest (`vitest.config.ts`).
- Unit/component tests: `src/**/__tests__/*.test.ts(x)` (co-located with source)
- Integration tests: `tests/integration/*.test.tsx`

`tests/setup.ts` automatically configures the following for every test file:
- Imports `@testing-library/jest-dom/vitest`
- Sets logger to `"silent"`
- Stubs `fetch` globally to reject
- Mocks `src/lib/supabase/client`
- Mocks `localStorage` with an in-memory implementation
- Patches `document.createRange` and `getBoundingClientRect` for CodeMirror layout

### Store State Reset

Reset store state in `beforeEach` via `setLevel` (which exercises real initialization logic) or `setState` for isolated fields (the store has no `reset()` action):

```typescript
beforeEach(() => {
  useGameStore.getState().setLevel(LEVELS[0].id);
});

afterEach(() => {
  useGameStore.setState({ isPoweredOff: false });
});
```

### Router & URL State (`renderWithRouter`)

Components that read `useLevelId` (URL state via `nuqs`) require `<NuqsAdapter>`. Render them with `renderWithRouter`:

```typescript
import { renderWithRouter } from "../helpers/renderWithRouter";

renderWithRouter(<MyComponent />);
```

### API Singleton Mocking

Because the Supabase client is a module-level singleton mocked in `tests/setup.ts`, override `getSupabaseClient` per test and dynamically `await import("../index")` to get a fresh API module:

```typescript
vi.mock("../../lib/supabase/client");

beforeEach(async () => {
  vi.mocked(getSupabaseClient).mockReturnValue(mockClient);
  const { getPlayerDashboard } = await import("../index");
});
```

### Store-First Assertions, `act()`, and CodeMirror

- **Store-first assertions**: Assert against `useGameStore.getState()` as the source of truth (`expect(useGameStore.getState().isCompleted).toBe(true)`) over DOM text queries when possible.
- **Manual store updates**: Wrap direct `useGameStore` mutations outside `userEvent` in `act()`.
- **CodeMirror**: Test editor behavior via real component integration tests rather than unit-testing mocked CodeMirror internals.
