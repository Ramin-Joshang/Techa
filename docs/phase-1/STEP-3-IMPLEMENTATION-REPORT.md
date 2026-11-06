# TECHA 2.0 — PHASE 1 / STEP 3: IMPLEMENTATION REPORT
## MongoDB Persistence, Data Access Layer & Public Read-Only APIs

- **Date:** November 2026
- **Branch:** `phase-1-step-3-public-read-api`
- **Scope:** Centralized MongoDB Connection Lifecycle, Public Read-Only Query Engine, RESTful Endpoints (`/api/v1/public/*`), Publication Chain Enforcement, Zod Parameter & Query Validation, Automated Test Suite (79 Tests), Zero Frontend Regressions.

---

### 1. Architecture Implemented

The application adheres to a modular monolith architecture organized into clean, decoupled layers:

```
[ HTTP Request: /api/v1/public/* ]
         │
         ▼
[ Security & Correlation Middleware: Helmet, CORS, Rate-Limiter, RequestId, Pino-Http ]
         │
         ▼
[ Express Router: public.routes.ts ]
         │
         ▼
[ Zod Validation Gate: CourseListQuerySchema, CourseSlugParamSchema, LessonSlugParamsSchema ]
         │
         ▼
[ Controller Layer: public.controller.ts ]
         │
         ▼
[ Service Layer: public.service.ts & course-stats.service.ts ]
         │ (Enforces full parent publication chain: Course -> Chapter -> Lesson)
         ▼
[ Data Access / Models: CourseModel, ChapterModel, LessonModel, SitePageModel ]
         │ (Lean indexed queries, deterministic sorting, zero Schema.Types.Mixed)
         ▼
[ Response Formatting: sendSuccess / sendError ]
         │
         ▼
[ Standardized API Envelope (success: true, statusCode: 200, data, meta) ]
```

---

### 2. Database Connection Lifecycle

The centralized database lifecycle is implemented in `backend/src/core/database/mongoose.ts` and exported via `backend/src/core/database/index.ts`:

- **Lifecycle Functions:**
  - `connectDatabase()` (alias `connectToDatabase()`): Thread-safe asynchronous connection initializer.
  - `disconnectDatabase()` (alias `disconnectFromDatabase()`): Cleanly terminates Mongoose connections upon shutdown.
  - `isDatabaseConnected()`: Returns boolean reflecting `mongoose.connection.readyState === 1`.
  - `getDatabaseStatus()`: Returns `'connected' | 'disconnected'`.
- **Concurrency & Multiplexing:** An in-flight `connectionPromise` cache prevents duplicate connection attempts when concurrent requests arrive during bootstrap.
- **Connection Pooling:** Configured with `maxPoolSize: 10`, `minPoolSize: 2`, `serverSelectionTimeoutMS: 5000`, `socketTimeoutMS: 45000`, and `heartbeatFrequencyMS: 10000`.
- **Event Listeners:** Monitored events for `connected`, `error`, `disconnected`, and `reconnected`.
- **Secret Sanitization:** `sanitizeMongoUri()` automatically redacts username and password credentials before any URI appears in logs or error traces.
- **Readiness Probe Integrity:** `/api/v1/health/readiness` accurately returns HTTP 200 when `readyState === 1`, and HTTP 503 (`DATABASE_NOT_READY`) when disconnected.

---

### 3. Environment Variables Required

Configured in `.env.example`:

```bash
# Backend Network & Process
NODE_ENV=development
API_HOST=127.0.0.1
API_PORT=5000
LOG_LEVEL=info
TRUST_PROXY_HOPS=1

# MongoDB Atlas Connection (Backend-Only, never exposed via NEXT_PUBLIC_)
MONGODB_URI=

# CORS & Networking
FRONTEND_ORIGIN=http://127.0.0.1:3000
CORS_ORIGINS=http://127.0.0.1:3000,http://localhost:3000

# Frontend Next.js Client
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:5000/api/v1
```

*Note: In accordance with secret hygiene requirements, `MONGODB_URI` contains no committed credentials, and no `NEXT_PUBLIC_MONGODB_URI` exists.*

---

### 4. API Endpoint Inventory

All public read-only endpoints are served under the versioned prefix `/api/v1/public`:

