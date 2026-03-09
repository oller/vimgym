# Zustand Conventions

## Store Definition

The app has a single store (`src/store/useGameStore.ts`). It uses `devtools` middleware only — there is no `persist` middleware. No state is persisted via Zustand (UI preferences like collapsed categories use `localStorage` directly).

```typescript
export const useGameStore = create<GameState>()(
  devtools((set, get) => ({
    // state and actions
  }))
);
```

## Accessing State

In components (reactive):

```typescript
const currentLevel = useGameStore((state) => state.currentLevel);
```

In tests and non-reactive code (synchronous):

```typescript
const state = useGameStore.getState();
```

## Selectors

Use selectors in components for reactivity. This ensures components re-render only when selected state changes:

```typescript
// Good - component only re-renders when currentLevel changes
const level = useGameStore((state) => state.currentLevel);

// Avoid - component re-renders on any state change
const { currentLevel } = useGameStore();
```

## Resetting State in Tests

Two patterns are used:

```typescript
// Reset via action (preferred — exercises real initialization logic)
beforeEach(() => {
  useGameStore.getState().setLevel(LEVELS[0].id);
});

// Reset specific fields directly via setState (for isolated field tests)
afterEach(() => {
  useGameStore.setState({ isPoweredOff: false });
});
```

Do not call a `reset()` method — no such action exists. Use `setLevel` or `setState` directly.
