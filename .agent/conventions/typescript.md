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

Use `satisfies` to validate arrays against type definitions while preserving literal types.

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
