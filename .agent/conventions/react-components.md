# React Component Conventions

## The `cn()` Utility

Use `cn()` for conditional Tailwind classes. It merges clsx + tailwind-merge:

```typescript
import { cn } from "../utils/cn";

<div className={cn("base-class", isActive && "active-class")} />
```

## Test IDs

Add `data-testid` attributes to elements that need to be queried in tests:

```tsx
<button data-testid="submit-button">Submit</button>
```

## Event Handlers

Use `useCallback` for event handlers passed to children to prevent unnecessary re-renders.

## Refs for Event Listeners

Use refs for values needed in event listeners to avoid stale closures:

```typescript
const valueRef = useRef(value);
useEffect(() => {
  valueRef.current = value;
}, [value]);

useEffect(() => {
  const handler = () => console.log(valueRef.current);
  window.addEventListener("resize", handler);
  return () => window.removeEventListener("resize", handler);
}, []);
```

## Event Capture Phase

Use capture phase (`true` parameter) when intercepting events before they reach their target:

```typescript
element.addEventListener("keydown", handler, true);
```

## Forcing Remounts

Use `key` prop when components need to remount on value change:

```tsx
<VimEditor key={levelId} />
```

## Context

Use React 19's `use()` API instead of `useContext()`:

```typescript
// context definition
export const LevelSelectorContext = createContext<LevelSelectorContextValue | null>(null);

// consumption
const ctx = use(LevelSelectorContext);
```

## Animations

Use `motion` (Framer Motion v12) for animations. Follow existing patterns in `CrtEffect` and related components.

## Theme

Follow existing tokyo-night-storm theme colors. Use semantic Tailwind classes (e.g., `text-green-400` for success states).
