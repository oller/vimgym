# VimGym

[![Netlify Status](https://api.netlify.com/api/v1/badges/f74dacba-e3b4-4781-8c47-323e153b644f/deploy-status)](https://app.netlify.com/projects/vim-gym/deploys)
[![npm version](https://img.shields.io/npm/v/vimsplain)](https://www.npmjs.com/package/vimsplain)
[![npm downloads](https://img.shields.io/npm/dm/vimsplain)](https://www.npmjs.com/package/vimsplain)
[![CI](https://github.com/oller/vimgym/actions/workflows/ci.yml/badge.svg)](https://github.com/oller/vimgym/actions/workflows/ci.yml)

VimGym is an interactive Vim training game, built to help you learn, hone and test your vim motions.  This repo also contains [`vimsplain`](./packages/vimsplain/README.md), the logic that powers the `MotionLog` element of VimGym, it is used to parse and explain Vim keystroke sequences.  This is published as an [npm package](https://www.npmjs.com/package/vimsplain)

## This repository

A pnpm monorepo containing two projects:

| Package | Description |
|---------|-------------|
| `/` | **VimGym app** — interactive Vim training game (Vite + React, private) |
| [`packages/vimsplain`](./packages/vimsplain/README.md) | **vimsplain** — npm package for parsing and explaining Vim keystrokes (MIT, published) |

---

## VimGym

> **[vim-gym.netlify.app](https://vim-gym.netlify.app/)** — Complete levels by transforming text using Vim motions.

### Features

- **Interactive Levels:** Practice Vim motions in a real editor environment.
- **Scoring System:** Compare your solution against the optimal keystrokes.
- **Progress Tracking:** Track your scores and improvements.
- **Vim Emulation:** Powered by `@replit/codemirror-vim` for accurate Vim behavior.

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

Parse and explain Vim keystroke sequences. Available as a standalone npm package.

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
