# VimGym

[![Netlify Status](https://api.netlify.com/api/v1/badges/f74dacba-e3b4-4781-8c47-323e153b644f/deploy-status)](https://app.netlify.com/projects/vim-gym/deploys)
[![npm version](https://img.shields.io/npm/v/vimsplain)](https://www.npmjs.com/package/vimsplain)
[![npm downloads](https://img.shields.io/npm/dm/vimsplain)](https://www.npmjs.com/package/vimsplain)
[![CI](https://github.com/oller/vimgym/actions/workflows/ci.yml/badge.svg)](https://github.com/oller/vimgym/actions/workflows/ci.yml)

VimGym is an interactive Vim training game, built to help you learn, hone and test your vim motions.  This repo also contains [`vimsplain`](./packages/vimsplain/README.md), the logic that powers the `MotionLog` element of VimGym, it is used to parse and explain Vim keystroke sequences.  This is published as an [npm package](https://www.npmjs.com/package/vimsplain).

## This repository

A pnpm monorepo containing two projects:

| Package | Description |
|---------|-------------|
| `/` | **VimGym app** — Interactive Vim training game  |
| [`packages/vimsplain`](./packages/vimsplain/README.md) | **vimsplain** — npm package for parsing and explaining Vim keystrokes (MIT, published) |

---

## VimGym

> **[vim-gym.netlify.app](https://vim-gym.netlify.app/)** — Complete levels by transforming text using Vim motions.

### Features

- **Interactive Levels:** 33 challenges across 6 categories (Deletion & Insertion, Text Objects, Visual Mode, Search & Replace, Navigation & Editing, Macros & Registers), each with syntax-highlighted multi-language editing (HTML, JS/TS, JSON, Markdown).
- **Crowd-Sourced Scoring:** Every completion is submitted anonymously. Each level shows the global best score with a full keystroke replay tooltip ("Optimum Run"), the crowd-sourced average, and total completion count.
- **Score Distribution Chart:** An interactive SVG sparkline renders the histogram of all player scores for a level — hover to see exactly how many players achieved each keystroke count.
- **Personal Percentile Ranking:** After completing a level your score is ranked against all other players and displayed as a percentile (e.g. "Top 3%"). Tying the global best highlights your score in gold.
- **Motion Log:** Real-time keystroke parsing powered by `vimsplain` — every Vim command you type is grouped and explained in plain English as animated chips (e.g. `dw` → "delete word").
- **Progress Tracking:** Collapsible category groups with animated progress bars and per-category completion counts, persisted across sessions.
- **URL-Based State:** The active level is stored in the URL (`?levelId=...`) so levels are shareable and bookmarkable.
- **Custom Vim Commands:** `:e` resets the level, `:e N` jumps to level N, `:q`/`:wq`/`:qa` trigger a CRT power-off animation, and `gc` works as a comment operator.
- **Vim Emulation:** Powered by `@replit/codemirror-vim` for accurate Vim behaviour, with mobile keystroke support and mouse selection disabled to enforce Vim-style navigation.

### Tech Stack

- **Framework:** [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) + [Motion](https://motion.dev/)
- **Editor:** [CodeMirror 6](https://codemirror.net/) with [@replit/codemirror-vim](https://github.com/replit/codemirror-vim)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand) + [Nuqs](https://nuqs.47ng.com/) (URL state)
- **Backend/Network:** [Supabase](https://supabase.com/) (RPC-first) + [Zod](https://zod.dev/)
- **Testing:** [Vitest](https://vitest.dev/) + React Testing Library
- **Tooling:** [Biome](https://biomejs.dev/) (Linter/Formatter)

### Development

**Prerequisites:** Node.js (latest LTS) + pnpm

```bash
pnpm install   # Install dependencies
pnpm dev       # Start development server
```

**Commands:**

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build |
| `pnpm test` | Run tests in watch mode |
| `pnpm test:run` | Run tests once |
| `pnpm tsc` | TypeScript type checking |
| `pnpm lint` | Check linting and formatting (Biome) |
| `pnpm lint:fix` | Fix linting and formatting (Biome) |
| `pnpm deploy` | Full pre-deploy check (build, typecheck, lint, test) |
| `pnpm knip` | Find unused dependencies |
| `pnpm types:sync` | Sync types from Supabase |

---

## vimsplain

Parse and explain Vim keystroke sequences. Available as a standalone [npm package](https://www.npmjs.com/package/vimsplain).

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

```bash
npm install vimsplain
```

See [`packages/vimsplain/README.md`](./packages/vimsplain/README.md) for the full API, supported commands, and contributing guide.

---

## Roadmap

- [x] Motion log grouping
- [x] Optimal solution comparison
- [x] Analytics (Vexo)
- [x] Keystroke visualization
- [x] vimsplain npm package
- [x] Text object support improvements
- [ ] Crowd-sourced levels
