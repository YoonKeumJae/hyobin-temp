# Frontend Scaffolding Design (React + Vite + TypeScript + Tailwind v4)

## Goal
- Create a minimal frontend scaffold in the repository root with:
  - React
  - Vite
  - TypeScript
  - Tailwind CSS v4

## Scope
- In scope:
  - Initialize Vite React+TS project in current repository root
  - Install and configure Tailwind v4 using `@tailwindcss/vite`
  - Ensure base app starts with `npm run dev`
- Out of scope:
  - Routing setup
  - State management libraries
  - API integration
  - Design system and UI component libraries

## Chosen Approach
Use Vite official React+TypeScript template, then integrate Tailwind v4 via Vite plugin.

### Why this approach
- Latest recommended setup with low config overhead
- Keeps scaffold minimal and easy to extend
- Avoids legacy PostCSS-first wiring unless specifically required

## Architecture and Components
- Root-level Vite app structure (default template):
  - `index.html`
  - `src/main.tsx`
  - `src/App.tsx`
  - `src/index.css`
- Tailwind integration:
  - Add Tailwind Vite plugin in `vite.config.ts`
  - Import Tailwind in `src/index.css`

## Data Flow
- No runtime data flow changes for this phase.
- Static scaffold only, rendering `App` from `main.tsx`.

## Error Handling
- If scaffold or dependency installation fails, stop immediately and surface command failure.
- No silent fallbacks.

## Verification
- Project dependencies install successfully.
- Development server command exists and is runnable:
  - `npm run dev`

## Risks and Mitigations
- Risk: Version mismatch in Tailwind ecosystem packages.
  - Mitigation: Install official packages together (`tailwindcss`, `@tailwindcss/vite`) and apply documented minimal setup.

