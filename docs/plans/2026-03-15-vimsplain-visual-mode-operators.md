# Vimsplain Visual Mode Operators Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add an `inVisualMode` state machine to vimsplain so that operators (`d`, `D`, `c`, `y`, `x`, `~`, `>`, `<`, `=`, `J`, `gc`, `gu`, `gU`, `g~`, `p`, `P`) applied after entering visual mode are explained as operating on the selection rather than with their normal-mode meanings.

**Architecture:** Mirror the existing `inInsertMode` pattern in `explainSequence`. When `v`, `V`, or `[C-v]` is parsed, set `inVisualMode = true`. While in visual mode, motions are parsed normally (you can still move to extend the selection), but when a visual operator is encountered, emit a context-aware explanation like "delete selection" and exit visual mode. `[Esc]` also exits visual mode.

**Tech Stack:** TypeScript, vitest

---

## Background

The bug: after entering visual mode (`v`, `V`, or Ctrl-V), operators like `D` are parsed as their normal-mode equivalents ("delete to end of line") instead of "delete selection". This is because `explainSequence` in `vimsplain.ts` has no `inVisualMode` state — it only tracks insert mode.

The fix mirrors the `inInsertMode` state machine already in the file (`vimsplain.ts:689`).

**Key reference:** `vimsplain.ts:686` — `explainSequence` function; `vimsplain.ts:411-413` — existing `v`/`V` patterns.

---

## Task 1: Branch setup

**Files:**
- No code changes

**Step 1: Create a feature branch**

```bash
git checkout main
git pull
git checkout -b fix/vimsplain-visual-mode-operators
```

**Step 2: Verify clean state**

```bash
pnpm --filter vimsplain test:run
```

Expected: all tests pass.

---

## Task 2: Write failing tests for visual mode operators

**Files:**
- Modify: `packages/vimsplain/tests/vimsplain.test.ts`

Add a new `describe("visual mode operators")` block. Find the existing `describe("visual mode text objects")` block (around line 829) and add the new block **after** it, before the closing `});` of `describe("explainSequence")`.

**Step 1: Add failing tests**

Insert after line 847 (closing `});` of `describe("visual mode text objects")`):

