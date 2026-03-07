# Ignore Generated Files in Knip Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ignore `env.d.ts` and `src/types/database.ts` in Knip.

**Architecture:** Update `knip.json` to include the `ignore` property.

**Tech Stack:** Knip

---

### Task 1: Update `knip.json`

**Files:**
- Modify: `knip.json:1-3`

**Step 1: Modify `knip.json`**

```json
{
  "$schema": "https://unpkg.com/knip@5/schema.json",
  "ignore": ["env.d.ts", "src/types/database.ts"]
}
```

**Step 2: Verify with Knip**

Run: `pnpm knip`
Expected: Knip runs without reporting errors in `env.d.ts` or `src/types/database.ts`.

**Step 3: Commit**

```bash
git add knip.json
git commit -m "chore: ignore generated files in knip"
```
