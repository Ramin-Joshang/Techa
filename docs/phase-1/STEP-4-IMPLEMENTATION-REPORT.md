# TECHA 2.0 — PHASE 1 / STEP 4: IMPLEMENTATION REPORT
## Frontend Integration, Server-Side Rendering (SSR) & Public Data Fetching

- **Date:** November 2026
- **Branch:** `phase-1-step-4-frontend-ssr-integration`
- **Scope:** Server-Side Data Access Layer, Next.js 14 App Router Public Pages SSR Integration, 13-Type Content Blocks Renderer, Outline Context & Dynamic Sidebar, SEO Metadata API, Loading & Error Boundaries, Automated Test Suite (50 Frontend Tests, 129 Total Monorepo Tests), Production Build Verification.

---

### 1. Executive Summary

Phase 1 / Step 4 delivers the complete frontend data integration and server-side rendering (SSR) layer for TECHA 2.0. The 4 approved public routes (`/`, `/docs`, `/docs/[courseSlug]`, and `/docs/[courseSlug]/[lessonSlug]`) have been converted into Async Server Components powered by a server-only data access layer (`frontend/src/lib/server/`). The data access layer communicates exclusively with the 5 read-only public REST endpoints developed in Step 3, strictly validating every response against shared Zod schemas (`ApiResponseSchema<T>`).

All 13 content block types defined in the Greenfield Content Engine are rendered deterministically with zero client-side code execution, iframe sandboxes, or `eval` vulnerabilities. Course navigation and sidebar state are synchronized via a lightweight Server-Fed React Context (`CourseOutlineContext`), eliminating legacy Redux runtime dependencies for documentation.

The full monorepo test suite (18 test files, 129 tests: 79 backend + 50 frontend) passes with 100% success rate, TypeScript typechecks cleanly across all workspaces, and the Next.js production build completes without errors.

---

### 2. Runtime Environment & Dependency Inventory

| Component | Target Version | Installed / Verified Version | Notes |
|:---|:---|:---|:---|
| **Node.js** | `>= 20.0.0` | `v20.19.0` | Active LTS runtime |
| **Monorepo Manager** | npm workspaces | npm `10.8.2` | `@techa/shared`, `@techa/backend`, `@techa/frontend` |
| **Next.js** | Next.js 14 App Router | `14.2.35` | Preserved as instructed (no breaking framework upgrades) |
| **React** | React 18 | `18.3.1` | Preserved with RSC support |
| **TypeScript** | `>= 5.0.0` | `5.7.3` | Strict typechecking across all workspaces |
| **Zod** | Shared Schema Library | `3.24.1` | Runtime schema validation gate on all API responses |
| **Vitest** | Frontend Testing | `2.1.8` | JSDOM environment, mocked server HTTP responses |

---

### 3. Step 3 Contract Audit Findings & Implementation Alignment

Prior to implementing the frontend data fetching layer, an audit of the Step 3 backend contracts and implementations was conducted:

1. **Homepage Endpoint (`GET /api/v1/public/home`):**
   - Step 3 implemented `getHomepage` returning `SitePagePublicDto` (`pageKey: 'home'`, `title`, `heroSection`, `features`, `seo`).
   - The endpoint does not bundle courses within the home response.
   - **Alignment:** The frontend `app/page.js` executes parallel server fetching: `getHomepage()` for the page metadata/hero/features and `getPublishedCourses({ limit: 6 })` for the "Last Documentation" section.

2. **Course Listing Pagination & Sorting (`GET /api/v1/public/courses`):**
   - Step 3 enforced `limit <= 50` via `CourseListQuerySchema.strict()`.
   - Supported query parameters: `page`, `limit`, `level`, `tag`, `search`.
   - **Alignment:** The frontend `app/docs/page.js` maps search query parameters (`q` -> `search`, `level`, `tag`, `page`) with page size clamped to 12 items per page (`limit: 12`), fully compliant with backend schema boundaries.

3. **Monorepo Test Count Inventory:**
   - Pre-existing Backend tests: 79 tests across 12 test files.
   - Step 4 Frontend tests: 50 tests across 6 test files.
   - **Total Monorepo Tests:** 129 tests across 18 test files (100% PASS).

---

