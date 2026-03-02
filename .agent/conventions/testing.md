# Testing Conventions

## Environment

Tests run in jsdom environment via Vitest.

## Store State Reset

Always reset store state in `beforeEach` to prevent test pollution:

```typescript
beforeEach(() => {
  useGameStore.getState().reset();
});
```

## JSDOM Mocks

Mock missing JSDOM APIs in `tests/setup.ts`. Example:

```typescript
document.createRange = () => ({
  setStart: () => {},
  setEnd: () => {},
  // ...
});
```

## React State Updates

Wrap React state updates in `act()` to avoid warnings. Note that `userEvent` actions are already wrapped in `act()` internally by Testing Library, but manual store updates or complex async flows may still need it:

```typescript
import { act } from "@testing-library/react";

await act(async () => {
  // Manual state updates or non-userEvent triggers
  useGameStore.getState().setLevel("next-level");
});
```

## User Interactions

Use `userEvent.setup()` for realistic user interaction simulation:

```typescript
const user = userEvent.setup();
await user.click(button);
await user.type(input, "hello");
```

## Store vs DOM Assertions

Prefer testing through store state over DOM assertions when possible. Store state is the source of truth:

```typescript
// Preferred
expect(useGameStore.getState().currentLevel).toBe(2);

// Less preferred (but sometimes necessary)
expect(screen.getByText("Level 2")).toBeInTheDocument();
```

## CodeMirror Testing

CodeMirror is complex. Prefer integration tests over unit tests for editor-related code. Test real component behavior, not mocks.
