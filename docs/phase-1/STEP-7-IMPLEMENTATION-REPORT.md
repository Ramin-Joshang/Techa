# TECHA 2.0 — PHASE 1 / STEP 7 (REVISED) IMPLEMENTATION REPORT
## Complete Legacy Cutover, Greenfield Frontend Rebuild & Production Deployment

- **Execution Phase:** Phase 1 / Step 7 (Revised)
- **Feature Branch:** `phase-1-step-7-greenfield-cutover`
- **Target Runtime:** Node.js 24 LTS, npm 11.x, Next.js 16.4.5, React 19.3.1, TypeScript 5.7.3, Express 5.3.0, Mongoose 9.12.0, Zod 4.6.7
- **Verification Status:** **32 PASSED, 0 FAILED** (Automated Vitest: 211 tests across 22 files passing with 100% success)

---

## A. Root Cause Analysis of Legacy Requests

### 1. Identified Legacy Host References
During the repository audit, all active traffic targeted `https://pool.techa.ir`. The audit identified the following specific sources:
- `LastDocumentation.jsx`: Made direct calls to `SP_fetch('Documentation_GetLastDocumentations')` targeting `https://pool.techa.ir/api/ExecuteTSql/ExecuteStoredProcedure`.
- `LastCourses.jsx`: Hardcoded fetch to `https://pool.techa.ir/api/Course`.
- `RootLayout` (`frontend/src/app/layout.js`): Wrapped all pages in `Providers.js`, which loaded Redux `store.js` -> `lib/utils/axios.js` with `baseURL: 'https://pool.techa.ir/api'`, invoking `loadUserFromCookie()` and importing 14 legacy Redux slices.
- `AuthContext.tsx`: Imported `axiosInstance.ts` hardcoded to `https://pool.techa.ir`.
- `HtmlPreview.jsx`, `ReactPreview.jsx`, `SQLPreview.jsx`: Made runtime interactive execution requests to `https://pool.techa.ir/api/Modification/...`.
- `frontend/next.config.mjs`: Explicitly whitelisted `pool.techa.ir` in `remotePatterns`.

### 2. Old vs. New Request Flow
- **Old Legacy Architecture:**
  Browser / SSR Page ──> Redux / Axios Client ──> HTTPS `https://pool.techa.ir/api/ExecuteTSql/ExecuteStoredProcedure` ──> SQL Server Stored Procedures (`SP_*`)
- **New Greenfield Architecture:**
  Browser ──> HTTPS `https://techa.ir` (IIS 443)
              ├── `/api/v1/public/*` ──> Express 5 (:5000) ──> Mongoose 9 / MongoDB Atlas
              ├── `/api-docs` / `/backend` ──> Express 5 (:5000)
              └── Approved SSR Routes ──> Next.js 16 (:3000) ──(Internal Loopback HTTP)──> Express 5 (:5000)

### 3. Resolution & Evidence of Zero Legacy Host Traffic
- All 19 obsolete route directories (`account`, `auth`, `blog`, `cart`, `courses`, `projects`, etc.) and all legacy Redux slices, Axios clients, and preview components were completely isolated into `frontend/src/legacy-archive/`.
- `next.config.mjs` was stripped of `pool.techa.ir`.
- `frontend/src/proxy.js` was updated to reject any unapproved route or legacy API pattern (`/api/spotx`) with HTTP 404.
- An automated Vitest guard (`frontend/test/unit/legacy-exclusion.test.ts`) inspects every file in `frontend/src` (excluding `legacy-archive`) and asserts **zero occurrences** of `pool.techa.ir`, `ExecuteTSql`, `ExecuteStoredProcedure`, `SP_fetch`, `mssql`, or `tedious`.

---

## B. SQL Server and Stored Procedures Cutover

- **Removed Active Modules:** All active runtime imports of `SP_fetch`, `ExecuteStoredProcedure`, and `ExecuteTSql` were excised from active pages and layouts.
- **Archived Modules:** Legacy Redux actions and API clients were archived in `frontend/src/legacy-archive/` for historical reference.
- **Dependency Audit:** Neither `backend/package.json` nor `frontend/package.json` contains `mssql` or `tedious`.
- **Zero Fallback Assurance:** No failover or fallback to legacy SQL Server exists. If MongoDB or the Express API is unavailable, the application emits a clean, typed `NotFoundError` or `ApiConnectionError` with a friendly Persian error screen.