```typescript
    describe("visual mode operators", () => {
      describe("v (char visual) + operator", () => {
        it("explains vd as enter visual mode, delete selection", () => {
          const result = explainSequence("vd");
          expect(result.commands).toHaveLength(2);
          expect(result.commands[0].explanation).toBe("enter visual mode");
          expect(result.commands[1].explanation).toBe("delete selection");
        });

        it("explains vD as enter visual mode, delete selection", () => {
          const result = explainSequence("vD");
          expect(result.commands).toHaveLength(2);
          expect(result.commands[0].explanation).toBe("enter visual mode");
          expect(result.commands[1].explanation).toBe("delete selection");
        });

        it("explains vc as enter visual mode, change selection", () => {
          const result = explainSequence("vc");
          expect(result.commands).toHaveLength(2);
          expect(result.commands[0].explanation).toBe("enter visual mode");
          expect(result.commands[1].explanation).toBe("change selection");
        });

        it("explains vy as enter visual mode, yank selection", () => {
          const result = explainSequence("vy");
          expect(result.commands).toHaveLength(2);
          expect(result.commands[0].explanation).toBe("enter visual mode");
          expect(result.commands[1].explanation).toBe("yank selection");
        });

        it("explains vx as enter visual mode, delete selection", () => {
          const result = explainSequence("vx");
          expect(result.commands).toHaveLength(2);
          expect(result.commands[0].explanation).toBe("enter visual mode");
          expect(result.commands[1].explanation).toBe("delete selection");
        });

        it("explains v~ as enter visual mode, toggle case of selection", () => {
          const result = explainSequence("v~");
          expect(result.commands).toHaveLength(2);
          expect(result.commands[0].explanation).toBe("enter visual mode");
          expect(result.commands[1].explanation).toBe("toggle case of selection");
        });

        it("explains v> as enter visual mode, indent selection", () => {
          const result = explainSequence("v>");
          expect(result.commands).toHaveLength(2);
          expect(result.commands[0].explanation).toBe("enter visual mode");
          expect(result.commands[1].explanation).toBe("indent selection");
        });

        it("explains v< as enter visual mode, dedent selection", () => {
          const result = explainSequence("v<");
          expect(result.commands).toHaveLength(2);
          expect(result.commands[0].explanation).toBe("enter visual mode");
          expect(result.commands[1].explanation).toBe("dedent selection");
        });

        it("explains v= as enter visual mode, auto-indent selection", () => {
          const result = explainSequence("v=");
          expect(result.commands).toHaveLength(2);
          expect(result.commands[0].explanation).toBe("enter visual mode");
          expect(result.commands[1].explanation).toBe("auto-indent selection");
        });

        it("explains vJ as enter visual mode, join selection", () => {
          const result = explainSequence("vJ");
          expect(result.commands).toHaveLength(2);
          expect(result.commands[0].explanation).toBe("enter visual mode");
          expect(result.commands[1].explanation).toBe("join selection");
        });

        it("explains vp as enter visual mode, paste over selection", () => {
          const result = explainSequence("vp");
          expect(result.commands).toHaveLength(2);
          expect(result.commands[0].explanation).toBe("enter visual mode");
          expect(result.commands[1].explanation).toBe("paste over selection");
        });

        it("explains vgc as enter visual mode, toggle comment selection (existing behavior preserved)", () => {
          const result = explainSequence("vgc");
          expect(result.commands).toHaveLength(2);
          expect(result.commands[0].explanation).toBe("enter visual mode");
          expect(result.commands[1].explanation).toBe("toggle comment selection");
        });

        it("explains vgu as enter visual mode, lowercase selection", () => {
          const result = explainSequence("vgu");
          expect(result.commands).toHaveLength(2);
          expect(result.commands[0].explanation).toBe("enter visual mode");
          expect(result.commands[1].explanation).toBe("lowercase selection");
        });

        it("explains vgU as enter visual mode, uppercase selection", () => {
          const result = explainSequence("vgU");
          expect(result.commands).toHaveLength(2);
          expect(result.commands[0].explanation).toBe("enter visual mode");
          expect(result.commands[1].explanation).toBe("uppercase selection");
        });
      });

      describe("V (line visual) + operator", () => {
        it("explains Vd as enter visual line mode, delete selection", () => {
          const result = explainSequence("Vd");
          expect(result.commands).toHaveLength(2);
          expect(result.commands[0].explanation).toBe("enter visual line mode");
          expect(result.commands[1].explanation).toBe("delete selection");
        });

        it("explains VD as enter visual line mode, delete selection", () => {
          const result = explainSequence("VD");
          expect(result.commands).toHaveLength(2);
          expect(result.commands[0].explanation).toBe("enter visual line mode");
          expect(result.commands[1].explanation).toBe("delete selection");
        });

        it("explains Vc as enter visual line mode, change selection", () => {
          const result = explainSequence("Vc");
          expect(result.commands).toHaveLength(2);
          expect(result.commands[0].explanation).toBe("enter visual line mode");
          expect(result.commands[1].explanation).toBe("change selection");
        });

        it("explains Vy as enter visual line mode, yank selection", () => {
          const result = explainSequence("Vy");
          expect(result.commands).toHaveLength(2);
          expect(result.commands[0].explanation).toBe("enter visual line mode");
          expect(result.commands[1].explanation).toBe("yank selection");
        });

        it("explains Vgc as enter visual line mode, toggle comment selection (existing behavior preserved)", () => {
          const result = explainSequence("Vgc");
          expect(result.commands).toHaveLength(2);
          expect(result.commands[0].explanation).toBe("enter visual line mode");
          expect(result.commands[1].explanation).toBe("toggle comment selection");
        });
      });

      describe("motions extend the selection before operator", () => {
        it("explains vjd as: enter visual mode, move line down, delete selection", () => {
          const result = explainSequence("vjd");
          expect(result.commands).toHaveLength(3);
          expect(result.commands[0].explanation).toBe("enter visual mode");
          expect(result.commands[1].explanation).toBe("move line down");
          expect(result.commands[2].explanation).toBe("delete selection");
        });

        it("explains Vjd as: enter visual line mode, move line down, delete selection", () => {
          const result = explainSequence("Vjd");
          expect(result.commands).toHaveLength(3);
          expect(result.commands[0].explanation).toBe("enter visual line mode");
          expect(result.commands[1].explanation).toBe("move line down");
          expect(result.commands[2].explanation).toBe("delete selection");
        });

        it("explains v3wd as: enter visual mode, move 3 words forward, delete selection", () => {
          const result = explainSequence("v3wd");
          expect(result.commands).toHaveLength(3);
          expect(result.commands[0].explanation).toBe("enter visual mode");
          expect(result.commands[1].explanation).toBe("move 3 words forward");
          expect(result.commands[2].explanation).toBe("delete selection");
        });
      });

      describe("Esc exits visual mode", () => {
        it("explains v[Esc] as enter visual mode, return to normal mode", () => {
          const result = explainSequence(`v${SPECIAL_KEYS.ESCAPE}`);
          expect(result.commands).toHaveLength(2);
          expect(result.commands[0].explanation).toBe("enter visual mode");
          expect(result.commands[1].explanation).toBe("return to normal mode");
        });

        it("explains v[Esc]d as: enter visual mode, return to normal mode, delete char under cursor", () => {
          const result = explainSequence(`v${SPECIAL_KEYS.ESCAPE}d`);
          expect(result.commands).toHaveLength(3);
          expect(result.commands[0].explanation).toBe("enter visual mode");
          expect(result.commands[1].explanation).toBe("return to normal mode");
          expect(result.commands[2].explanation).toBe("delete char under cursor");
        });
      });
    });
```

