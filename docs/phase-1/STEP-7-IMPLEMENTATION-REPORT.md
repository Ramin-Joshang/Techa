# TECHA 2.0 — PHASE 1 / STEP 7: IMPLEMENTATION REPORT
## Production Deployment Preparation, Environment Configuration, PM2 Orchestration & Complete OpenAPI/Swagger Documentation

- **Date:** November 2026
- **Branch:** `phase-1-step-7-deployment-api-docs`
- **Scope:** Canonical Environment Configuration (`.env.example`), Windows Server 2025 Architecture, IIS Reverse Proxy & ARR Routing (`web.config`), PM2 Process Orchestration (`ecosystem.config.cjs`), Complete OpenAPI 3.1 & Swagger UI Documentation, English Root Landing Page, CORS & Trusted Proxy Hardening, Automated Deployment Checkers & Test Suites.

---

### 1. Executive Summary

Phase 1 / Step 7 prepares TECHA 2.0 for enterprise production deployment on the user's **Windows Server 2025 VPS** (`62.220.123.21`) under the canonical domain `https://techa.ir`. Both Next.js 16 (frontend) and Express 5 (backend) run reliably as independent Node.js 24 LTS processes supervised by a unified PM2 ecosystem behind Internet Information Services (IIS 10) on loopback.

In addition, Step 7 delivers a comprehensive, maintainable, English-language API documentation system using **OpenAPI 3.1** and **Swagger UI** generated from the canonical Zod 4 contracts. A clean, responsive English landing page is served at the backend root (`GET /` and `/backend`) providing immediate visibility into service health and interactive documentation without exposing private infrastructure details or secrets.

All 32 verification criteria defined in `scripts/verify-step7.cjs` passed with 100% success: **205 automated unit and integration tests passed across 21 test files**, TypeScript typechecking passed with zero errors across all three workspaces, ESLint 9 completed with zero errors, and the unified production build (`npm run build:all`) compiled flawlessly.

---

### 2. Deployment Architecture & Domain/Port Topology

#### 2.1. Network Topology
```
[Public Internet]
       │
       ▼ HTTPS (443) / HTTP (80 Redirect)
┌─────────────────────────────────────────────────────────┐
│ Windows Server 2025 — IIS 10 Reverse Proxy Gateway       │
│ Public Static IP: 62.220.123.21                         │
│ Canonical Domain: https://techa.ir                      │
└────────────┬───────────────────────────────┬────────────┘
             │ (ARR Reverse Proxy)           │ (ARR Reverse Proxy)
             │                               │
             ▼                               ▼
┌──────────────────────────────┐┌──────────────────────────────┐
│ Next.js 16 Frontend App      ││ Express 5 Backend REST API   │
│ Listener: 127.0.0.1:3000     ││ Listener: 127.0.0.1:5000     │
│ - / (Homepage SSR)           ││ - /api/v1/public/*           │
│ - /docs (Catalog SSR)        ││ - /api/v1/health/*           │
│ - /docs/:slug (Course SSR)   ││ - /api-docs (Swagger UI)     │
│ - /docs/:slug/:lesson (SSR)  ││ - /api-docs.json (OpenAPI)   │
│ - /_next/* (Static Chunks)   ││ - / & /backend (Landing HTML)│
└──────────────────────────────┘└──────────────────────────────┘
```

#### 2.2. Port Isolation and Security Boundary
- **Frontend Listener:** `127.0.0.1:3000` (loopback only)
- **Backend Listener:** `127.0.0.1:5000` (loopback only)
- **Port Distinctness:** Verified. The two applications listen on different internal TCP ports and never conflict.
- **Private Port Security:** Ports `3000` and `5000` remain private to localhost. They are not exposed to the public internet, avoiding raw HTTP exposure. Public traffic is accepted exclusively on ports `80` (redirect) and `443` (TLS) via IIS.

#### 2.3. Public URL Mapping Matrix (IIS Reverse Proxy)

