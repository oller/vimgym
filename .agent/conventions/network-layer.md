# Network Layer & Data Patterns

The application uses a **Supabase-first** architecture with a heavily optimized network layer.

## Core Philosophy

1. **RPC-First**: Prefers unified RPC calls over multiple REST-like queries to minimize round-trips.
2. **Strict Validation**: All I/O is validated with Zod schemas at the boundary.
3. **Real-Time Views**: Uses standard Postgres Views (not Materialized) for instant stats updates without app-layer aggregation.

## Supabase Client (`src/lib/supabase/client.ts`)

Singleton pattern. Returns `null` if env vars are not set — all callers must handle a `null` client gracefully (feature-flag pattern):

```typescript
const client = getSupabaseClient();
if (!client) return {};
```

Typed with the generated `Database` type:

```typescript
createClient<Database, "public">(url, key)
```

Sessions are disabled (`persistSession: false`, `autoRefreshToken: false`) — the app uses anonymous user IDs, not Supabase Auth.

## RPC Functions (`src/api/index.ts`)

### `getPlayerDashboard(userId: string)`

```typescript
client.rpc("get_player_dashboard", { p_user_id, p_level_ids })
```

Returns `{}` on missing client, on Supabase error, or on validation failure — **never throws**.

### `getLevelScoreDistribution(levelId: string)`

```typescript
client.rpc("get_level_score_distribution", { p_level_id })
```

Returns `[]` on missing client. **Throws** on Supabase error.

### `submitCompletionAnalytics` (`src/lib/analytics.ts`)

```typescript
client.rpc("submit_level_completion", { p_user_id, p_level_id, p_keystrokes_count, p_keystrokes })
```

Fire-and-forget. All errors are caught silently. Called from the store on level completion.

## Zod Schemas (`src/schemas/index.ts`)

**Single source of truth**: Types are derived from Zod schemas, not manually defined interfaces.

The dashboard schema is a **record keyed by level ID**, not a flat object:

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

## React Query Hooks (`src/hooks/api/index.ts`)

Wrap the API layer for use in components:

```typescript
// Enabled only when userId is present
const { data: dashboard } = usePlayerDashboard(userId);

// Enabled on demand (e.g., when a stats panel is open)
const { data: distribution } = useLevelScoreDistribution(levelId, isStatsOpen);
```

Default `staleTime` for dashboard queries is `60_000` ms.

## Database Views

- **`level_stats`**: A standard VIEW that aggregates global performance in real-time.
- **`view_user_level_bests`**: A helper VIEW to quickly find a user's best performance per level.

## Testing

- Tests mock the Supabase client wholesale in `tests/setup.ts`.
- Individual API tests override the mock per test using `vi.mocked(getSupabaseClient).mockReturnValue(mockClient)`.
- Because the Supabase client is a module-level singleton, API tests must use dynamic `await import("../index")` to get a fresh module after mock setup.
