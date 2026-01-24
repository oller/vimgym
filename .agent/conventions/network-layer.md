# Network Layer & Data Patterns

The application uses a **Supabase-first** architecture with a heavily optimized network layer.

## Core Philosophy

1.  **RPC-First**: Prefers unified RPC calls over multiple REST-like queries to minimize round-trips.
2.  **Strict Validation**: All I/O is validated with Zod schemas at the boundary.
3.  **Real-Time Views**: Uses standard Postgres Views (not Materialized) for instant stats updates without app-layer aggregation.

## Key Components

### 1. Unified Dashboard RPC
- **Function**: `get_player_dashboard(p_user_id)`
- **Returns**: Nested JSON with `user` (personal bests) and `global` (averages/completions).

### 2. Zod Schemas (`src/schemas/index.ts`)
- **Single Source of Truth**: Types are derived from Zod schemas, not manually defined interfaces.
- **Strict UUIDs**: Requires valid v4 UUIDs (regex checked).
- **Nested Structure**: dashboard data conforms to `{ user: {...}, global: {...} }`.

### 3. Database Views
- **`level_stats`**: A standard VIEW that aggregates global performance in real-time.
- **`view_user_level_bests`**: A helper VIEW to quickly find a user's best performance per level.

## Testing
- Tests mock the Supabase client directly.
- **Crucial**: Mock UUIDs in tests MUST be valid v4 UUIDs (e.g. `...-4xxx-...`) to pass Zod validation.
