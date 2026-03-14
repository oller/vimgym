# vimsplain npm Package — Design Document

**Date:** 2026-03-14  
**Status:** Approved

---

## Overview

Extract the `vimsplain` Vim keystroke parser/explainer from the vimgym app and publish it as a standalone, documented, tested npm package. The vimgym app then depends on the published package (via `workspace:*` during local development).

---

## What vimsplain Does

Given a string of Vim keystrokes (e.g., `"ggdG"`, `"ciwtest[Esc]"`), vimsplain parses the sequence into individual commands and returns structured human-readable explanations for each one. It handles four parsing modes:

- **Normal mode** — regex pattern matching against a command table
- **Insert mode** — accumulates typed text after insert triggers (`i`, `a`, `cw`, etc.) until `[Esc]`
- **Search mode** — accumulates pattern after `/` or `?` until `[Enter]`
- **Visual mode** — `v`/`V` unified with text objects and `gc`

**Public API (3 functions):**

```ts
explainSequence(input: string): ExplainResult
formatExplanation(result: ExplainResult): string
summarizeSequence(input: string): string
```

**Exported constants/types:**

```ts
SPECIAL_KEYS, MODIFIER_KEY_MAP   // used by the app's keyboard.ts
ExplainedCommand, ExplainResult, CommandDefinition  // TypeScript types
```

---

## Repository Structure (after)

```
vimgym/                          ← app stays at repo root
├── pnpm-workspace.yaml          ← { packages: [".", "packages/*"] }
├── .changeset/
│   └── config.json
├── .github/
│   └── workflows/
│       └── release.yml          ← Changesets automated publish
├── docs/
│   └── plans/                   ← this file lives here
├── packages/
│   └── vimsplain/
│       ├── src/
│       │   ├── index.ts         ← public re-exports
│       │   ├── vimsplain.ts     ← parser implementation
│       │   └── vimsplain.types.ts
│       ├── tests/
│       │   └── vimsplain.test.ts
│       ├── package.json
│       ├── tsconfig.json
│       ├── tsup.config.ts
│       ├── vitest.config.ts
│       └── README.md
└── src/
    └── utils/
        ├── keyboard.ts          ← updated: imports from "vimsplain"
        └── (vimsplain.ts + vimsplain.types.ts removed)
```

---

## Build Tool: tsup

`tsup` is the standard zero-config TypeScript library bundler.

```ts
// packages/vimsplain/tsup.config.ts
export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: true,
})
```

Output in `dist/`: `index.js`, `index.d.ts`, `index.js.map`

`package.json` key fields:
```json
{
  "name": "vimsplain",
  "version": "0.1.0",
  "type": "module",
  "exports": {
    ".": { "import": "./dist/index.js", "types": "./dist/index.d.ts" }
  },
  "files": ["dist", "README.md"],
  "sideEffects": false
}
```

---

## Command Coverage Expansion

Current: ~100 patterns covering VimGym's subset.

Additions for general-purpose package:

| Category | Examples |
|---|---|
| Registers | `"ayy`, `"ap`, `"+p`, `"_d` (black hole) |
| Marks | `ma`, `` `a ``, `'a`, `` `. `` (last change), `` `^ `` |
| Macros | `qa`, `q`, `@a`, `@@` |
| Ex commands | `:w`, `:q`, `:wq`, `:q!`, `:s/foo/bar/g`, `:noh`, `:set ...` |
| More text objects | `i{`/`a{`, `i<`/`a<`, `` i` ``/`` a` `` |
| Folding | `zo`, `zc`, `za`, `zR`, `zM`, `zO` |
| Window commands | `[C-w]s`, `[C-w]v`, `[C-w]h/j/k/l`, `[C-w]q` |
| Indentation | `>>`, `<<`, `>i{`, `=ap`, `=G` |
| Spell | `z=`, `]s`, `[s`, `zg`, `zw` |
| Jump list | `[C-o]`, `[C-i]`, `[C-^]` |

All additions are additive entries in `NORMAL_COMMANDS` — no architecture changes.

---

## README Auto-Generation

A build-time script (`scripts/gen-commands-table.ts`) reads `NORMAL_COMMANDS` and emits a markdown table of all supported commands. This is embedded in `README.md` via a comment marker:

```markdown
<!-- COMMANDS_TABLE_START -->
...auto-generated...
<!-- COMMANDS_TABLE_END -->
```

The script runs as part of `pnpm build` in the package.

---

## Versioning: Changesets

```json
// .changeset/config.json
{
  "changelog": "@changesets/changelog-github",
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch"
}
```

**Workflow:**
1. `pnpm changeset` — developer picks bump type + writes entry
2. Changesets bot opens "Version Packages" PR
3. Merge PR → GitHub Actions publishes to npm

---

## GitHub Actions: release.yml

```yaml
name: Release
on:
  push:
    branches: [main]
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, registry-url: "https://registry.npmjs.org" }
      - run: pnpm install
      - run: pnpm --filter vimsplain build
      - uses: changesets/action@v1
        with:
          publish: pnpm changeset publish
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

---

## Key Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Package location | `packages/vimsplain/` in this repo | Single repo, single lockfile, workspace linking |
| App code location | Stays at root | Least disruptive |
| Build format | ESM only + `.d.ts` | Modern bundlers, TypeScript support |
| Build tool | `tsup` | Zero-config, used by most TS libs |
| `SPECIAL_KEYS` ownership | Stays in package, app imports from it | Single source of truth |
| Command coverage | Expanded to general Vim usage | Broader utility and appeal |
| Python files | Deleted | TS is now the source of truth |
| CI/CD | GitHub Actions + Changesets | Standard automated publish workflow |

---

## What's Currently Missing

| Gap | Size |
|---|---|
| `pnpm-workspace.yaml` | tiny |
| `packages/vimsplain/` scaffold | small |
| `tsup` + `tsconfig` for package | small |
| `src/index.ts` public exports | tiny |
| Move source files + tests | tiny |
| Update app import paths (`keyboard.ts`, remove old files) | small |
| Wire `vimsplain: "workspace:*"` in app | tiny |
| Expand command coverage (~10 new categories) | medium |
| New tests for expanded commands | medium |
| `.changeset/` config + GH Actions workflow | small |
| `README.md` with full API docs | medium |
| Auto-generate supported commands table script | small |
| Delete `vimsplain.py` and `index.txt` | tiny |
