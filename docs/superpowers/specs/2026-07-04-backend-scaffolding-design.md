# Backend Scaffolding Design (NestJS + TypeScript)

## Goal
- Reorganize the repository into:
  - `frontend/` for existing React app
  - `backend/` for a new NestJS backend
- Deliver a minimal backend scaffold with a health-check endpoint.

## Scope
- In scope:
  - Move current frontend files under `frontend/`
  - Create NestJS app in `backend/`
  - Add `GET /health` endpoint returning `{ "status": "ok" }`
  - Ensure backend build/test/start scripts work
- Out of scope:
  - Database integration
  - Authentication
  - Business domain modules
  - Monorepo tooling (Nx/Turbo)

## Chosen Approach
Use Nest CLI standard generation for `backend/`, then add a dedicated health module with minimal code.

### Why this approach
- Fastest path to stable, conventional Nest structure
- Reduces manual wiring mistakes
- Keeps future extension straightforward

## Architecture and Components
- Root:
  - `frontend/` — existing Vite React+TS app
  - `backend/` — NestJS app root
- Backend components:
  - `backend/src/main.ts` — app bootstrap
  - `backend/src/app.module.ts` — root module
  - `backend/src/health/health.controller.ts` — `/health` route
  - `backend/src/health/health.service.ts` — health response provider
  - `backend/src/health/health.module.ts` — health feature module

## Data Flow
- Client calls `GET /health`
- `HealthController` delegates to `HealthService`
- `HealthService` returns static JSON payload `{ status: "ok" }`

## Error Handling
- Keep Nest default exception handling.
- No custom filters/middleware in this scaffold phase.

## Verification
- Backend commands in `backend/`:
  - `npm run build`
  - `npm run test`
  - `npm run start:dev` (server boot and route reachable)
- Functional check:
  - `curl http://127.0.0.1:<port>/health` returns status payload.

## Risks and Mitigations
- Risk: File move may break frontend path assumptions.
  - Mitigation: Keep frontend content unchanged, only relocate under `frontend/`.
- Risk: CLI version differences.
  - Mitigation: Use generated defaults and avoid extra plugins at scaffold stage.