### 4. Server-Side Data Access Layer Architecture (`frontend/src/lib/server/`)

The data access layer is placed strictly in `frontend/src/lib/server/` and protected against client-side execution via `assertServerOnly()`:

```
frontend/src/lib/server/
├── api-config.ts     # Safe URL resolution, timeout configuration, and assertServerOnly()
├── api-errors.ts     # Typed error hierarchy & client error message sanitization
├── api-client.ts     # Generic fetcher with Zod schema validation & Next.js cache tags
├── public-api.ts     # High-level typed data fetching methods with reactCache deduplication
└── index.ts          # Clean barrel export for Server Components
```

#### 4.1. Security Isolation & Secret Hygiene
- **Server Guard:** `assertServerOnly()` verifies `typeof window === 'undefined'`. Calling any server data function on the client immediately throws an invariant violation.
- **Environment Variable:** `TECHA_API_BASE_URL` is defined in `.env.example` as `http://127.0.0.1:5000/api/v1/public`. It has **no** `NEXT_PUBLIC_` prefix, preventing Next.js from inlining backend URLs or credentials into client JS bundles.
- **Client Error Sanitization:** `sanitizeClientErrorMessage()` redacts sensitive database connection strings, credentials, internal IPs (`127.0.0.1`, `localhost`), and stack traces, displaying user-friendly Persian error messages to viewers.

#### 4.2. Typed Error Hierarchy
```typescript
ApiError (base class with statusCode, correlationId, details)
├── NotFoundError (404)
├── ValidationError (400)
├── ServiceUnavailableError (503)
├── ServerError (500)
├── NetworkError (Fetch failures, connection refused, timeouts)
└── ContractValidationError (Zod response schema mismatch)
```

#### 4.3. Caching & Deduplication Strategy
- In React Server Components, multiple components rendering the same page (e.g. `layout.js`, `page.js`, and `generateMetadata()`) need the same data (such as course details and course outlines).
- Methods in `public-api.ts` are wrapped with a resilient `reactCache()` deduplication helper (falling back safely in Vitest environments where RSC React cache is stubbed).
- Next.js fetch cache options include configurable `revalidate` times (default 60 seconds) and cache tags (`courses`, `course:${slug}`, `lesson:${slug}`) for fine-grained future on-demand revalidation.

---

### 5. Four Public Routes SSR Integration

| Route | File Path | Backend Endpoint | Rendering Strategy | Key Capabilities |
|:---|:---|:---|:---|:---|
| **Home** | `frontend/src/app/page.js` | `GET /api/v1/public/home`<br>`GET /api/v1/public/courses?limit=6` | Async Server Component | Parallel fetching with `Promise.allSettled`, dynamic SEO metadata, graceful fallback if home settings are not seeded. |
| **Doc Listing** | `frontend/src/app/docs/page.js` | `GET /api/v1/public/courses` | Async Server Component | Supports `searchParams` (`page`, `level`, `tag`, `q`), pagination controls, `DocsFilterBar` interactive search, empty state card. |
| **Course Details** | `frontend/src/app/docs/[slug]/page.js` | `GET /api/v1/public/courses/:slug`<br>`GET /api/v1/public/courses/:slug/outline` | Async Server Component | Dynamic metadata, calls `notFound()` only on 404, throws on 5xx/network error, outline stats calculation. |
| **Lesson Detail** | `frontend/src/app/docs/[slug]/[lessonId]/page.js` | `GET /api/v1/public/courses/:slug/lessons/:lessonSlug`<br>`GET /api/v1/public/courses/:slug/outline` | Async Server Component | Dynamic metadata, 13-type `ContentBlocksRenderer`, sequential prev/next lesson pagination from outline. |

#### 5.1. Dynamic SEO Metadata Generation
Each documentation route implements `generateMetadata({ params })`:
- Extracts course or lesson title, summary, and custom `seo` overrides.
- Generates standard metadata (`title`, `description`, `keywords`), OpenGraph (`og:title`, `og:description`, `og:type`), and Twitter card tags.
- Safely catches backend errors during metadata generation to return sensible fallbacks without crashing the SSR cycle.

#### 5.2. Loading States & Error Boundaries
- **Loading Skeletons:**
  - `frontend/src/app/docs/loading.js`: Skeleton grid for course catalog.
  - `frontend/src/app/docs/[slug]/loading.js`: Skeleton layout for course overview and lesson reader.
