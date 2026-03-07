# Commit Hash Log Design

## Purpose
Expose the currently deployed version of the application as a git commit hash in the browser console. This helps identify which specific version is running in production (deployed on Netlify) or locally during development.

## Approach: Config Approach (Auto Netlify Var)
Netlify automatically exposes the `COMMIT_REF` environment variable during the build step. We will inject this directly into the Vite build process.

## Implementation Details

1. **Vite Configuration (`vite.config.ts`)**
   - Read the commit hash from `process.env.COMMIT_REF`.
   - Provide a fallback string `'dev'` if it's not present (e.g. during local development).
   - Use Vite's `define` option to inject `__COMMIT_HASH__` as a global variable replacing occurrences at build time.

2. **TypeScript Declarations (`src/vite-env.d.ts` or similar)**
   - Add `declare const __COMMIT_HASH__: string;` so TypeScript doesn't complain when using the global variable. (Will create `src/vite-env.d.ts` if it doesn't exist).

3. **App Entry (`src/main.tsx`)**
   - Add `console.log("Deployed version:", __COMMIT_HASH__)` at the top level of the entry point file.

## Trade-offs
- No need to run `git rev-parse` locally, meaning faster dev builds and no reliance on a local `.git` directory.
- Requires reliance on the Netlify platform providing `COMMIT_REF`. If deployed elsewhere, this variable must be set manually.