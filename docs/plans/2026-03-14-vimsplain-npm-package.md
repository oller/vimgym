# vimsplain npm Package Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extract `vimsplain` from the vimgym app into a standalone, published npm package with expanded command coverage, a generated README, Changesets versioning, and GitHub Actions CI/CD.

**Architecture:** pnpm workspace monorepo — app stays at repo root, `packages/vimsplain/` added alongside. The app imports via `workspace:*` during development. `tsup` builds ESM + `.d.ts`. Changesets + GitHub Actions handles version management and automated publishing.

**Tech Stack:** pnpm workspaces, tsup, Vitest (no jsdom), Changesets, GitHub Actions, Biome

---

## Task 1: Scaffold the pnpm workspace

**Files:**
- Create: `pnpm-workspace.yaml`
- Modify: (none yet)

**Step 1: Create pnpm-workspace.yaml at repo root**

```yaml
# pnpm-workspace.yaml
packages:
  - "."
  - "packages/*"
```

**Step 2: Verify pnpm recognizes the workspace**

Run: `pnpm install`
Expected: No errors. The workspace root is recognized.

**Step 3: Commit**

```bash
git add pnpm-workspace.yaml
git commit -m "chore: add pnpm workspace config"
```

---

## Task 2: Scaffold the vimsplain package directory

**Files:**
- Create: `packages/vimsplain/package.json`
- Create: `packages/vimsplain/tsconfig.json`
- Create: `packages/vimsplain/tsup.config.ts`
- Create: `packages/vimsplain/vitest.config.ts`
- Create: `packages/vimsplain/src/` (empty dir)
- Create: `packages/vimsplain/tests/` (empty dir)

**Step 1: Create the package directory structure**

```bash
mkdir -p packages/vimsplain/src packages/vimsplain/tests
```

**Step 2: Create packages/vimsplain/package.json**

```json
{
  "name": "vimsplain",
  "version": "0.1.0",
  "description": "Parse and explain Vim keystroke sequences",
  "type": "module",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "files": ["dist", "README.md"],
  "sideEffects": false,
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "test": "vitest",
    "test:run": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "keywords": ["vim", "vim-motions", "vim-commands", "explainer", "parser", "education"],
  "license": "MIT",
  "devDependencies": {
    "tsup": "^8.5.0",
    "typescript": "~5.9.3",
    "vitest": "^4.0.17"
  }
}
```

**Step 3: Create packages/vimsplain/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

**Step 4: Create packages/vimsplain/tsup.config.ts**

```ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: true,
});
```

**Step 5: Create packages/vimsplain/vitest.config.ts**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
  },
});
```

Note: No `jsdom` needed — vimsplain is pure functions, no DOM.

**Step 6: Install devDependencies into the package**

```bash
pnpm --filter vimsplain install
```

Expected: `tsup`, `typescript`, `vitest` installed in `packages/vimsplain/node_modules/`.

**Step 7: Commit**

```bash
git add packages/vimsplain/
git commit -m "chore: scaffold vimsplain package structure"
```

---

## Task 3: Move source files into the package

**Files:**
- Create: `packages/vimsplain/src/vimsplain.types.ts` (moved from `src/utils/vimsplain.types.ts`)
- Create: `packages/vimsplain/src/vimsplain.ts` (moved from `src/utils/vimsplain.ts`)
- Create: `packages/vimsplain/src/index.ts` (new public re-export)
- Create: `packages/vimsplain/tests/vimsplain.test.ts` (moved from `src/utils/__tests__/vimsplain.test.ts`)
- Delete: `src/utils/vimsplain.py`
- Delete: `src/utils/index.txt`

**Step 1: Copy vimsplain.types.ts into the package**

Copy `src/utils/vimsplain.types.ts` to `packages/vimsplain/src/vimsplain.types.ts`.
No changes to content needed.

**Step 2: Copy vimsplain.ts into the package**

Copy `src/utils/vimsplain.ts` to `packages/vimsplain/src/vimsplain.ts`.
Update the import at the top:

Change:
```ts
import type {
  CommandDefinition,
  ExplainedCommand,
  ExplainResult,
} from "./vimsplain.types";
import { SPECIAL_KEYS } from "./vimsplain.types";
```

To (same relative path, no change needed — files are siblings in `src/`):
```ts
import type {
  CommandDefinition,
  ExplainedCommand,
  ExplainResult,
} from "./vimsplain.types.js";
import { SPECIAL_KEYS } from "./vimsplain.types.js";
```

Note: The `.js` extension is required for ESM with `"moduleResolution": "bundler"` — tsup handles this correctly during build.

**Step 3: Create packages/vimsplain/src/index.ts**

```ts
// Public API
export {
  explainSequence,
  formatExplanation,
  summarizeSequence,
} from "./vimsplain.js";