- **Client Error Boundaries:**
  - `frontend/src/app/docs/error.js` & `frontend/src/app/docs/[slug]/error.js`: Interactive Client Component error boundaries with user-friendly Persian error messages and a "تلاش مجدد" (Retry) action calling `reset()`.

---

### 6. Greenfield Content Blocks Renderer (`ContentBlocksRenderer.tsx`)

A pure React component implementing exhaustive discriminated union rendering for all 13 Greenfield block types:

```typescript
export type ContentBlock =
  | HeadingBlockDto
  | ParagraphBlockDto
  | RichTextBlockDto
  | CodeBlockDto
  | ImageBlockDto
  | VideoBlockDto
  | TableBlockDto
  | CalloutBlockDto
  | QuoteBlockDto
  | DividerBlockDto
  | DownloadableFileBlockDto
  | ListBlockDto
  | InteractiveExampleBlockDto;
```

#### Security Guardrails Implemented:
1. **Zero Code Execution:** `codeBlock` displays formatted, copyable code syntax; it does **not** execute JavaScript, construct `new Function()`, or invoke `eval()`.
2. **Zero Sandboxed Iframes:** `interactiveExample` renders static file tabs with syntax-highlighted code; it does not inject `srcDoc` or create live executable browser sandboxes.
3. **Safe Link Protocol Validation:** `isSafeUrl()` blocks dangerous URI schemes like `javascript:`, `data:`, or `vbscript:`.
4. **Media & Downloadable File Handling:** External or storageKey files are rendered with accessible Persian UI labels, file size formatting, and extension indicators.
5. **Fallback:** Unknown or future block types render a graceful fallback notification in development and hide safely in production without crashing.

---

### 7. Course Outline Context & Dynamic Sidebar

- **Elimination of Legacy Redux Dependency:** The previous documentation layout relied on a client-side Redux store (`courses.currentDoc`) that caused flashes of empty sidebars and client hydration mismatch.
- **Server-Fed React Context (`CourseOutlineContext.tsx`):**
  - `frontend/src/app/docs/[slug]/layout.js` is an Async Server Component that fetches the course outline once on the server.
  - Passes the outline data into `<CourseOutlineProvider initialOutline={outline} courseSlug={params.slug}>`.
  - `Sidebar.jsx` consumes `useCourseOutline()`, rendering collapsible chapters and lessons with active state highlighting matching the current URL slug.

---

### 8. Architectural Boundaries & Monorepo Integrity

- **Zero Mongoose in Frontend:** Verified `frontend/package.json` contains no `mongoose` or `mongodb` dependencies.
- **Clean Contracts via Shared Package:** Frontend imports strictly from `@techa/shared` (DTO types, Zod schemas, validation contracts).
- **Style & Design Preservation:** Existing Tailwind CSS configurations, Persian typography (Vazirmatn), header, footer, and brand styles were strictly preserved.
- **Backward Compatibility:** Components like `DocCard.jsx` and `DocInfo.jsx` support both Greenfield camelCase DTOs (`title`, `slug`, `summary`, `order`) and legacy PascalCase properties without breaking old pages.

---

### 9. Complete File Inventory

#### 9.1. Created Files
1. `frontend/src/lib/server/api-config.ts`
2. `frontend/src/lib/server/api-errors.ts`
3. `frontend/src/lib/server/api-client.ts`
4. `frontend/src/lib/server/public-api.ts`
5. `frontend/src/lib/server/index.ts`
6. `frontend/src/components/docs/content/ContentBlocksRenderer.tsx`
7. `frontend/src/components/docs/DocsFilterBar.tsx`
8. `frontend/src/context/CourseOutlineContext.tsx`
9. `frontend/src/app/docs/loading.js`
10. `frontend/src/app/docs/error.js`
11. `frontend/src/app/docs/[slug]/loading.js`
12. `frontend/src/app/docs/[slug]/error.js`
13. `frontend/src/app/docs/[slug]/not-found.js`
14. `frontend/test/unit/api-config-and-errors.test.ts`
15. `frontend/test/unit/api-client.test.ts`
16. `frontend/test/unit/public-api-methods.test.ts`
17. `frontend/test/unit/content-blocks-renderer.test.ts`
18. `frontend/test/unit/route-ssr-integration.test.ts`
19. `frontend/test/unit/frontend-regression.test.ts`
20. `scripts/verify-step4.cjs`
21. `docs/phase-1/STEP-4-IMPLEMENTATION-REPORT.md`

