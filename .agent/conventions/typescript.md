# TypeScript Conventions

## Type-only Imports

Use `import type` for type-only imports:

```typescript
import type { Level } from "../data/levels";
```

## Const Assertions

Use `as const` for arrays that should be treated as readonly tuples and object literals that should preserve literal types:

```typescript
const MODES = ["normal", "insert", "visual"] as const;
```

Use `satisfies` to validate arrays against type definitions while preserving literal types:

```typescript
export const LEVELS = [...] satisfies Level[];
```

## Global Window Properties

Use `@ts-expect-error` for intentional type errors when extending global objects:

```typescript
// @ts-expect-error - adding custom property for debugging
window.__DEBUG_STORE__ = store;
```

## Constants

Use UPPER_SNAKE_CASE for global constants:

```typescript
export const LEVELS: Level[] = [...]
```

## Generated Database Types

`src/types/database.ts` is auto-generated via `pnpm types:gen`. Use the helper types rather than raw table/view types directly:

```typescript
import type { Tables, TablesInsert } from "../types/database";

type LevelCompletion = Tables<"level_completions">;
type NewCompletion = TablesInsert<"level_completions">;
```

Do not manually edit `database.ts`.

## Environment Variables

Env vars are typed via `varlock` and declared in `env.d.ts`. Always access them through the typed schema, not raw `import.meta.env`:

```typescript
// Good
import { env } from "./env";
const url = env.VITE_SUPABASE_URL;

// Avoid - no type safety or validation
const url = import.meta.env.VITE_SUPABASE_URL;
```