| Method | Endpoint | Description | Validation Schema |
|---|---|---|---|
| `GET` | `/api/v1/public/home` | Retrieves homepage configuration (`pageKey: 'home'`) | `SitePagePublicDtoSchema` |
| `GET` | `/api/v1/public/courses` | Lists published courses with pagination and filters | `CourseListQuerySchema` |
| `GET` | `/api/v1/public/courses/:courseSlug` | Retrieves single published course with public stats | `CourseSlugParamSchema` |
| `GET` | `/api/v1/public/courses/:courseSlug/outline` | Retrieves course sidebar hierarchy (chapters & lesson summaries) | `CourseSlugParamSchema` |
| `GET` | `/api/v1/public/courses/:courseSlug/lessons/:lessonSlug` | Retrieves full lesson content with validated blocks | `LessonSlugParamsSchema` |

---

### 5. Request and Response Examples

#### 5.1 Homepage (`GET /api/v1/public/home`)
**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "pageKey": "home",
    "title": "مرجع آموزش برنامه‌نویسی وب تکا",
    "heroSection": {
      "title": "آموزش تخصصی فرانت‌اند و بک‌اند",
      "subtitle": "از صفر تا آمادگی برای بازار کار با پروژه‌های واقعی",
      "primaryCta": { "label": "مشاهده دوره‌ها", "url": "/courses" },
      "secondaryCta": { "label": "شروع دوره ری‌اکت", "url": "/courses/react-foundations" }
    },
    "features": [
      {
        "title": "مستندات استاندارد",
        "description": "سرفصل‌های جامع همراه با محیط اجرای زنده کد",
        "icon": "book-open"
      }
    ],
    "seo": {
      "metaTitle": "تکا - پلتفرم آموزش برنامه‌نویسی",
      "metaDescription": "آموزش جامع ری‌اکت، نکست جی‌اس و مهندسی نرم‌افزار به زبان فارسی."
    }
  }
}
```

#### 5.2 Course Outline (`GET /api/v1/public/courses/react-foundations/outline`)
**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "course": {
      "id": "672bd238a2c1f93892019401",
      "slug": "react-foundations",
      "title": "مبانی و مفاهیم جامع ری‌اکت",
      "stats": {
        "totalChapters": 2,
        "totalLessons": 5,
        "estimatedReadingTimeMinutes": 35
      }
    },
    "chapters": [
      {
        "id": "672bd238a2c1f93892019402",
        "title": "فصل اول: آشنایی با اکوسیستم ری‌اکت",
        "slug": "introduction-to-react",
        "summary": "مفاهیم اولیه، چرایی پیدایش ری‌اکت و نصب محیط توسعه",
        "order": 1,
        "lessons": [
          {
            "id": "672bd238a2c1f93892019403",
            "title": "ری‌اکت چیست و چرا از آن استفاده می‌کنیم؟",
            "slug": "what-is-react",
            "order": 1,
            "readingTimeMinutes": 6
          }
        ]
      }
    ]
  }
}
```

