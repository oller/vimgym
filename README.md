# VimGym

[![Netlify Status](https://api.netlify.com/api/v1/badges/f74dacba-e3b4-4781-8c47-323e153b644f/deploy-status)](https://app.netlify.com/projects/vim-gym/deploys)

Interactive Vim training game where users complete levels by transforming text using Vim motions.

## Features

- **Interactive Levels:** Practice Vim motions in a real editor environment.
- **Scoring System:** Compare your solution against the optimal keystrokes.
- **Progress Tracking:** Track your scores and improvements.
- **Vim Emulation:** Powered by `@replit/codemirror-vim` for accurate Vim behavior.

## Tech Stack

- **Framework:** [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) + [Motion](https://motion.dev/)
- **Editor:** [CodeMirror 6](https://codemirror.net/) with [@replit/codemirror-vim](https://github.com/replit/codemirror-vim)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand) + [Nuqs](https://nuqs.47ng.com/) (URL state)
- **Backend/Network:** [Supabase](https://supabase.com/) (RPC-first) + [Zod](https://zod.dev/)
- **Testing:** [Vitest](https://vitest.dev/) + React Testing Library
- **Tooling:** [Biome](https://biomejs.dev/) (Linter/Formatter)

## Development

### Prerequisites

- Node.js (Latest LTS recommended)
- pnpm

### Setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Start the development server:

   ```bash
   pnpm dev
   ```

### Commands

- `pnpm dev`: Start development server
- `pnpm build`: Build for production
- `pnpm preview`: Run webserver to preview production build
- `pnpm lint`: Check linting and formatting issues (Biome)
- `pnpm lint:fix`: Fix linting and formatting issues (Biome)
- `pnpm test`: Run tests in watch mode
- `pnpm test:run`: Run tests once
- `pnpm knip`: Run knip to find unused dependencies
- `pnpm tsc`: Run TypeScript type checking
- `pnpm types:sync`: Get types from Supabase and sync them to the project

## Roadmap

- [x] Motion log grouping
- [x] Optimal solution comparison
- [x] Analytics (Vexo)
- [x] Keystroke visualization
- [x] Vimsplain.ts package
- [x] Text object support improvements
- [ ] Crowd-sourced levels