**Step 2: Run tests to confirm they fail**

```bash
pnpm --filter vimsplain test:run
```

Expected: the new tests fail (e.g. `vd` returns "delete char under cursor" instead of "delete selection").

---

## Task 3: Implement `inVisualMode` state machine

**Files:**
- Modify: `packages/vimsplain/src/vimsplain.ts`

**Step 1: Add VISUAL_MODE_TRIGGERS set**

After the `INSERT_MODE_TRIGGERS` set (around line 28), add:

```typescript
/** Visual mode operators that act on the selection */
const VISUAL_OPERATORS: Record<string, string> = {
  d: "delete selection",
  D: "delete selection",
  c: "change selection",
  C: "change selection",
  y: "yank selection",
  Y: "yank selection",
  x: "delete selection",
  X: "delete selection",
  s: "change selection",
  S: "change selection",
  "~": "toggle case of selection",
  ">": "indent selection",
  "<": "dedent selection",
  "=": "auto-indent selection",
  J: "join selection",
  p: "paste over selection",
  P: "paste over selection",
};

/** Visual mode g-prefixed operators */
const VISUAL_G_OPERATORS: Record<string, string> = {
  c: "toggle comment selection",
  u: "lowercase selection",
  U: "uppercase selection",
  "~": "toggle case of selection",
  q: "format selection",
};
```

**Step 2: Add visual mode state variables to `explainSequence`**

In `explainSequence` (line 686), add after `let inExMode = false;` and `let exBuffer = "";`:

```typescript
  let inVisualMode = false;
```

**Step 3: Add visual mode handling inside the `while` loop**

Add visual mode handling BEFORE the `// Parse normal mode command` section (around line 873). The visual mode block needs to go right before the `parseCommand` call. Insert after the search-mode section and before the `// Parse normal mode command` comment:

```typescript
    // In visual mode: check for operators or Esc
    if (inVisualMode) {
      // Esc exits visual mode
      if (remaining.startsWith(SPECIAL_KEYS.ESCAPE)) {
        commands.push({
          matched: SPECIAL_KEYS.ESCAPE,
          explanation: "return to normal mode",
        });
        remaining = remaining.slice(SPECIAL_KEYS.ESCAPE.length);
        inVisualMode = false;
        continue;
      }

      // g-prefixed visual operators (gc, gu, gU, g~, gq)
      if (remaining[0] === "g" && remaining.length > 1) {
        const nextChar = remaining[1];
        if (nextChar in VISUAL_G_OPERATORS) {
          const op = `g${nextChar}`;
          commands.push({
            matched: op,
            explanation: VISUAL_G_OPERATORS[nextChar],
          });
          remaining = remaining.slice(op.length);
          inVisualMode = false;
          // c/C/s/S change operators enter insert mode
          if (nextChar === "c" || nextChar === "s") {
            inInsertMode = true;
          }
          continue;
        }
      }

      // Single-char visual operators
      if (remaining[0] in VISUAL_OPERATORS) {
        const op = remaining[0];
        commands.push({
          matched: op,
          explanation: VISUAL_OPERATORS[op],
        });
        remaining = remaining.slice(1);
        inVisualMode = false;
        // c/C/s/S change operators enter insert mode
        if (op === "c" || op === "C" || op === "s" || op === "S") {
          inInsertMode = true;
        }
        continue;
      }

      // Not an operator — parse as a motion (extends the selection)
      // Fall through to parseCommand below
    }
```

**Step 4: Set `inVisualMode` after parsing `v` or `V`**

After the existing `inInsertMode` check (around line 880):