| Public URL Path | Upstream Target | Purpose |
|:---|:---|:---|
| `https://techa.ir/` | `http://127.0.0.1:3000/` | Next.js 16 Homepage (Server-Side Rendered) |
| `https://techa.ir/docs` | `http://127.0.0.1:3000/docs` | Next.js 16 Course Catalog (Server-Side Rendered) |
| `https://techa.ir/docs/[slug]` | `http://127.0.0.1:3000/docs/{R:1}` | Next.js 16 Course Detail & Outline |
| `https://techa.ir/docs/[slug]/[sub]` | `http://127.0.0.1:3000/docs/{R:1}` | Next.js 16 Lesson Viewer with Content Blocks |
| `https://techa.ir/_next/*` | `http://127.0.0.1:3000/_next/{R:1}` | Next.js static assets and JS/CSS chunks |
| `https://techa.ir/api/v1/*` | `http://127.0.0.1:5000/api/v1/{R:1}` | Express 5 Public APIs and Health Probes |
| `https://techa.ir/api-docs` | `http://127.0.0.1:5000/api-docs` | Interactive Swagger UI Documentation |
| `https://techa.ir/api-docs/*` | `http://127.0.0.1:5000/api-docs/{R:1}` | Swagger UI static assets and bundles |
| `https://techa.ir/api-docs.json` | `http://127.0.0.1:5000/api-docs.json` | Raw OpenAPI 3.1 JSON Specification |
| `https://techa.ir/backend` | `http://127.0.0.1:5000/` | Backend English Landing Page |

---

### 3. Canonical Environment Configuration (`.env.example`)

#### 3.1. Inventory & Parameter Reference
The monorepo now defines a single canonical environment template at `.env.example`, supplemented by workspace-specific references `frontend/.env.example` and `backend/.env.example`:

| Variable Name | Consumer | Type | Required? | Timing | Default Value | Description |
|:---|:---|:---:|:---:|:---:|:---|:---|
| `NODE_ENV` | All | Enum | Yes | Build & Runtime | `production` | Execution mode (`production`, `development`, `test`). |
| `PORT` | Frontend | Number | No | Runtime | `3000` | Internal TCP port for Next.js 16 server. |
| `HOST` | Frontend | String | No | Runtime | `127.0.0.1` | Network interface binding for Next.js. |
| `TECHA_API_BASE_URL` | Frontend | URL | No | Runtime | `http://127.0.0.1:5000/api/v1/public` | Server-to-server API URL for SSR data fetching on loopback. |
| `API_PORT` | Backend | Number | No | Runtime | `5000` | Internal TCP port for Express 5 server. |
| `API_HOST` | Backend | String | No | Runtime | `127.0.0.1` | Network interface binding for Express. |
| `CANONICAL_API_URL` | Backend | URL | No | Runtime | `https://techa.ir` | Public HTTPS URL for OpenAPI servers and link generation. |
| `SWAGGER_ENABLED` | Backend | Boolean | No | Runtime | `true` | Toggles availability of Swagger UI and OpenAPI JSON. |
| `MONGODB_URI` | Backend | String | **Yes (Prod)** | Runtime | None (Placeholder) | MongoDB Atlas connection string. Strictly mandatory in production. |
| `PRODUCTION_DOMAIN` | Scripts | String | No | Runtime | `techa.ir` | Primary production domain name. |
| `PRODUCTION_IP` | Scripts | String | No | Runtime | `62.220.123.21` | Static IPv4 address of production server. |
| `CORS_ORIGINS` | Backend | String | No | Runtime | `https://techa.ir,https://www.techa.ir` | Comma-separated allowed browser origins for CORS. |
| `FRONTEND_ORIGIN` | Backend | String | No | Runtime | `https://techa.ir` | Primary frontend origin for cross-origin validation. |
| `TRUST_PROXY_HOPS` | Backend | Number | No | Runtime | `1` | Number of trusted proxy hops behind IIS ARR (1 on loopback). |
| `LOG_LEVEL` | Backend | Enum | No | Runtime | `info` | Minimum log severity level (`fatal`, `error`, `warn`, `info`, `debug`, `trace`). |

#### 3.2. Typed Validation & Fail-Fast Architecture (Zod 4)
- **Validation Engine:** `backend/src/core/config/env.ts` uses strict Zod 4 schemas.
- **Fail-Fast:** Startup terminates immediately with an explanatory error if `MONGODB_URI` is missing when `NODE_ENV=production`.
- **Sanitized Errors:** Error issues are sanitized to path, code, and message; connection strings and credentials are never emitted to logs or standard error.
- **Port Constraints:** Enforces `1024 <= port <= 65535` to prevent binding to privileged or out-of-range ports.

---

### 4. CORS, Same-Origin Routing & Trusted Proxy

1. **Same-Origin Public Routing:**
   Under IIS ARR reverse-proxy routing, browser requests to `/api/v1/...` share the exact origin `https://techa.ir`. Cross-origin browser permissions are not required for standard site navigation.