// Types
export type {
  CommandDefinition,
  ExplainedCommand,
  ExplainResult,
} from "./vimsplain.types.js";

// Constants (used by consumers like keyboard.ts)
export { MODIFIER_KEY_MAP, SPECIAL_KEYS } from "./vimsplain.types.js";
```

**Step 4: Copy the test file into the package**

Copy `src/utils/__tests__/vimsplain.test.ts` to `packages/vimsplain/tests/vimsplain.test.ts`.
Update imports:

Change:
```ts
import {
  explainSequence,
  formatExplanation,
  summarizeSequence,
} from "../vimsplain";
import { SPECIAL_KEYS } from "../vimsplain.types";
```

To:
```ts
import {
  explainSequence,
  formatExplanation,
  summarizeSequence,
  SPECIAL_KEYS,
} from "../src/index.js";
```

**Step 5: Run tests in the package to confirm they pass**

Run: `pnpm --filter vimsplain test:run`
Expected: All tests pass (same 849-line suite).

**Step 6: Delete the Python reference files from the app**

```bash
rm src/utils/vimsplain.py src/utils/index.txt
```

**Step 7: Commit**

```bash
git add packages/vimsplain/src/ packages/vimsplain/tests/
git rm src/utils/vimsplain.py src/utils/index.txt
git commit -m "feat: move vimsplain source into packages/vimsplain"
```

---

## Task 4: Wire the app to use the package

**Files:**
- Modify: `src/utils/keyboard.ts`
- Delete: `src/utils/vimsplain.ts`
- Delete: `src/utils/vimsplain.types.ts`
- Modify: `package.json` (add vimsplain workspace dep)

**Step 1: Add vimsplain as a dependency in the app's package.json**

In `package.json`, add to `"dependencies"`:
```json
"vimsplain": "workspace:*"
```

**Step 2: Install the workspace dependency**

```bash
pnpm install
```

Expected: `node_modules/vimsplain` symlinks to `packages/vimsplain`.

**Step 3: Update keyboard.ts imports**

In `src/utils/keyboard.ts`, change line 1:
```ts
import { MODIFIER_KEY_MAP, SPECIAL_KEYS } from "./vimsplain.types";
```
To:
```ts
import { MODIFIER_KEY_MAP, SPECIAL_KEYS } from "vimsplain";
```

**Step 4: Delete the old vimsplain source files from the app**

```bash
rm src/utils/vimsplain.ts src/utils/vimsplain.types.ts
```

**Step 5: Also delete the old test file from the app (it moved to the package)**

```bash
rm src/utils/__tests__/vimsplain.test.ts
```

If `src/utils/__tests__/` is now empty, remove it too:
```bash
rmdir src/utils/__tests__  # only if empty
```

**Step 6: Build the package so the app can resolve it**

```bash
pnpm --filter vimsplain build
```

Expected: `packages/vimsplain/dist/index.js` and `dist/index.d.ts` created.

**Step 7: Type-check the app**

Run: `pnpm tsc`
Expected: No errors.

**Step 8: Run all app tests**

Run: `pnpm test:run`
Expected: All existing app tests pass.

**Step 9: Commit**

```bash
git add package.json src/utils/keyboard.ts
git rm src/utils/vimsplain.ts src/utils/vimsplain.types.ts
git rm src/utils/__tests__/vimsplain.test.ts
git commit -m "feat: wire app to consume vimsplain from workspace package"
```

---

## Task 5: Expand command coverage

**Files:**
- Modify: `packages/vimsplain/src/vimsplain.ts`
- Modify: `packages/vimsplain/tests/vimsplain.test.ts`

Add tests first (TDD), then implement.

**Step 1: Add failing tests for new command categories**

In `packages/vimsplain/tests/vimsplain.test.ts`, add a new `describe` block at the end:

```ts
describe("expanded command coverage", () => {
  describe("registers", () => {
    it('explains "ayy (yank line into register a)', () => {
      const result = explainSequence('"ayy');
      expect(result.commands[0]).toEqual({
        matched: '"ayy',
        explanation: "yank line into register 'a'",
      });
    });

    it('explains "ap (paste from register a)', () => {
      const result = explainSequence('"ap');
      expect(result.commands[0]).toEqual({
        matched: '"ap',
        explanation: "paste from register 'a' after cursor",
      });
    });

    it('explains "+p (paste from system clipboard)', () => {
      const result = explainSequence('"+p');
      expect(result.commands[0]).toEqual({
        matched: '"+p',
        explanation: "paste from system clipboard after cursor",
      });
    });

    it('explains "_dd (delete line to black hole register)', () => {
      const result = explainSequence('"_dd');
      expect(result.commands[0]).toEqual({
        matched: '"_dd',
        explanation: "delete line (discard)",
      });
    });
  });

  describe("macros", () => {
    it("explains qa (record macro into register a)", () => {
      const result = explainSequence("qa");
      expect(result.commands[0]).toEqual({
        matched: "qa",
        explanation: "start recording macro 'a'",
      });
    });

    it("explains q (stop recording macro)", () => {
      const result = explainSequence("q");
      expect(result.commands[0]).toEqual({
        matched: "q",
        explanation: "stop recording macro",
      });
    });

    it("explains @a (play macro a)", () => {
      const result = explainSequence("@a");
      expect(result.commands[0]).toEqual({
        matched: "@a",
        explanation: "play macro 'a'",
      });
    });

    it("explains @@ (replay last macro)", () => {
      const result = explainSequence("@@");
      expect(result.commands[0]).toEqual({
        matched: "@@",
        explanation: "replay last macro",
      });
    });
  });

  describe("marks (extended)", () => {
    it("explains `0 (go to last exit position)", () => {
      const result = explainSequence("`0");
      expect(result.commands[0]).toEqual({
        matched: "`0",
        explanation: "go to mark '0' (exact)",
      });
    });
  });

  describe("folding", () => {
    it("explains zo (open fold)", () => {
      const result = explainSequence("zo");
      expect(result.commands[0]).toEqual({
        matched: "zo",
        explanation: "open fold",
      });
    });

    it("explains zc (close fold)", () => {
      const result = explainSequence("zc");
      expect(result.commands[0]).toEqual({
        matched: "zc",
        explanation: "close fold",
      });
    });

    it("explains za (toggle fold)", () => {
      const result = explainSequence("za");
      expect(result.commands[0]).toEqual({
        matched: "za",
        explanation: "toggle fold",
      });
    });

    it("explains zR (open all folds)", () => {
      const result = explainSequence("zR");
      expect(result.commands[0]).toEqual({
        matched: "zR",
        explanation: "open all folds",
      });
    });

    it("explains zM (close all folds)", () => {
      const result = explainSequence("zM");
      expect(result.commands[0]).toEqual({
        matched: "zM",
        explanation: "close all folds",
      });
    });

    it("explains zO (open all folds recursively)", () => {
      const result = explainSequence("zO");
      expect(result.commands[0]).toEqual({
        matched: "zO",
        explanation: "open all folds recursively",
      });
    });
  });

  describe("window commands", () => {
    it("explains [C-w]s (horizontal split)", () => {
      const result = explainSequence("[C-w]s");
      expect(result.commands[0]).toEqual({
        matched: "[C-w]s",
        explanation: "split window horizontally",
      });
    });

    it("explains [C-w]v (vertical split)", () => {
      const result = explainSequence("[C-w]v");
      expect(result.commands[0]).toEqual({
        matched: "[C-w]v",
        explanation: "split window vertically",
      });
    });

    it("explains [C-w]h/j/k/l (move between windows)", () => {
      expect(explainSequence("[C-w]h").commands[0].explanation).toBe("move to window left");
      expect(explainSequence("[C-w]j").commands[0].explanation).toBe("move to window below");
      expect(explainSequence("[C-w]k").commands[0].explanation).toBe("move to window above");
      expect(explainSequence("[C-w]l").commands[0].explanation).toBe("move to window right");
    });

    it("explains [C-w]q (close window)", () => {
      const result = explainSequence("[C-w]q");
      expect(result.commands[0]).toEqual({
        matched: "[C-w]q",
        explanation: "close window",
      });
    });
  });

  describe("jump list", () => {
    it("explains [C-o] (jump back)", () => {
      const result = explainSequence("[C-o]");
      expect(result.commands[0]).toEqual({
        matched: "[C-o]",
        explanation: "jump back",
      });
    });

    it("explains [C-i] (jump forward)", () => {
      const result = explainSequence("[C-i]");
      expect(result.commands[0]).toEqual({
        matched: "[C-i]",
        explanation: "jump forward",
      });
    });
  });

  describe("spell checking", () => {
    it("explains ]s (next misspelling)", () => {
      const result = explainSequence("]s");
      expect(result.commands[0]).toEqual({
        matched: "]s",
        explanation: "next misspelling",
      });
    });

    it("explains [s (previous misspelling)", () => {
      const result = explainSequence("[s");
      expect(result.commands[0]).toEqual({
        matched: "[s",
        explanation: "previous misspelling",
      });
    });

    it("explains z= (suggest spelling corrections)", () => {
      const result = explainSequence("z=");
      expect(result.commands[0]).toEqual({
        matched: "z=",
        explanation: "suggest spelling corrections",
      });
    });

    it("explains zg (add word to dictionary)", () => {
      const result = explainSequence("zg");
      expect(result.commands[0]).toEqual({
        matched: "zg",
        explanation: "add word to dictionary",
      });
    });
  });

  describe("indentation (extended)", () => {
    it("explains =ap (auto-indent paragraph)", () => {
      const result = explainSequence("=ap");
      expect(result.commands[0]).toEqual({
        matched: "=ap",
        explanation: "auto-indent paragraph",
      });
    });

    it("explains =G (auto-indent to end of file)", () => {
      const result = explainSequence("=G");
      expect(result.commands[0]).toEqual({
        matched: "=G",
        explanation: "auto-indent to end of file",
      });
    });

    it("explains =% (auto-indent to matching bracket)", () => {
      const result = explainSequence("=%");
      expect(result.commands[0]).toEqual({
        matched: "=%",
        explanation: "auto-indent to matching bracket",
      });
    });
  });

  describe("ex commands", () => {
    it("explains :w (write file)", () => {
      const result = explainSequence(":w[Enter]");
      expect(result.commands[0]).toEqual({
        matched: ":w",
        explanation: "write file",
      });
    });

    it("explains :q (quit)", () => {
      const result = explainSequence(":q[Enter]");
      expect(result.commands[0]).toEqual({
        matched: ":q",
        explanation: "quit",
      });
    });

    it("explains :wq (write and quit)", () => {
      const result = explainSequence(":wq[Enter]");
      expect(result.commands[0]).toEqual({
        matched: ":wq",
        explanation: "write and quit",
      });
    });

    it("explains :q! (force quit)", () => {
      const result = explainSequence(":q![Enter]");
      expect(result.commands[0]).toEqual({
        matched: ":q!",
        explanation: "force quit (discard changes)",
      });
    });

    it("explains :noh (clear search highlights)", () => {
      const result = explainSequence(":noh[Enter]");
      expect(result.commands[0]).toEqual({
        matched: ":noh",
        explanation: "clear search highlights",
      });
    });
  });

  describe("additional text objects", () => {
    it("explains ci{ (change inside curly braces)", () => {
      const result = explainSequence("ci{");
      expect(result.commands[0]).toEqual({
        matched: "ci{",
        explanation: "change inside {}",
      });
    });

    it("explains ci< (change inside angle brackets)", () => {
      const result = explainSequence("ci<");
      expect(result.commands[0]).toEqual({
        matched: "ci<",
        explanation: "change inside <>",
      });
    });

    it("explains ca< (change around angle brackets)", () => {
      const result = explainSequence("ca<");
      expect(result.commands[0]).toEqual({
        matched: "ca<",
        explanation: "change around <>",
      });
    });
  });
});
```

**Step 2: Run tests to confirm they all fail**

Run: `pnpm --filter vimsplain test:run`
Expected: New tests fail, existing tests still pass.

**Step 3: Implement new command patterns in vimsplain.ts**

Add the following to `packages/vimsplain/src/vimsplain.ts`:

Also add these to `SPECIAL_KEYS` in `vimsplain.types.ts`:
```ts
CTRL_W: "[C-w]",
CTRL_O: "[C-o]",
CTRL_I: "[C-i]",
```

Add to `NORMAL_COMMANDS` in vimsplain.ts (insert at appropriate positions — registers/macros before motions, folding near scrolling, windows near special keys):

**Registers (before operators — must match before d/y/p patterns):**
```ts
// --- Registers ---
{ pattern: /^"_dd/, description: "delete line (discard)", isMotion: false },
{ pattern: /^"_d(\d*)w/, description: "delete $1 word(s) (discard)", isMotion: false },
{ pattern: /^"\+yy/, description: "yank line to system clipboard", isMotion: false },
{ pattern: /^"\+p/, description: "paste from system clipboard after cursor", isMotion: false },
{ pattern: /^"\+P/, description: "paste from system clipboard before cursor", isMotion: false },
{ pattern: /^"([a-z])yy/, description: "yank line into register '$1'", isMotion: false },
{ pattern: /^"([a-z])dd/, description: "delete line into register '$1'", isMotion: false },
{ pattern: /^"([a-z])p/, description: "paste from register '$1' after cursor", isMotion: false },
{ pattern: /^"([a-z])P/, description: "paste from register '$1' before cursor", isMotion: false },
```

**Macros (after marks section):**
```ts
// --- Macros ---
{ pattern: /^q([a-z])/, description: "start recording macro '$1'", isMotion: false },
{ pattern: /^q/, description: "stop recording macro", isMotion: false },
{ pattern: /^@@/, description: "replay last macro", isMotion: false },
{ pattern: /^@([a-z])/, description: "play macro '$1'", isMotion: false },
```

**Folding (near scroll section):**
```ts
// --- Folding ---
{ pattern: /^zo/, description: "open fold", isMotion: false },
{ pattern: /^zc/, description: "close fold", isMotion: false },
{ pattern: /^za/, description: "toggle fold", isMotion: false },
{ pattern: /^zO/, description: "open all folds recursively", isMotion: false },
{ pattern: /^zR/, description: "open all folds", isMotion: false },
{ pattern: /^zM/, description: "close all folds", isMotion: false },
```

**Window commands (near special keys):**
```ts
// --- Window commands ---
{ pattern: /^\[C-w\]s/, description: "split window horizontally", isMotion: false },
{ pattern: /^\[C-w\]v/, description: "split window vertically", isMotion: false },
{ pattern: /^\[C-w\]h/, description: "move to window left", isMotion: false },
{ pattern: /^\[C-w\]j/, description: "move to window below", isMotion: false },
{ pattern: /^\[C-w\]k/, description: "move to window above", isMotion: false },
{ pattern: /^\[C-w\]l/, description: "move to window right", isMotion: false },
{ pattern: /^\[C-w\]q/, description: "close window", isMotion: false },
```

**Jump list:**
```ts
// --- Jump list ---
{ pattern: /^\[C-o\]/, description: "jump back", isMotion: true },
{ pattern: /^\[C-i\]/, description: "jump forward", isMotion: true },
```

**Spell:**
```ts
// --- Spell ---
{ pattern: /^\]s/, description: "next misspelling", isMotion: true },
{ pattern: /^\[s/, description: "previous misspelling", isMotion: true },
{ pattern: /^z=/, description: "suggest spelling corrections", isMotion: false },
{ pattern: /^zg/, description: "add word to dictionary", isMotion: false },
{ pattern: /^zw/, description: "mark word as incorrect", isMotion: false },
```

**Indentation (extended — add to existing indent section):**
```ts
{ pattern: /^=ap/, description: "auto-indent paragraph", isMotion: false },
{ pattern: /^=G/, description: "auto-indent to end of file", isMotion: false },
{ pattern: /^=%/, description: "auto-indent to matching bracket", isMotion: false },
{ pattern: /^=(\d*)j/, description: "auto-indent $1 lines down", isMotion: false },
```

**Angle bracket text objects (add near existing text object section):**
```ts
{ pattern: /^ci</, description: "change inside <>", isMotion: false },
{ pattern: /^ci>/, description: "change inside <>", isMotion: false },
{ pattern: /^ca</, description: "change around <>", isMotion: false },
{ pattern: /^ca>/, description: "change around <>", isMotion: false },
{ pattern: /^di</, description: "delete inside <>", isMotion: false },
{ pattern: /^di>/, description: "delete inside <>", isMotion: false },
{ pattern: /^da</, description: "delete around <>", isMotion: false },
{ pattern: /^da>/, description: "delete around <>", isMotion: false },
{ pattern: /^yi</, description: "yank inside <>", isMotion: false },
{ pattern: /^yi>/, description: "yank inside <>", isMotion: false },
{ pattern: /^ya</, description: "yank around <>", isMotion: false },
{ pattern: /^ya>/, description: "yank around <>", isMotion: false },
{ pattern: /^vi</, description: "select inside <>", isMotion: false },
{ pattern: /^vi>/, description: "select inside <>", isMotion: false },
{ pattern: /^va</, description: "select around <>", isMotion: false },
{ pattern: /^va>/, description: "select around <>", isMotion: false },
```

**Backtick text objects:**
```ts
{ pattern: /^ci`/, description: "change inside ``", isMotion: false },
{ pattern: /^ca`/, description: "change around ``", isMotion: false },
{ pattern: /^di`/, description: "delete inside ``", isMotion: false },
{ pattern: /^da`/, description: "delete around ``", isMotion: false },
{ pattern: /^yi`/, description: "yank inside ``", isMotion: false },
{ pattern: /^ya`/, description: "yank around ``", isMotion: false },
{ pattern: /^vi`/, description: "select inside ``", isMotion: false },
{ pattern: /^va`/, description: "select around ``", isMotion: false },
```

**Ex commands** — vimsplain needs a new ex-command mode (similar to search mode). When `:` is encountered, accumulate until `[Enter]`:

Add to the `INSERT_MODE_TRIGGERS` section — actually, ex commands need their own mode handling in `explainSequence`. Add an `inExMode` and `exBuffer` similar to `inSearchMode`/`searchBuffer`.

In the main parse loop, add:
```ts
// Check for [Enter] to complete ex command
if (inExMode && remaining.startsWith(SPECIAL_KEYS.ENTER)) {
  const explanation = explainExCommand(exBuffer);
  commands.push({
    matched: `:${exBuffer}`,
    explanation,
  });
  remaining = remaining.slice(SPECIAL_KEYS.ENTER.length);
  inExMode = false;
  exBuffer = "";
  continue;
}

// In ex mode, accumulate command characters
if (inExMode) {
  exBuffer += remaining[0];
  remaining = remaining.slice(1);
  continue;
}

// Check for ex command start
if (remaining[0] === ":") {
  inExMode = true;
  remaining = remaining.slice(1);
  continue;
}
```

Add the `explainExCommand` helper (internal function):
```ts
/** Known ex commands and their explanations */
const EX_COMMANDS: Record<string, string> = {
  w: "write file",
  q: "quit",
  wq: "write and quit",
  "q!": "force quit (discard changes)",
  "wq!": "force write and quit",
  x: "write and quit",
  e: "edit file",
  noh: "clear search highlights",
  nohl: "clear search highlights",
  "set nu": "show line numbers",
  "set nonu": "hide line numbers",
  "set rnu": "show relative line numbers",
  "set nornu": "hide relative line numbers",
};

function explainExCommand(cmd: string): string {
  const trimmed = cmd.trim();
  if (trimmed in EX_COMMANDS) {
    return EX_COMMANDS[trimmed];
  }
  // Substitution pattern :s/foo/bar/flags
  if (/^s\//.test(trimmed)) {
    return `substitute`;
  }
  return `run ex command '${trimmed}'`;
}
```

**Step 4: Run tests to verify all pass**

Run: `pnpm --filter vimsplain test:run`
Expected: All tests pass including the new ones.

**Step 5: Commit**

```bash
git add packages/vimsplain/
git commit -m "feat(vimsplain): expand command coverage - registers, macros, folds, windows, ex commands"
```

---

## Task 6: Add the README with auto-generated command table

**Files:**
- Create: `packages/vimsplain/scripts/gen-commands-table.ts`
- Create: `packages/vimsplain/README.md`
- Modify: `packages/vimsplain/package.json` (add gen script)

**Step 1: Create the command table generator script**

Create `packages/vimsplain/scripts/gen-commands-table.ts`:

```ts
/**
 * Generates a markdown table of all supported vimsplain commands.
 * Reads NORMAL_COMMANDS from vimsplain.ts and writes to README.md.
 *
 * Run: npx tsx scripts/gen-commands-table.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Read the vimsplain source
const src = readFileSync(join(import.meta.dirname, "../src/vimsplain.ts"), "utf8");

// Extract patterns and descriptions from NORMAL_COMMANDS
const commandRegex = /\{\s*pattern:\s*\/(.+?)\/,\s*description:\s*"(.+?)"/gs;
const rows: Array<{ pattern: string; description: string }> = [];

for (const match of src.matchAll(commandRegex)) {
  const pattern = match[1].replace(/\^/g, "").replace(/\\/g, "");
  const description = match[2];
  rows.push({ pattern, description });
}

// Build markdown table
const header = "| Keystroke | Description |\n|-----------|-------------|\n";
const body = rows
  .map((r) => `| \`${r.pattern}\` | ${r.description} |`)
  .join("\n");

const table = header + body;

// Inject into README between markers
const readmePath = join(import.meta.dirname, "../README.md");
const readme = readFileSync(readmePath, "utf8");
const updated = readme.replace(
  /<!-- COMMANDS_TABLE_START -->[\s\S]*?<!-- COMMANDS_TABLE_END -->/,
  `<!-- COMMANDS_TABLE_START -->\n${table}\n<!-- COMMANDS_TABLE_END -->`,
);

writeFileSync(readmePath, updated);
console.log(`Updated README.md with ${rows.length} commands.`);
```

**Step 2: Create the README.md**

Create `packages/vimsplain/README.md`:

````markdown
# vimsplain

Parse and explain Vim keystroke sequences.

```ts
import { explainSequence, summarizeSequence } from "vimsplain";

explainSequence("ggdG");
// {
//   commands: [
//     { matched: "gg", explanation: "go to start of file" },
//     { matched: "dG", explanation: "delete to end of file" },
//   ],
//   remaining: ""
// }

summarizeSequence("ddp");
// "delete line, then paste after cursor"
```

## Install

```bash
npm install vimsplain
# or
pnpm add vimsplain
```

## API

### `explainSequence(input: string): ExplainResult`

Parses a Vim keystroke sequence and returns structured explanations for each command.

Handles four parsing modes:
- **Normal mode** — motions, operators, text objects
- **Insert mode** — after `i`, `a`, `cw`, etc., accumulates typed text until `[Esc]`
- **Search mode** — after `/` or `?`, accumulates pattern until `[Enter]`
- **Ex mode** — after `:`, accumulates command until `[Enter]`

**Special key notation:**
Encode special keys as bracketed strings: `[Esc]`, `[Enter]`, `[Backspace]`, `[Delete]`, `[Up]`, `[Down]`, `[Left]`, `[Right]`, `[C-r]`, `[C-w]`, `[C-o]`, `[C-i]`.

Use the exported `SPECIAL_KEYS` constants to avoid typos:

```ts
import { SPECIAL_KEYS, explainSequence } from "vimsplain";

explainSequence(`ihello${SPECIAL_KEYS.ESCAPE}`);
// commands: [
//   { matched: "i",     explanation: "insert before cursor" },
//   { matched: "hello", explanation: 'type "hello"' },
//   { matched: "[Esc]", explanation: "exit insert mode" }
// ]
```

### `formatExplanation(result: ExplainResult): string`

Formats an `ExplainResult` as a human-readable multi-line string.

```ts
import { explainSequence, formatExplanation } from "vimsplain";

const result = explainSequence("ggdG");
console.log(formatExplanation(result));
// gg: go to start of file
// dG: delete to end of file
```

### `summarizeSequence(input: string): string`

Convenience function — parses a sequence and returns a plain English summary.

```ts
import { summarizeSequence } from "vimsplain";

summarizeSequence("yyp");
// "yank line, then paste after cursor"
```

## Types

```ts
type ExplainedCommand = {
  matched: string;      // The matched keystroke(s)
  explanation: string;  // Human-readable explanation
};

type ExplainResult = {
  commands: ExplainedCommand[];
  remaining: string;    // Any unmatched trailing input
};

type CommandDefinition = {
  pattern: RegExp;
  description: string;
  isMotion: boolean;
};
```

## Constants

```ts
import { SPECIAL_KEYS, MODIFIER_KEY_MAP } from "vimsplain";

SPECIAL_KEYS.ESCAPE    // "[Esc]"
SPECIAL_KEYS.ENTER     // "[Enter]"
SPECIAL_KEYS.BACKSPACE // "[Backspace]"
// ... etc
```

## Supported Commands

<!-- COMMANDS_TABLE_START -->
<!-- COMMANDS_TABLE_END -->

## Contributing

Issues and PRs welcome. The command definitions live in `src/vimsplain.ts` as a `NORMAL_COMMANDS` array — adding new commands is a one-liner.

```ts
// Adding a new command:
{ pattern: /^gf/, description: "go to file under cursor", isMotion: false }
```

## License

MIT
````

**Step 3: Add gen script to package.json**

In `packages/vimsplain/package.json`, add to `scripts`:
```json
"gen:commands": "tsx scripts/gen-commands-table.ts"
```

Also add `tsx` to devDependencies:
```json
"tsx": "^4.19.0"
```

**Step 4: Install tsx**

```bash
pnpm --filter vimsplain install
```

**Step 5: Run the generator**

```bash
pnpm --filter vimsplain gen:commands
```

Expected: `README.md` updated with a full table between the markers.

**Step 6: Verify README looks correct**

Open `packages/vimsplain/README.md` and check the generated table is populated with all commands.

**Step 7: Commit**

```bash
git add packages/vimsplain/
git commit -m "docs(vimsplain): add README with API docs and auto-generated command table"
```

---

## Task 7: Set up Changesets

**Files:**
- Create: `.changeset/config.json`
- Create: `.changeset/README.md` (Changesets creates this automatically)

**Step 1: Install Changesets at workspace root**

```bash
pnpm add -D -w @changesets/cli @changesets/changelog-github
```

**Step 2: Initialize Changesets**

```bash
pnpm changeset init
```

Expected: `.changeset/config.json` and `.changeset/README.md` created.

**Step 3: Update .changeset/config.json**

The default config is fine; update `access` to `public` and set `changelog`:

```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.0.0/schema.json",
  "changelog": "@changesets/changelog-github",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": []
}
```

**Step 4: Create the initial changeset for v0.1.0**

```bash
pnpm changeset
```

When prompted:
- Select `vimsplain` (space to select, enter to confirm)
- Pick `minor` (since this is the initial feature release: 0.0.0 → 0.1.0)
- Summary: "Initial release — parse and explain Vim keystroke sequences"

This creates a `.changeset/<hash>.md` file.

**Step 5: Apply the changeset to bump version and generate CHANGELOG**

```bash
pnpm changeset version
```

Expected: `packages/vimsplain/package.json` version bumped to `0.1.0`, `packages/vimsplain/CHANGELOG.md` created.

**Step 6: Commit**

```bash
git add .changeset/ packages/vimsplain/CHANGELOG.md packages/vimsplain/package.json
git commit -m "chore: initialize changesets and version vimsplain@0.1.0"
```

---

## Task 8: Set up GitHub Actions CI/CD

**Files:**
- Create: `.github/workflows/ci.yml`
- Create: `.github/workflows/release.yml`

**Step 1: Create .github/workflows/ directory**

```bash
mkdir -p .github/workflows
```

**Step 2: Create ci.yml — runs on every PR and push**

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    name: Test & Typecheck
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 10

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Typecheck vimsplain
        run: pnpm --filter vimsplain typecheck

      - name: Test vimsplain
        run: pnpm --filter vimsplain test:run

      - name: Build vimsplain
        run: pnpm --filter vimsplain build

      - name: Typecheck app
        run: pnpm tsc

      - name: Test app
        run: pnpm test:run

      - name: Lint
        run: pnpm lint
```

**Step 3: Create release.yml — publishes to npm when changesets version PR is merged**

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    branches: [main]

concurrency: ${{ github.workflow }}-${{ github.ref }}

jobs:
  release:
    name: Release
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 10

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
          registry-url: "https://registry.npmjs.org"

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build vimsplain
        run: pnpm --filter vimsplain build

      - name: Create Release Pull Request or Publish
        id: changesets
        uses: changesets/action@v1
        with:
          publish: pnpm changeset publish
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

**Step 4: Commit**

```bash
git add .github/
git commit -m "ci: add GitHub Actions CI and Changesets release workflow"
```

**Step 5: Add README note about required GitHub secrets**

No code change — but document in `packages/vimsplain/README.md` contributing section or separately in `docs/plans/` that the repo maintainer needs to add `NPM_TOKEN` to GitHub repo secrets (Settings → Secrets → Actions).

---

## Task 9: Final verification

**Step 1: Run full package test suite**

```bash
pnpm --filter vimsplain test:run
```
Expected: All tests pass.

**Step 2: Build the package**

```bash
pnpm --filter vimsplain build
```
Expected: `packages/vimsplain/dist/` has `index.js`, `index.d.ts`, `index.js.map`.

**Step 3: Run the app's full test suite**

```bash
pnpm test:run
```
Expected: All app tests pass (with keyboard.ts now importing from `vimsplain`).

**Step 4: Typecheck everything**

```bash
pnpm tsc && pnpm --filter vimsplain typecheck
```
Expected: No errors.

**Step 5: Lint**

```bash
pnpm lint
```
Expected: No errors.

**Step 6: Verify the dist output looks correct**

Inspect `packages/vimsplain/dist/index.js` — should be ESM, minified or clean, with the three public functions.

Inspect `packages/vimsplain/dist/index.d.ts` — should export all types, functions, and constants.

**Step 7: Final commit**

```bash
git add .
git commit -m "chore: final verification pass for vimsplain package"
```

---

## Summary of All Files Changed

| Action | File |
|--------|------|
| Create | `pnpm-workspace.yaml` |
| Create | `packages/vimsplain/package.json` |
| Create | `packages/vimsplain/tsconfig.json` |
| Create | `packages/vimsplain/tsup.config.ts` |
| Create | `packages/vimsplain/vitest.config.ts` |
| Create | `packages/vimsplain/src/index.ts` |
| Create | `packages/vimsplain/src/vimsplain.ts` (moved + expanded) |
| Create | `packages/vimsplain/src/vimsplain.types.ts` (moved + expanded) |
| Create | `packages/vimsplain/tests/vimsplain.test.ts` (moved + expanded) |
| Create | `packages/vimsplain/README.md` |
| Create | `packages/vimsplain/scripts/gen-commands-table.ts` |
| Create | `packages/vimsplain/CHANGELOG.md` (generated by Changesets) |
| Create | `.changeset/config.json` |
| Create | `.github/workflows/ci.yml` |
| Create | `.github/workflows/release.yml` |
| Modify | `package.json` (add vimsplain workspace dep) |
| Modify | `src/utils/keyboard.ts` (import from "vimsplain") |
| Delete | `src/utils/vimsplain.ts` |
| Delete | `src/utils/vimsplain.types.ts` |
| Delete | `src/utils/__tests__/vimsplain.test.ts` |
| Delete | `src/utils/vimsplain.py` |
| Delete | `src/utils/index.txt` |

## Post-Implementation: Publishing to npm

Before the first publish:
1. Create an npm account at npmjs.com (if not already done)
2. Check `vimsplain` is available: `npm view vimsplain` (should 404)
3. Generate an npm Automation token: npm account → Access Tokens → Generate New Token → Automation
4. Add as `NPM_TOKEN` secret in GitHub repo Settings → Secrets and Variables → Actions
5. Merge the "Version Packages" PR that Changesets bot creates
6. The release workflow will automatically publish `vimsplain@0.1.0` to npm
