# GCC (Comment Toggling) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement the `gcc` vim motion (and its `gc` variants) to toggle comments using CodeMirror 6's built-in comment commands.

**Architecture:** We will define a custom operator `comment` in `@replit/codemirror-vim` that delegates to `@codemirror/commands`'s `toggleLineComment` function.

**Tech Stack:** `@codemirror/commands`, `@replit/codemirror-vim`, React

---

### Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install `@codemirror/commands`**
Run: `pnpm add @codemirror/commands`
Expected: Succeeds and adds dependency.

**Step 2: Commit**
```bash
git add package.json pnpm-lock.yaml
git commit -m "build: add @codemirror/commands dependency"
```

---

### Task 2: Implement Vim Comment Operator

**Files:**
- Modify: `src/components/VimEditor/VimEditor.tsx`

**Step 1: Write the implementation**
In `src/components/VimEditor/VimEditor.tsx`:
Add import:
```typescript
import { toggleLineComment } from "@codemirror/commands";
```

In `onCreateEditor`, add the operator registration:
```typescript
    // Add comment operator (gcc, gcaw, etc)
    Vim.defineOperator("comment", (cm: any, args: any, ranges: any[]) => {
      // In @replit/codemirror-vim, the cm object is a CM5 wrapper
      // We need to trigger the CM6 toggleLineComment command on the EditorView
      
      // Temporarily set the selection to the range provided by the motion
      const originalSelection = editorView.state.selection;
      
      // Convert CM5 pos to CM6 offset
      const selections = ranges.map(r => {
        const from = editorView.state.doc.line(r.anchor.line + 1).from + r.anchor.ch;
        const to = editorView.state.doc.line(r.head.line + 1).from + r.head.ch;
        return { anchor: from, head: to };
      });
      
      editorView.dispatch({
        selection: { anchor: selections[0].anchor, head: selections[0].head }
      });
      
      // Execute the toggle command
      toggleLineComment(editorView);
      
      // We don't restore selection because Vim motions usually place the cursor at the start of the range
      const newCursorPos = Math.min(selections[0].anchor, selections[0].head);
      editorView.dispatch({
        selection: { anchor: newCursorPos, head: newCursorPos }
      });
    });

    Vim.mapCommand("gc", "operator", "comment", {});
```
*(Note: CodeMirror's `toggleLineComment` automatically handles selection ranges correctly based on its AST language context)*

**Step 2: Check Types**
Run: `pnpm tsc`
Expected: PASS

**Step 3: Run Tests**
Run: `pnpm test`
Expected: PASS

**Step 4: Commit**
```bash
git add src/components/VimEditor/VimEditor.tsx
git commit -m "feat: add gc comment operator mapping"
```

---

### Task 3: Enrich Vimsplain with Comment Motions

**Files:**
- Modify: `src/utils/vimsplain.ts`
- Test: `src/utils/__tests__/vimsplain.test.ts`

**Step 1: Update vimsplain.ts**
Add `gc` related patterns to `NORMAL_COMMANDS`.
Patterns to add:
- `{ pattern: /^gcc/, description: "toggle comment line", isMotion: false }`
- `{ pattern: /^gc(\d*)w/, description: "toggle comment $1 word(s) forward", isMotion: false }`
- `{ pattern: /^gc(\d*)j/, description: "toggle comment $1 line(s) down", isMotion: false }`
- `{ pattern: /^gc(\d*)k/, description: "toggle comment $1 line(s) up", isMotion: false }`
- `{ pattern: /^gciw/, description: "toggle comment inner word", isMotion: false }`
- `{ pattern: /^gcaw/, description: "toggle comment a word", isMotion: false }`
- `{ pattern: /^gci\(/, description: "toggle comment inside ()", isMotion: false }`
- `{ pattern: /^gca\(/, description: "toggle comment around ()", isMotion: false }`

**Step 2: Add tests to vimsplain.test.ts**
Add test cases for `gcc`, `gcw`, `gciw`, etc.

**Step 3: Run Tests**
Run: `pnpm test src/utils/__tests__/vimsplain.test.ts`
Expected: PASS

**Step 4: Commit**
```bash
git add src/utils/vimsplain.ts src/utils/__tests__/vimsplain.test.ts
git commit -m "feat: enrich vimsplain with comment motions"
```