2. **Strict Production Allowlist:**
   The backend explicitly validates incoming `Origin` headers against `https://techa.ir` and `https://www.techa.ir`.
3. **No Wildcard Credentials:**
   The public read-only API does not use authentication cookies; `credentials: false` is configured, preventing wildcard credentials vulnerabilities.
4. **Header Transparency:**
   Valid cross-origin requests receive `Access-Control-Allow-Origin: <origin>` accompanied by `Vary: Origin`. Disallowed origins receive no CORS header.
5. **Trusted Proxy:**
   `app.set('trust proxy', 'loopback')` is configured in Express. Original client IP (`X-Forwarded-For`), protocol (`X-Forwarded-Proto`), and host (`X-Forwarded-Host`) supplied by IIS ARR are safely processed without trusting arbitrary external proxies.

---

### 5. Unified Production Build & PM2 Orchestration

#### 5.1. One-Command Build: `npm run build:all`
Builds all production workspaces in strict dependency order:
```bash
npm run build --workspace=@techa/shared && \
npm run build --workspace=@techa/backend && \
npm run build --workspace=@techa/frontend
```
- Step 1: Compiles `@techa/shared` to `shared/dist/`.
- Step 2: Compiles `@techa/backend` to `backend/dist/server.js`.
- Step 3: Compiles `@techa/frontend` with Next.js 16 Turbopack compiler.
- Verified: Stops immediately on any workspace error; clean zero-exit status.

#### 5.2. Root PM2 Orchestration (`ecosystem.config.cjs`)
Defines two managed production applications:
- **`techa-frontend`:**
  - Script: Next.js production binary (`next start -p 3000 -H 127.0.0.1`)
  - CWD: `./frontend`
  - Max memory restart: `1G`
  - Autorestart: `true`, Restart delay: `2000ms`, Min uptime: `5s`
  - Dedicated log files: `logs/pm2-frontend-out.log`, `logs/pm2-frontend-error.log`
- **`techa-backend`:**
  - Script: Compiled entry point (`dist/server.js`)
  - CWD: `./backend`
  - Max memory restart: `1G`
  - Autorestart: `true`, Restart delay: `2000ms`, Min uptime: `5s`
  - Dedicated log files: `logs/pm2-backend-out.log`, `logs/pm2-backend-error.log`

#### 5.3. Process Management Scripts

| Command | Action |
|:---|:---|
| `npm run build:all` | Compiles all three workspaces in dependency order |
| `npm run pm2:start` | Launches both processes under PM2 in production mode |
| `npm run pm2:status` | Displays running status, PID, CPU, and memory usage |
| `npm run pm2:logs` | Streams live unified output and error logs |
| `npm run pm2:restart` | Gracefully restarts both processes |
| `npm run pm2:stop` | Stops both applications without deleting configuration |
| `npm run pm2:delete` | Removes both processes from PM2 supervisor |
| `npm run pm2:save` | Persists running process list for Windows service recovery |

---

### 6. OpenAPI 3.1 Specification & Swagger UI

#### 6.1. Documentation Endpoints
- **Backend Root Landing Page:** `GET /` and `GET /backend`
  - Returns a clean, responsive HTML page with title `TECHA API Service`.
  - Displays service status ("Service Operational"), version (`1.0.0`), and quick-access buttons to documentation.
  - Zero leakage of MongoDB connection strings, credentials, or internal IPs.
  - Functions cleanly even if MongoDB is temporarily unavailable.
- **Interactive Swagger UI:** `GET /api-docs`
  - Interactive API documentation powered by `swagger-ui-express`.
  - Accessible publicly via `https://techa.ir/api-docs`.
- **Raw OpenAPI Specification:** `GET /api-docs.json`
  - Full OpenAPI 3.1.0 JSON document.

#### 6.2. Documented Route Inventory (7 Endpoints)
1. `GET /api/v1/health/liveness` (Tag: `Health`) — Server process liveness probe.
2. `GET /api/v1/health/readiness` (Tag: `Health`) — MongoDB Atlas connection status probe.
3. `GET /api/v1/public/home` (Tag: `Public Content`) — Landing page hero, CTA, features, and SEO configuration.
4. `GET /api/v1/public/courses` (Tag: `Public Courses`) — Paginated course catalog with level, tag, and limit filters.
5. `GET /api/v1/public/courses/{courseSlug}` (Tag: `Public Courses`) — Course overview, target audience, prerequisites, and stats.
6. `GET /api/v1/public/courses/{courseSlug}/outline` (Tag: `Public Courses`) — Course syllabus with published chapters and lesson summaries.
7. `GET /api/v1/public/courses/{courseSlug}/lessons/{lessonSlug}` (Tag: `Public Lessons`) — Lesson reader with full array of 13 content block types.

