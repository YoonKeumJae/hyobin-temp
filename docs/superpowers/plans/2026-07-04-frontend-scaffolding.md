# React + Vite + TypeScript + Tailwind v4 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Initialize this repository root as a working React + Vite + TypeScript frontend project with Tailwind CSS v4.

**Architecture:** Use Vite's official React+TypeScript template as the baseline so the project structure and scripts are standard. Then layer Tailwind v4 through the official `@tailwindcss/vite` plugin and a single stylesheet import. Keep setup minimal and avoid adding routing/state/test frameworks in this scaffold phase.

**Tech Stack:** React, Vite, TypeScript, Tailwind CSS v4, npm

---

## Planned File Structure and Responsibilities

- Create: `package.json` — npm scripts and dependencies
- Create: `index.html` — Vite entry HTML
- Create: `vite.config.ts` — Vite configuration with Tailwind plugin
- Create: `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json` — TypeScript build configs
- Create: `src/main.tsx` — React mount entrypoint
- Create: `src/App.tsx` — base application component
- Create: `src/index.css` — global CSS with Tailwind import
- Create: `src/assets/*` — template assets
- Create: `public/*` — static public files
- Create: `.gitignore` — standard ignore rules for Node/Vite

### Task 1: Bootstrap Vite React+TypeScript in repository root

**Files:**
- Create: `package.json`, `index.html`, `vite.config.ts`, `tsconfig*.json`, `src/*`, `public/*`, `.gitignore`

- [ ] **Step 1: Clean root except `.git` and existing `docs/`**

Run:
```bash
find . -mindepth 1 -maxdepth 1 ! -name '.git' ! -name 'docs' -exec rm -rf {} +
```
Expected: Only `.git/` and `docs/` remain.

- [ ] **Step 2: Scaffold React+TS template into current directory**

Run:
```bash
npm create vite@latest . -- --template react-ts
```
Expected: Vite template files are generated in the repository root.

- [ ] **Step 3: Install dependencies**

Run:
```bash
npm install
```
Expected: `node_modules` is installed with no fatal errors.

- [ ] **Step 4: Commit bootstrap**

Run:
```bash
git add .
git commit -m "chore: scaffold vite react-ts project"
```
Expected: One commit contains baseline Vite React+TS scaffold.

### Task 2: Integrate Tailwind CSS v4 with Vite plugin

**Files:**
- Modify: `vite.config.ts`
- Modify: `src/index.css`
- Modify: `package.json` (devDependencies lock updates via install)

- [ ] **Step 1: Add Tailwind v4 packages**

Run:
```bash
npm install -D tailwindcss @tailwindcss/vite
```
Expected: Tailwind packages are added to devDependencies.

- [ ] **Step 2: Update `vite.config.ts` to register Tailwind plugin**

Apply:
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```
Expected: Vite is configured to process Tailwind.

- [ ] **Step 3: Update `src/index.css` to import Tailwind**

Apply:
```css
@import "tailwindcss";
```
Expected: Tailwind base/utilities are available globally.

- [ ] **Step 4: Commit Tailwind integration**

Run:
```bash
git add package.json package-lock.json vite.config.ts src/index.css
git commit -m "feat: add tailwind v4 to vite setup"
```
Expected: One commit contains Tailwind wiring only.

### Task 3: Verify scaffold is runnable

**Files:**
- No additional file changes expected unless command fixes are required

- [ ] **Step 1: Verify production build succeeds**

Run:
```bash
npm run build
```
Expected: Build completes and outputs `dist/`.

- [ ] **Step 2: Verify development server starts**

Run:
```bash
npm run dev -- --host 127.0.0.1 --port 5173
```
Expected: Vite dev server starts without Tailwind/plugin errors.

- [ ] **Step 3: Stop dev server and commit final validation state**

Run:
```bash
git add .
git commit -m "chore: validate frontend scaffold runtime"
```
Expected: Optional final commit only if any files changed during validation.

## Self-Review

- Spec coverage: includes Vite React+TS root scaffold, Tailwind v4 plugin integration, and runnable validation.
- Placeholder scan: no TBD/TODO markers and each step includes exact commands/snippets.
- Type consistency: all config snippets match Vite + TypeScript + Tailwind v4 naming and imports.

