# VimGym

Interactive Vim training game where users complete levels by transforming text using Vim motions.

## Commands

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm tsc          # Type check
pnpm lint:fix     # Fix linting and formatting issues
pnpm test         # Run all tests
pnpm test <file>  # Run single test file
```

## Key Context

- **Package manager:** pnpm
- **Linter/Formatter:** Biome (run `pnpm lint:fix` before committing)
- **Editor:** CodeMirror with @replit/codemirror-vim
- **State:** Zustand with persistence middleware

## Pre-commit Checklist

1. All tests pass (`pnpm test`)
2. No lint errors (`pnpm lint:fix`)
3. No type errors (`pnpm tsc`)

## Conventions

See [.agent/conventions/](.agent/conventions/) for detailed guidelines:

- [TypeScript](.agent/conventions/typescript.md) - Type patterns specific to this codebase
- [React Components](.agent/conventions/react-components.md) - Component patterns and `cn()` utility
- [Testing](.agent/conventions/testing.md) - Vitest setup, store testing, CodeMirror testing
- [Zustand](.agent/conventions/zustand.md) - Store patterns and persistence
