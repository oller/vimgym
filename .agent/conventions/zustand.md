# Zustand Conventions

## Store Definition

Define stores with typed interface and persist middleware:

```typescript
export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // state and actions
    }),
    {
      name: "game-store",
      partialize: (state) => ({ highScores: state.highScores }),
    }
  )
);
```

## Selective Persistence

Use `partialize` to persist only specific state (e.g., high scores). Avoid persisting transient UI state.

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