#### 5.3 Lesson Detail (`GET /api/v1/public/courses/react-foundations/lessons/what-is-react`)
**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "id": "672bd238a2c1f93892019403",
    "courseId": "672bd238a2c1f93892019401",
    "chapterId": "672bd238a2c1f93892019402",
    "title": "ری‌اکت چیست و چرا از آن استفاده می‌کنیم؟",
    "slug": "what-is-react",
    "order": 1,
    "readingTimeMinutes": 6,
    "contentSchemaVersion": 1,
    "contentBlocks": [
      {
        "id": "blk_intro_heading_01",
        "version": 1,
        "type": "heading",
        "data": { "level": 2, "text": "مقدمه‌ای بر کتابخانه ری‌اکت" }
      },
      {
        "id": "blk_intro_para_01",
        "version": 1,
        "type": "paragraph",
        "data": { "text": "ری‌اکت یک کتابخانه جاوااسکریپتی برای ساخت رابط‌های کاربری است." }
      }
    ],
    "seo": {
      "metaTitle": "ری‌اکت چیست؟ معرفی جامع کتابخانه React",
      "metaDescription": "بررسی ویژگی‌های کلیدی کتابخانه ری‌اکت در توسعه فرانت‌اند."
    },
    "publishedAt": "2026-11-06T10:00:00.000Z"
  }
}
```

---

### 6. Publication Visibility Behavior

Public visibility strictly verifies the entire ancestor chain:

1. **Course Visibility:** A course is visible if and only if `status === 'published'`.
2. **Chapter Visibility:** A chapter is visible only if its own `status === 'published'` AND its parent Course exists and is `published`.
3. **Lesson Visibility:** A lesson is visible only if:
   - Lesson `status === 'published'`.
   - Parent Chapter exists and `status === 'published'`.
   - Parent Course exists and `status === 'published'`.
   - Lesson `chapterId` belongs to the resolved Chapter.
   - Lesson `courseId` strictly matches Chapter's `courseId` and Course's `_id`.
4. **Ancestor Unpublishing Protection:** If an admin unpublishes or archives a course or chapter, all descendant lessons immediately disappear from public outline and lesson detail queries without modifying descendant document records.

---

### 7. Query Efficiency and Index Usage

All queries leverage the Step 2 compound indexes:

1. **Course Listing:** Uses `{ status: 1, order: 1 }` or `{ status: 1, tags: 1, order: 1 }`. Eliminates in-memory sort.
2. **Course Detail:** Uses `{ slug: 1 }` (unique B-tree lookup).
3. **Outline Query:**
   - Course lookup: `{ slug: 1 }`.
   - Chapters: `{ courseId: 1, status: 1, order: 1 }`.
   - Lessons: `{ courseId: 1, status: 1, order: 1 }` with `{ chapterId: { $in: publishedChapterIds } }`.
4. **Lesson Detail Query:**
   - Course lookup: `{ slug: 1 }`.
   - Lesson lookup: `{ courseId: 1, slug: 1 }` (unique compound index).
   - Chapter verification: `{ _id: 1, courseId: 1, status: 1 }`.

---

### 8. Test Environment and Isolation Strategy

- **Zero Production Data Touch:** No tests connect to the production MongoDB Atlas cluster.
- **Isolated Spying & Unit Testing:** All model operations (`CourseModel`, `ChapterModel`, `LessonModel`, `SitePageModel`) are isolated via Vitest spies and mocks, guaranteeing deterministic, sub-second execution.
- **Integration Test Coverage via Supertest:** HTTP requests pass through the entire Express middleware pipeline (Helmet, CORS, RateLimiter, RequestId, Pino-Http, Central Error Handler).

---

### 9. Exact Test & Verification Results

#### Test Count Reconciliation (Step 2 vs Step 3):
- **Step 2 Discrepancy Resolved:** The Step 2 report noted 54 tests across 7 test files, but explicitly listed 6 files in `test/unit/` (51 tests). The 7th file was `src/modules/health/health.test.ts` (3 tests) from Step 1.
  - 51 tests (6 files in `test/unit/`) + 3 tests (`src/modules/health/health.test.ts`) = **54 tests across 7 files**.
- **Step 3 Additions:** 5 new test files adding 25 tests:
  1. `test/unit/database-lifecycle.test.ts` (8 tests)
  2. `test/unit/public-api-home.test.ts` (2 tests)
  3. `test/unit/public-api-courses.test.ts` (7 tests)
  4. `test/unit/public-api-outline.test.ts` (3 tests)
  5. `test/unit/public-api-lesson.test.ts` (5 tests)
- **Current Total:** **79 passing tests across 12 test files (100% PASS)**.

```bash
Test Files  12 passed (12)
Tests       79 passed (79)
Duration    5.48s
```

#### Protocol Verification (`npm run verify:step3`):
- All 15 assertions passed with 0 failures (`15 Passed, 0 Failed`).

---

### 10. Known Limitations & Deferred Work

- **Media Delivery:** Media assets return stable `storageKey` references; actual object storage serving (e.g. S3/MinIO/Cloudflare R2 signed URLs) is deferred to future media pipeline steps.
- **Frontend Integration:** Frontend components and pages were untouched; Phase 1 / Step 4 will wire the frontend App Router data-fetching to these endpoints.
- **No Mutation Endpoints:** All POST, PUT, DELETE operations for CMS remain out-of-scope for Phase 1.