---

## C. New Backend Connection & Port Architecture

- **Backend Internal Host:** `127.0.0.1`
- **Backend Internal Port:** `5000` (`API_PORT=5000`, `BACKEND_PORT=5000`)
- **Frontend Internal Host:** `127.0.0.1`
- **Frontend Internal Port:** `3000` (`PORT=3000`, `FRONTEND_PORT=3000`)
- **Canonical API Base URL:** `TECHA_API_BASE_URL=http://127.0.0.1:5000/api/v1/public`
- **Database:** MongoDB Atlas via Mongoose 9.12.0
- **Health & Readiness Endpoints:**
  - `GET /api/v1/health/liveness`: Checks process uptime and event-loop response.
  - `GET /api/v1/health/readiness`: Verifies active MongoDB connection (`readyState === 1`).
- **Port Conflict Safeguards:** Express and Next.js bind to distinct loopback ports (5000 and 3000) behind IIS ARR, completely avoiding public port exposure.

---

## D. Greenfield Frontend Architecture & Approved Public Routes

The frontend was completely rebuilt in pure TypeScript and Tailwind CSS as React 19 / Next.js 16 Server Components.

### Approved Route Manifest
1. **Homepage (`/`):**
   - Implemented in `frontend/src/app/page.tsx` as a Server Component.
   - Fetches from `GET /api/v1/public/home` and `GET /api/v1/public/courses`.
   - Features modern Persian RTL layout, platform capability indicators, real published courses grid, methodology section, and zero fabricated numbers or ratings.
2. **Catalog Index (`/docs`):**
   - Implemented in `frontend/src/app/docs/page.tsx`.
   - Full URL search/filter synchronization (category, search query, level), responsive course grid using `DocCard.tsx`, and empty/error states.
3. **Course Overview (`/docs/[courseSlug]`):**
   - Implemented in `frontend/src/app/docs/[slug]/page.tsx` and layout in `layout.tsx`.
   - Dynamic sidebar (`CourseSidebar.tsx`) with collapsible chapters, lesson navigation, course metadata, and statistics.
4. **Lesson Reader (`/docs/[courseSlug]/[lessonSlug]`):**
   - Implemented in `frontend/src/app/docs/[slug]/[lessonId]/page.tsx`.
   - Breadcrumb navigation, quick TOC jump, previous/next lesson navigation, and the full Content Block Engine.

### Content Block Engine (All 13 Variants)
Implemented in `frontend/src/components/docs/content/ContentBlocksRenderer.tsx`:
1. `heading`: H1-H6 with Persian typography, anchor IDs, and LTR badge.
2. `paragraph`: Persian body copy with balanced line height.
3. `rich_text`: Sanitized HTML rendering with zero script execution.
4. `code`: Syntax-highlighted code block with language indicator, copy-to-clipboard, and strict LTR direction.
5. `image`: Responsive image rendering with caption.
6. `video`: Safe HTML5 / iframe player without external ads.
7. `table`: Responsive tabular layout with header highlighting.
8. `callout`: Four typed semantic variants (info, warning, success, error).
9. `quote`: Styled blockquote with author citation.
10. `divider`: Clean horizontal rule separator.
11. `downloadable_file`: Download card with filename, size, and icon.
12. `list`: Bulleted, numbered, and checklist support.
13. `interactive_example`: Safe code viewer and output console with zero `eval()`, `new Function()`, or `srcdoc`.

---

## E. Environment Configuration

### Canonical Root Template (`/.env.example`)
Documented with full consumer, requirement, runtime/build-time, and secret classification:
- `NODE_ENV=production`
- `PRODUCTION_DOMAIN=techa.ir`
- `PRODUCTION_IP=62.220.123.21`
- `BACKEND_HOST=127.0.0.1` / `API_HOST=127.0.0.1`
- `BACKEND_PORT=5000` / `API_PORT=5000`
- `FRONTEND_HOST=127.0.0.1` / `HOST=127.0.0.1`
- `FRONTEND_PORT=3000` / `PORT=3000`
- `TECHA_API_BASE_URL=http://127.0.0.1:5000/api/v1/public` (Server-Only; never prefixed with `NEXT_PUBLIC_`)
- `PUBLIC_SITE_URL=https://techa.ir` / `FRONTEND_ORIGIN=https://techa.ir`
- `PUBLIC_API_URL=https://techa.ir` / `CANONICAL_API_URL=https://techa.ir`
- `MONGODB_URI=mongodb+srv://...` (Secret; runtime only)
- `CORS_ALLOWED_ORIGINS=https://techa.ir,https://www.techa.ir,http://localhost:3000,http://127.0.0.1:3000`
- `TRUST_PROXY=1` / `TRUST_PROXY_HOPS=1`
- `SWAGGER_ENABLED=true`
- `LOG_LEVEL=info`