#### 9.2. Modified Files
1. `.env.example` (added `TECHA_API_BASE_URL`)
2. `package.json` (added `"verify:step4"` script)
3. `frontend/package.json` (added `"test": "vitest run"` and `"build": "NODE_ENV=production next build"`)
4. `frontend/src/app/page.js` (Async Server Component with `getHomepage()` and `getPublishedCourses()`)
5. `frontend/src/app/docs/page.js` (Async Server Component with `searchParams` filter & pagination)
6. `frontend/src/app/docs/[slug]/layout.js` (Server Component fetching outline with `CourseOutlineProvider`)
7. `frontend/src/app/docs/[slug]/page.js` (Async Server Component with `getPublishedCourseDetail()`)
8. `frontend/src/app/docs/[slug]/[lessonId]/page.js` (Async Server Component with `getPublishedLessonDetail()` & `ContentBlocksRenderer`)
9. `frontend/src/components/docs/DocCard.jsx` (Greenfield DTO property mapping)
10. `frontend/src/components/docs/doc/DocInfo.jsx` (Greenfield DTO support)
11. `frontend/src/components/landing/LastDocumentation.jsx` (Server-provided courses rendering)
12. `frontend/src/components/layout/Sidebar.jsx` (Dynamic outline integration)
13. `frontend/src/components/courses/course/CourseTabsContainer.jsx` (Tab state container)

---

### 10. Automated Verification Results

#### 10.1. Step 4 Verification Protocol (`scripts/verify-step4.cjs`)
All 24 automated assertions passed without a single failure:
- Server-side data access layer files exist.
- Secret hygiene and environment variable safety verified.
- Content block renderer security guardrails verified (`eval`, `new Function`, `srcDoc` absent).
- 4 approved public routes present.
- Outline context and sidebar integration verified.
- Architectural boundary: zero mongoose/mongodb in frontend.
- Backend Vitest suite: 79 tests passed across 12 files.
- Frontend Vitest suite: 50 tests passed across 6 files.
- Monorepo typecheck: 100% clean across `@techa/shared`, `@techa/backend`, and `@techa/frontend`.
- Next.js production build: completed successfully (37/37 static and dynamic pages rendered).

#### 10.2. Monorepo Vitest Test Summary
```
✓ backend/test/unit/course-stats.service.test.ts (6 tests)
✓ backend/test/unit/course.model.test.ts (6 tests)
✓ backend/test/unit/chapter.model.test.ts (6 tests)
✓ backend/test/unit/lesson.model.test.ts (7 tests)
✓ backend/test/unit/site-page.model.test.ts (7 tests)
✓ backend/test/unit/public.service.test.ts (11 tests)
✓ backend/test/unit/public.controller.test.ts (7 tests)
✓ backend/test/unit/correlation-id.middleware.test.ts (5 tests)
✓ backend/test/unit/error-handler.middleware.test.ts (6 tests)
✓ backend/test/unit/health.routes.test.ts (4 tests)
✓ backend/test/unit/public.routes.test.ts (6 tests)
✓ backend/test/unit/database-lifecycle.test.ts (8 tests)
✓ frontend/test/unit/api-config-and-errors.test.ts (10 tests)
✓ frontend/test/unit/api-client.test.ts (7 tests)
✓ frontend/test/unit/public-api-methods.test.ts (7 tests)
✓ frontend/test/unit/content-blocks-renderer.test.ts (15 tests)
✓ frontend/test/unit/route-ssr-integration.test.ts (7 tests)
✓ frontend/test/unit/frontend-regression.test.ts (4 tests)

Test Files:  18 passed (18)
Tests:       129 passed (129)
Time:        ~12s
```

---

### 11. Git Commit & Sign-Off

- **Branch:** `phase-1-step-4-frontend-ssr-integration`
- **Commit Message:** `feat(phase-1): integrate public APIs with server-rendered frontend`
- **Status:** Complete, verified, and ready for review.
