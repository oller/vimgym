# Vimsplain Testing & Architecture Upgrade Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Establish an impenetrable testing shield around the existing Vimsplain regex parser via property-based and integration testing, then safely refactor it to a robust Mode-Based Handler architecture.

**Architecture:** Phase 1 uses `fast-check` and headless CodeMirror to bulletproof the current parser. Phase 2 splits the monolithic `while` loop in `vimsplain.ts` into isolated state handlers (`NormalModeParser`, `VisualModeParser`, `InsertModeParser`, `ExModeParser`) to easily support complex commands without regressions.

**Tech Stack:** TypeScript, Vitest, `fast-check`, `@replit/codemirror-vim`, CodeMirror 6.

---

### Task 1: Setup Property-Based Testing (Fuzzing) Infrastructure

**Files:**
- Modify: `packages/vimsplain/package.json`
- Create: `packages/vimsplain/tests/fuzz.test.ts`

**Step 1: Install `fast-check`**
```bash
pnpm --filter vimsplain add -D fast-check
```

**Step 2: Write the initial fuzzing test framework**
```typescript
// packages/vimsplain/tests/fuzz.test.ts
import { describe, expect, it } from "vitest";
import * as fc from "fast-check";
import { explainSequence } from "../src/index.js";

describe("vimsplain fuzzing", () => {
  it("never crashes on arbitrary strings", () => {
    fc.assert(
      fc.property(fc.string(), (input) => {
        const result = explainSequence(input);
        expect(result).toBeDefined();
        expect(Array.isArray(result.commands)).toBe(true);
        expect(typeof result.remaining).toBe("string");
      }),
      { numRuns: 1000 }
    );
  });
  
  it("never returns undefined explanations", () => {
    fc.assert(
      fc.property(fc.string(), (input) => {
        const result = explainSequence(input);
        for (const cmd of result.commands) {
          expect(cmd.matched).toBeDefined();
          expect(cmd.explanation).toBeDefined();
          // Explanation should not contain "undefined"
          expect(cmd.explanation).not.toMatch(/undefined/i);
        }
      }),
      { numRuns: 1000 }
    );
  });
});
```

**Step 3: Run the fuzz tests**
Run: `pnpm --filter vimsplain test tests/fuzz.test.ts`
Expected: PASS. If it fails, fix the monolithic parser first.

**Step 4: Commit**
```bash
git add packages/vimsplain/package.json packages/vimsplain/tests/fuzz.test.ts
git commit -m "test(vimsplain): add property-based testing with fast-check"
```

---

### Task 2: Setup Integration Testing Infrastructure

**Files:**
- Modify: `packages/vimsplain/package.json`
- Create: `packages/vimsplain/tests/integration.test.ts`

**Step 1: Install CodeMirror dependencies**
```bash
pnpm --filter vimsplain add -D @codemirror/state @codemirror/view @replit/codemirror-vim
```

**Step 2: Write basic headless CodeMirror test harness**
```typescript
// packages/vimsplain/tests/integration.test.ts
import { describe, expect, it } from "vitest";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { vim } from "@replit/codemirror-vim";
import { explainSequence } from "../src/index.js";

// Helper to simulate typing into CodeMirror
function simulateVim(initialText: string, keys: string) {
  const state = EditorState.create({
    doc: initialText,
    extensions: [vim()],
  });
  // Note: We need JSDOM for EditorView, we'll set that up next
  // This is a placeholder for the harness
  return { finalDoc: initialText }; // mocked for now
}

describe("Integration: Vimsplain vs CodeMirror", () => {
  it("verifies basic explanation against cm state", () => {
      // Placeholder test
      expect(true).toBe(true);
  });
});
```

**Step 3: Update vitest config for JSDOM**
Modify `vitest.config.ts` to include `environment: "jsdom"` if not already present, or specifically for integration tests.

**Step 4: Commit**
```bash
git add packages/vimsplain/package.json packages/vimsplain/tests/integration.test.ts
git commit -m "test(vimsplain): setup codemirror integration test harness"
```

---

### Task 3: Core Architecture Refactor - Types & Mode Enum

**Files:**
- Modify: `packages/vimsplain/src/vimsplain.types.ts`

**Step 1: Define Mode enum and Handler interface**
```typescript
// Add to vimsplain.types.ts
export enum VimMode {
  Normal = "Normal",
  Insert = "Insert",
  Visual = "Visual",
  VisualLine = "VisualLine",
  VisualBlock = "VisualBlock",
  Command = "Command", // Ex mode
  Search = "Search"
}

export type ParsingContext = {
  remaining: string;
  commands: ExplainedCommand[];
  activeMode: VimMode;
  // Mode-specific buffers
  insertBuffer: string;
  exBuffer: string;
  searchBuffer: string;
  searchDirection: "/" | "?";
};
```

**Step 2: Run typecheck**
Run: `pnpm --filter vimsplain typecheck`
Expected: PASS

**Step 3: Commit**
```bash
git add packages/vimsplain/src/vimsplain.types.ts
git commit -m "refactor(vimsplain): add VimMode enum and ParsingContext types"
```

---

### Task 4: Extract Normal Mode Handler

**Files:**
- Create: `packages/vimsplain/src/handlers/normal.ts`
- Modify: `packages/vimsplain/src/vimsplain.ts`

**Step 1: Create Normal Mode Handler**
Move `NORMAL_COMMANDS` array and `parseCommand` logic into `handlers/normal.ts`.
Create function `export function handleNormalMode(context: ParsingContext): void` that processes normal mode commands and mutates `context.activeMode` if it detects insert/visual triggers.

**Step 2: Update `explainSequence`**
Modify `explainSequence` to use a `ParsingContext` object and delegate to `handleNormalMode` when in `VimMode.Normal`.

**Step 3: Run ALL tests to verify zero regressions**
Run: `pnpm --filter vimsplain test`
Expected: PASS (all 300+ unit tests + fuzz tests must pass)

**Step 4: Commit**
```bash
git add packages/vimsplain/src/handlers/normal.ts packages/vimsplain/src/vimsplain.ts
git commit -m "refactor(vimsplain): extract Normal Mode parser"
```

---

### Task 5: Extract Insert, Visual, and Command Handlers

**Files:**
- Create: `packages/vimsplain/src/handlers/insert.ts`
- Create: `packages/vimsplain/src/handlers/visual.ts`
- Create: `packages/vimsplain/src/handlers/command.ts`
- Modify: `packages/vimsplain/src/vimsplain.ts`

**Step 1: Implement Mode Handlers**
Extract the respective `if (inInsertMode)`, `if (inVisualMode)`, `if (inExMode)` blocks from `vimsplain.ts` into their own files.

**Step 2: Wire up main loop**
```typescript
// inside explainSequence loop:
switch(context.activeMode) {
  case VimMode.Normal: handleNormalMode(context); break;
  case VimMode.Insert: handleInsertMode(context); break;
  case VimMode.Visual: 
  case VimMode.VisualLine:
  case VimMode.VisualBlock: handleVisualMode(context); break;
  case VimMode.Command: handleCommandMode(context); break;
  case VimMode.Search: handleSearchMode(context); break;
}
```

**Step 3: Run ALL tests to verify zero regressions**
Run: `pnpm --filter vimsplain test`
Expected: PASS. If this fails, the refactor broke the state machine. Fix before proceeding.

**Step 4: Commit**
```bash
git add packages/vimsplain/src/handlers/*.ts packages/vimsplain/src/vimsplain.ts
git commit -m "refactor(vimsplain): separate all parser modes into dedicated handlers"
```