#### 6.3. Content Block Schema Coverage
All 13 supported content block variants are formally registered in the OpenAPI `components/schemas` and represented in the `ContentBlock` discriminated union:
1. `HeadingBlock` (`heading`)
2. `ParagraphBlock` (`paragraph`)
3. `RichTextBlock` (`richText`)
4. `CodeBlock` (`code`)
5. `ImageBlock` (`image`)
6. `VideoBlock` (`video`)
7. `TableBlock` (`table`)
8. `CalloutBlock` (`callout`)
9. `QuoteBlock` (`quote`)
10. `DividerBlock` (`divider`)
11. `DownloadableFileBlock` (`downloadableFile`)
12. `ListBlock` (`list`)
13. `InteractiveExampleBlock` (`interactiveExample`)

#### 6.4. English-Only Verification
An automated test verifies that all titles, summaries, descriptions, and tag names in the OpenAPI document contain **zero Persian or Arabic script characters** (`/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/`). All documentation is written in technical English.

---

### 7. Automated Test Matrix

#### 7.1. Test Inventory (205 Tests across 21 Test Files)
- **Backend Test Suites (14 files, 100 tests):**
  - `test/unit/openapi-and-docs.test.ts` (**10 tests** — new Step 7 suite)
  - `test/unit/cors-and-env.test.ts` (**11 tests** — new Step 7 suite)
  - `test/unit/public-api-courses.test.ts` (7 tests)
  - `test/unit/public-api-home.test.ts` (2 tests)
  - `test/unit/public-api-lesson.test.ts` (5 tests)
  - `test/unit/public-api-outline.test.ts` (3 tests)
  - `test/unit/content-blocks.test.ts` (9 tests)
  - `test/unit/database-lifecycle.test.ts` (8 tests)
  - `test/unit/domain-schemas.test.ts` (9 tests)
  - `src/modules/health/health.test.ts` (3 tests)
  - `test/unit/import-package.test.ts` (2 tests)
  - `test/unit/interactive-example.test.ts` (11 tests)
  - `test/unit/primitives-and-paths.test.ts` (11 tests)
  - `test/unit/mongoose-models-and-services.test.ts` (9 tests)
- **Frontend Test Suites (7 files, 105 tests):**
  - `test/unit/route-boundary-enforcement.test.ts` (55 tests)
  - `test/unit/content-blocks-renderer.test.ts` (15 tests)
  - `test/unit/api-config-and-errors.test.ts` (10 tests)
  - `test/unit/api-client.test.ts` (7 tests)
  - `test/unit/public-api-methods.test.ts` (7 tests)
  - `test/unit/route-ssr-integration.test.ts` (7 tests)
  - `test/unit/frontend-regression.test.ts` (4 tests)
- **Total:** **205 passed tests, 0 failed (100% PASS)**

#### 7.2. Step 7 Verification Protocol (`scripts/verify-step7.cjs`)
All 32 automated checks passed successfully:
- Runtime is Node.js 24.x LTS (`v24.22.2`)
- Canonical `.env.example` and workspace templates exist with all 15 variables
- No real `.env` file or secret committed to git
- PM2 `ecosystem.config.cjs` defines two distinct apps with separate working directories and distinct ports
- OpenAPI 3.1 specification declares version 3.1.0 and documents all 7 endpoints
- All 13 content block schemas registered in OpenAPI components
- Zero Persian characters in public OpenAPI summaries and descriptions
- Production canonical URL `https://techa.ir` configured in server list (no private IPs)
- PowerShell deployment check script and IIS `web.config` exist
- All 205 automated tests pass (100 backend + 105 frontend)
- TypeScript typecheck passes across all workspaces (0 errors)
- Production build `npm run build:all` compiles all workspaces
- ESLint 9 executes with 0 errors

---

### 8. Production Readiness Breakdown

The implementation state is structured into five operational tiers:

