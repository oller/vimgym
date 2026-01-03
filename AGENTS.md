# VimGym - Agent Guidelines

This file contains coding conventions and workflows for AI agents working on the VimGym repository.

## Build, Lint, and Test Commands

### Development commands

- `pnpm dev` - Start development server
- `pnpm build` - Build for production (runs TypeScript compiler + Vite)
- `pnpm preview` - Preview production build

### Linting and formatting commands

- `pnpm lint` - Run Biome linter to check for issues
- `pnpm lint:fix` - Automatically fix linting issues
- `pnpm format` - Format code with Biome

### Testing commands

- `pnpm test` - Run all Vitest tests in jsdom environment
- `pnpm test:browser` - Run tests in browser environment
- **Run single test:** `vitest <path-to-test-file>` (e.g., `vitest src/components/VimEditor.test.tsx`)

## Code Style Guidelines

### Formatting (Biome)

- **Indentation:** 2 spaces
- **Quotes:** Double quotes for all JavaScript/TypeScript
- **Import organization:** Auto-organized by Biome (run `pnpm format` before committing)
- **No trailing whitespace** (auto-removed by Biome)

### TypeScript

- Strict mode is enabled
- Use `import type` for type-only imports
- Use `as const` for arrays that should be treated as readonly tuples and object literals that should preserve literal types
- Use `satisfies` to validate arrays against type definitions
- Use `@ts-expect-error` for intentional type errors (e.g., global window properties)

### Naming Conventions

- **Components:** PascalCase (e.g., `VimEditor`, `GoalDisplay`)
- **Hooks:** camelCase with `use` prefix (e.g., `useGameStore`, `useEffect`)
- **Functions/Utils:** camelCase (e.g., `cn`, `getLevel`, `updateText`)
- **Constants:** UPPER_SNAKE_CASE for global constants (e.g., `LEVELS`)
- **Test files:** Same name as source file with `.test.ts` or `.test.tsx` suffix

### Imports

- Use verbatim module syntax (no .js extensions needed)
- External dependencies first, then internal modules (auto-organized by Biome)
- Type imports: `import type { X } from "..."`

### Package Management

- Use `pnpm` as the package manager when adding or removing dependencies

### Component Structure

- Functional components with hooks only
- Use `useCallback` for event handlers and functions passed to children
- Use `useRef` for values that need to persist across renders without causing re-renders
- Prefer `cn()` utility for conditional Tailwind classes
- Add `data-testid` attributes to elements for testing

### State Management (Zustand)

- Store defined with `create<Interface>()(persist(...))`
- Use `getState()` for synchronous access in tests and non-reactive code
- Use selectors in components for reactivity: `useGameStore((state) => state.currentLevel)`
- Persist middleware stores only high scores (partialize for selective persistence)

### React Best Practices

- Always include dependency arrays in `useEffect`, `useCallback`, `useMemo`
- Use refs for values needed in event listeners to avoid stale closures
- Cleanup event listeners and timers in `useEffect` return function
- Use capture phase (`true` parameter) for event listeners when intercepting events
- Use `key` prop when components need to remount on value change

### Testing

- Use Vitest with jsdom environment
- Test files use `.test.ts` or `.test.tsx` suffix
- Use `describe` blocks to group related tests
- Use `beforeEach` to reset state (especially store state)
- Mock JSDOM APIs in `tests/setup.ts` (e.g., `document.createRange`)
- Wrap React state updates in `act()` from `@testing-library/react` to avoid warnings
- Test user interactions with `userEvent.setup()` from `@testing-library/user-event`
- Prefer testing through store state over DOM assertions when possible
- Integration tests should test real component behavior, not mocks

### Error Handling

- Use optional chaining (`?.`) for potentially null/undefined access
- Use nullish coalescing (`??`) for default values
- Ensure you address all linting errors, it is not acceptable to ignore them

### CSS/Tailwind

- Use `cn()` utility for conditional classes (merges clsx + tailwind-merge)
- Follow existing theme colors (tokyo-night-storm theme)
- Use semantic Tailwind classes (e.g., `text-green-400` for success states)

## Project Context

VimGym is an interactive Vim training game. Users complete levels by transforming text using Vim motions.

- **Tech Stack:** React 19, TypeScript, Zustand, Vite, Vitest, Biome, Tailwind CSS
- **Key Libraries:** CodeMirror (editor), @tanstack/react-router, @replit/codemirror-vim
- **Testing:** Vitest + React Testing Library + user-event
- **State:** Zustand with persistence middleware for high scores

## Important Notes

- All tests must pass before committing changes
- Run `pnpm lint:fix` and `pnpm format` before committing
- New features should include tests
- CodeMirror is complex - prefer integration tests over unit tests for editor-related code
- Store state is the source of truth for testing application behavior