```typescript
      // Check if this command enters visual mode
      if (matched === "v" || matched === "V") {
        inVisualMode = true;
      }
```

Note: The existing `v`/`V` patterns in `NORMAL_COMMANDS` (lines 411-413) still fire and emit "enter visual mode" / "enter visual line mode" correctly. We just also set `inVisualMode = true` as state.

**Step 5: Run tests**

```bash
pnpm --filter vimsplain test:run
```

Expected: all tests pass, including the new visual mode operator tests.

---

## Task 4: Verify the `vgc` / `Vgc` pre-combined pattern interaction

The existing `NORMAL_COMMANDS` includes visual text objects like `viw`, `vi"`, and importantly the comment patterns `gc` (line 522: `{ pattern: /^gc/, description: "toggle comment selection" }`). With `inVisualMode` now active, after `v` is parsed, the next `g` will be caught by the new `VISUAL_G_OPERATORS` block and emit "toggle comment selection" — so `vgc` still produces the correct 2-command sequence. The pre-combined `viw` etc. patterns in `NORMAL_COMMANDS` are NOT affected because they start with `v` and are only parsed when we're NOT in visual mode (we only enter visual mode after the `v` is consumed).

**Step 1: Verify existing visual text object tests still pass**

```bash
pnpm --filter vimsplain test:run -- --reporter=verbose 2>&1 | grep -E "(visual mode text objects|PASS|FAIL)"
```

Expected: all "visual mode text objects" tests pass.

---

## Task 5: Check coverage

**Files:**
- Read: `packages/vimsplain/tests/coverage.test.ts` (to understand coverage threshold)

**Step 1: Run coverage**

```bash
pnpm --filter vimsplain test:coverage
```

Expected: coverage stays ≥90% lines (it should go up, not down).

---

## Task 6: Type check and lint

**Step 1: Type check**

```bash
pnpm --filter vimsplain typecheck
```

Expected: no errors.

**Step 2: Lint fix**

```bash
pnpm lint:fix
```

Expected: no errors.

---

## Task 7: Commit

**Step 1: Create a changeset**

```bash
pnpm changeset
```

- Select: `vimsplain`
- Bump type: `patch`
- Summary: `Fix visual mode operators (d, D, c, y, x, ~, >, <, =, J, p, gc, gu, gU) now correctly explained as acting on the selection`

**Step 2: Commit**

```bash
git add packages/vimsplain/src/vimsplain.ts packages/vimsplain/tests/vimsplain.test.ts .changeset/
git commit -m "fix(vimsplain): explain visual mode operators as acting on selection"
```

---

## Task 8: Open PR

```bash
gh pr create --title "fix(vimsplain): visual mode operators now explained as acting on selection" \
  --body "$(cat <<'EOF'
## Problem

When a user enters visual mode (`v` or `V`), selects text, then presses an operator like `D`, the motion log showed the wrong explanation. For example, `VjD` was explained as `enter visual line mode → move line down → delete to end of line` instead of `enter visual line mode → move line down → delete selection`.

## Root Cause

`explainSequence` in vimsplain had an `inInsertMode` state machine but no equivalent `inVisualMode` state. Operators were always matched against normal-mode patterns.

## Fix

Add an `inVisualMode` state machine that mirrors `inInsertMode`. After `v` or `V` is parsed, the parser tracks that we're in visual mode. Subsequent characters are first checked against a `VISUAL_OPERATORS` map before falling back to motion parsing (motions still extend the selection). Pressing `[Esc]` or an operator exits visual mode.

## Operators covered

`d`, `D`, `c`, `C`, `y`, `Y`, `x`, `X`, `s`, `S`, `~`, `>`, `<`, `=`, `J`, `p`, `P`, `gc`, `gu`, `gU`, `g~`, `gq`

## Changeset

Patch bump — bug fix, no API changes.
EOF
)"
```

---

## Visual Mode Operator Reference (Vim behavior)

For reference, in Vim these operators act on the visual selection:

| Key | Explanation |
|-----|-------------|
| `d` / `D` / `x` / `X` | delete selection |
| `c` / `C` / `s` / `S` | change selection (enters insert mode) |
| `y` / `Y` | yank selection |
| `~` | toggle case of selection |
| `>` | indent selection |
| `<` | dedent selection |
| `=` | auto-indent selection |
| `J` | join selection |
| `p` / `P` | paste over selection |
| `gc` | toggle comment selection |
| `gu` | lowercase selection |
| `gU` | uppercase selection |
| `g~` | toggle case of selection |
| `gq` | format selection |
