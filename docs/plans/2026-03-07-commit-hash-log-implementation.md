# Commit Hash Log Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Expose the currently deployed version of the application as a git commit hash in the browser console.

**Architecture:** Inject the Netlify `COMMIT_REF` environment variable into the Vite build via `define`. Log it in the main entry point.

**Tech Stack:** Vite, React, TypeScript

---

### Task 1: Update Vite config

**Files:**
- Modify: `vite.config.ts`

**Step 1: Inject global variable**
Modify `vite.config.ts` to include the `define` block with the commit hash logic.

```typescript
import tailwindcss from "@tailwindcss/vite";
import { varlockVitePlugin } from "@varlock/vite-integration";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const commitHash = process.env.COMMIT_REF || 'dev';

// https://vite.dev/config/
export default defineConfig({
  define: {
    __COMMIT_HASH__: JSON.stringify(commitHash),
  },
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler", { target: "19" }]],
      },
    }),
    tailwindcss(),
    varlockVitePlugin(),
  ],
});
```

**Step 2: Commit**
```bash
git add vite.config.ts
git commit -m "build: inject commit hash into vite config"
```

---

### Task 2: TypeScript definitions

**Files:**
- Create/Modify: `src/vite-env.d.ts`

**Step 1: Declare global variable**
Append to `src/vite-env.d.ts` (create if it doesn't exist):

```typescript
/// <reference types="vite/client" />
declare const __COMMIT_HASH__: string;
```

**Step 2: Run type check**
Run: `pnpm tsc`
Expected: PASS

**Step 3: Commit**
```bash
git add src/vite-env.d.ts
git commit -m "types: add __COMMIT_HASH__ global declaration"
```

---

### Task 3: Log in app entry

**Files:**
- Modify: `src/main.tsx`

**Step 1: Add console log**
Add `console.log("Deployed version:", __COMMIT_HASH__);` at the top of the file, right after imports.

```typescript
// ... existing imports ...
import './index.css';

console.log("Deployed version:", __COMMIT_HASH__);

// ... existing render logic ...
```

**Step 2: Verify build**
Run: `pnpm build`
Expected: PASS with no errors.

**Step 3: Commit**
```bash
git add src/main.tsx
git commit -m "feat: log deployed commit hash on startup"
```