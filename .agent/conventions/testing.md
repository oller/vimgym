# Testing Conventions

## Environment

Tests run in jsdom environment via Vitest. Config in `vitest.config.ts`, global setup in `tests/setup.ts`.

## Test File Layout

- Unit/component tests: `src/**/__tests__/*.test.ts(x)` (co-located with source)
- Integration tests: `tests/integration/*.test.tsx`

## Global Test Setup (`tests/setup.ts`)

The setup file handles several critical mocks automatically — do not duplicate these in individual test files:

- Imports `@testing-library/jest-dom/vitest` for DOM matchers
- Sets logger to `"silent"` (suppresses all output)
- Stubs `fetch` globally to reject (prevents any real network calls)
- Mocks the entire `src/lib/supabase/client` module
- Mocks `localStorage` with an in-memory implementation
- Patches `document.createRange` and `getBoundingClientRect` for CodeMirror layout

## Store State Reset

Always reset store state in `beforeEach` to prevent test pollution. Use `setLevel`, not a non-existent `reset()` method:

```typescript
beforeEach(() => {
  useGameStore.getState().setLevel(LEVELS[0].id);
});
```

For resetting specific fields directly:

```typescript
afterEach(() => {
  useGameStore.setState({ isPoweredOff: false });
});
```

## Rendering with Router

Integration tests require `<NuqsAdapter>` for components that use `useLevelId` (URL state). Use the shared `renderWithRouter` helper:

```typescript
import { renderWithRouter } from "../helpers/renderWithRouter";

renderWithRouter(<MyComponent />);
```

## API Tests

The Supabase client is a module-level singleton. To get a fresh module after mock setup, use dynamic imports:

```typescript
vi.mock("../../lib/supabase/client");

beforeEach(async () => {
  vi.mocked(getSupabaseClient).mockReturnValue(mockClient);
  // Re-import after mock is set up
  const { getPlayerDashboard } = await import("../index");
  // ...
});
```

## React State Updates

Wrap React state updates in `act()` to avoid warnings. Note that `userEvent` actions are already wrapped in `act()` internally by Testing Library, but manual store updates or complex async flows may still need it:

```typescript
import { act } from "@testing-library/react";

await act(async () => {
  // Manual state updates or non-userEvent triggers
  useGameStore.getState().setLevel("some-level");
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
expect(useGameStore.getState().isCompleted).toBe(true);

// Less preferred (but sometimes necessary)
expect(screen.getByText("Level complete")).toBeInTheDocument();
```

## CodeMirror Testing

CodeMirror is complex. Prefer integration tests over unit tests for editor-related code. Test real component behavior, not mocks.