Workspace-specific templates: `frontend/.env.example` and `backend/.env.example`.

---

## F. Deployment & Process Orchestration

### 1. PM2 Ecosystem (`ecosystem.config.cjs`)
Defines exactly two isolated applications:
- `techa-backend`: `backend/dist/server.js`, port 5000, host 127.0.0.1, output/error logs in `logs/`.
- `techa-frontend`: Next.js production server (`next start`), port 3000, host 127.0.0.1, logs in `logs/`.
- Configuration: `autorestart: true`, `watch: false`, `exec_mode: fork`.

### 2. NPM Root Scripts
- `npm run build:all`: Sequentially builds `@techa/shared`, `@techa/backend`, and `@techa/frontend`.
- `npm run pm2:start`: `pm2 start ecosystem.config.cjs --env production`
- `npm run pm2:restart`, `npm run pm2:stop`, `npm run pm2:delete`, `npm run pm2:status`, `npm run pm2:logs`, `npm run pm2:save`.

### 3. IIS Reverse Proxy (`deploy/iis/web.config`)
- Enforces HTTPS permanent redirection on port 80.
- Proxies `/api/v1/*` to `http://127.0.0.1:5000/api/v1/{R:1}`.
- Proxies `/api-docs*` and `/api-docs.json` to Express port 5000.
- Proxies `/backend` to `http://127.0.0.1:5000/`.
- Proxies all remaining requests to Next.js port 3000.
- Preserves client headers (`X-Forwarded-Proto`, `X-Forwarded-Host`).

---

## G. OpenAPI 3.1 & Swagger Documentation

- **Landing Page:** `GET /` and `GET /backend` returns lightweight, responsive English HTML.
- **Swagger UI:** `GET /api-docs` provides interactive Swagger UI.
- **OpenAPI JSON:** `GET /api-docs.json` serves valid OpenAPI 3.1 specification.
- **Documented Endpoints (7 total):**
  1. `/api/v1/health/liveness`
  2. `/api/v1/health/readiness`
  3. `/api/v1/public/home`
  4. `/api/v1/public/courses`
  5. `/api/v1/public/courses/{courseSlug}`
  6. `/api/v1/public/courses/{courseSlug}/outline`
  7. `/api/v1/public/courses/{courseSlug}/lessons/{lessonSlug}`
- **Registered Schemas:** All 13 content blocks, master union `ContentBlock`, public DTOs, parameters, and error envelopes.
- **Zero Persian Characters:** All summaries, descriptions, and tags in OpenAPI are strictly technical English. Canonical server is `https://techa.ir`.

---

## H. Automated Verification Summary

| Suite / Check | Files | Tests | Result |
|:---|:---:|:---:|:---:|
| Backend Vitest | 14 files | 100 tests | **100% Passed** |
| Frontend Vitest | 8 files | 111 tests | **100% Passed** |
| Legacy Exclusion Guard | `legacy-exclusion.test.ts` | 6 tests | **100% Passed** |
| Route Boundary Enforcement | `route-boundary-enforcement.test.ts` | 55 tests | **100% Passed** |
| Monorepo Typecheck (`tsc`) | 3 workspaces | All files | **0 Errors** |
| Next.js 16 Production Build | Frontend | 4 routes + 404 | **0 Errors** |
| ESLint 9 Flat Config | Workspaces | All active files | **0 Errors** |
| Step 7 Verification Script | `scripts/verify-step7.cjs` | 32 assertions | **32 Passed, 0 Failed** |

---

## I. Git Commit

- **Branch:** `phase-1-step-7-greenfield-cutover`
- **Commit Message:** `feat(phase-1): replace legacy integration and rebuild greenfield frontend`