#### Tier 1 — Fully Implemented and Verified in Monorepo
- Canonical environment template (`.env.example`) and workspace templates (`frontend/.env.example`, `backend/.env.example`).
- Zod 4 typed environment validation with fail-fast production rules and sanitized error output.
- PM2 ecosystem file (`ecosystem.config.cjs`) with dual-process separation and reliability parameters.
- One-command unified build script (`npm run build:all`).
- Root PM2 orchestration scripts (`pm2:start`, `pm2:restart`, `pm2:stop`, `pm2:delete`, `pm2:status`, `pm2:logs`, `pm2:save`).
- Backend root landing page (`GET /` and `GET /backend`) in technical English.
- Complete OpenAPI 3.1 specification (`GET /api-docs.json`) and Swagger UI (`GET /api-docs`).
- Full coverage of all 7 endpoints and 13 content block schemas.
- Strict CORS allowlist with `credentials: false` and `Vary: Origin`.
- Express trusted-proxy configuration for loopback ARR.
- 205 automated unit and integration tests passing.

#### Tier 2 — Verified Locally
- Local HTTP responses verified for root landing page (`200 OK`), Swagger UI (`200 OK`), and OpenAPI JSON (`200 OK`).
- Local compilation and process start verified for both frontend and backend.
- Local typecheck and production Next.js 16 build verified.

#### Tier 3 — Requires the Real Windows Server 2025 VPS
- Executing `check-windows-deployment.ps1` on the actual VPS.
- Registering the PM2 Windows Service via NSSM (`TechaPM2Service`) for boot persistence.
- Configuring `PM2_HOME=C:\ProgramData\pm2` in the Windows system environment.

#### Tier 4 — Requires Server Administrator Configuration
- Adding the DNS A record pointing `techa.ir` to `62.220.123.21`.
- Binding the SSL/TLS certificate to port 443 in IIS.
- Enabling Application Request Routing (ARR) Proxy in IIS Manager.
- Copying `deploy/iis/web.config` into the IIS site root directory.

#### Tier 5 — Optional Future Enhancements
- Dedicated external Redis cache for Next.js multi-instance scaling.
- Content Delivery Network (CDN) edge caching for static assets.

---

### 9. Complete Inventory of Created and Modified Files

#### Created Files:
1. `.env.example` (Canonical complete environment template)
2. `frontend/.env.example` (Frontend-specific environment template)
3. `backend/.env.example` (Backend-specific environment template)
4. `ecosystem.config.cjs` (Root PM2 process supervisor configuration)
5. `backend/src/core/docs/extend-zod.ts` (Zod 4 OpenAPI prototype patching helper)
6. `backend/src/core/docs/openapi.ts` (OpenAPI 3.1 specification generator and schema registry)
7. `backend/src/core/docs/landing-page.ts` (English backend root landing page HTML)
8. `backend/test/unit/openapi-and-docs.test.ts` (10 automated tests for Swagger UI, OpenAPI spec, and English copy)
9. `backend/test/unit/cors-and-env.test.ts` (11 automated tests for CORS, preflight, and Zod 4 env validation)
10. `scripts/check-windows-deployment.ps1` (Windows Server 2025 PowerShell network and listener checker)
11. `deploy/iis/web.config` (Reusable IIS reverse proxy and URL rewrite template)
12. `docs/deployment/ENVIRONMENT.md` (Complete environment variable reference guide)
13. `docs/deployment/IIS-REVERSE-PROXY.md` (IIS reverse proxy, ARR, and SSL setup instructions)
14. `docs/deployment/WINDOWS-SERVICE-SETUP.md` (PM2 Windows service persistence and NSSM setup guide)
15. `scripts/verify-step7.cjs` (Automated Step 7 Verification Protocol)
16. `docs/phase-1/STEP-7-IMPLEMENTATION-REPORT.md` (This technical engineering report)

#### Modified Files:
1. `package.json` (Added `build:all`, PM2 scripts, `verify:step7`, `verify:deployment`, `@asteasolutions/zod-to-openapi`, `swagger-ui-express`, `pm2`)
2. `backend/package.json` (Declared `swagger-ui-express` and `@asteasolutions/zod-to-openapi`)
3. `backend/src/core/config/env.ts` (Enhanced with `CANONICAL_API_URL`, `SWAGGER_ENABLED`, sanitized error output, exported `validateEnv`)
4. `backend/src/core/middleware/security.ts` (Strict CORS allowlist, `credentials: false`, Swagger CSP)
5. `backend/src/app.ts` (Mounted root landing page, `/backend`, `/api-docs`, `/api-docs.json`, and trusted proxy)
6. `.gitignore` (Added `logs/` directory)

---

### 10. Git Commit Details

- **Branch:** `phase-1-step-7-deployment-api-docs`
- **Commit Message:** `feat(phase-1): prepare production deployment and API documentation`
- **Working-Tree Status:** Ready for commit and final review.
