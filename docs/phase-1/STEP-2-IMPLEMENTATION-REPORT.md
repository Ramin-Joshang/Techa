# TECHA 2.0 — PHASE 1 / STEP 2: IMPLEMENTATION REPORT
## Greenfield Mongoose Models & Zod Contracts Architecture

- **Date:** November 2026
- **Branch:** `phase-1-step-2-models-contracts`
- **Scope:** Greenfield Mongoose 9 Models, Subdocument Discriminators (Zero Mixed), Type-Safe Zod Contracts, Interactive Multi-File Example Security, Publication Chain Validation, Course Statistics Engine, AI Import Package Schema, Automated Testing.

---

### 1. Initial Repository State & Branch

- **Starting Branch & Environment:** Monorepo initialized from Phase 1 Step 1 on Node.js `v22.23.3` (targeting Node 24 LTS in `.nvmrc`).
- **Active Working Branch:** `phase-1-step-2-models-contracts`.
- **Pre-Existing Work:** All existing Next.js frontend code in `frontend/` remained completely untouched and preserved.

---

### 2. Files Created

#### A. Shared Workspace (`@techa/shared`)
1. `shared/src/constants/content.constants.ts`: Enums and constant literals for Course levels, publication statuses, media categories, content block types, code languages, callout types, list formats, interactive environments, presets, and Phase 1 allowed public routes.
2. `shared/src/schemas/primitives.schema.ts`: Robust schemas for `ObjectId`, `Slug`, `StorageKey` (rejecting `..`, leading slash, backslash, null bytes), `CourseIcon` (discriminated union of system vs media icon), `SeoMetadata`, `PublishedSeoMetadata`, and `CourseStats`.
3. `shared/src/schemas/interactive-example.schema.ts`: Validation for multi-file interactive examples, segment normalization, strict path security, UTF-8 size bounds (max 50KB/file, max 256KB total using `TextEncoder`), single entryPoint enforcement, and environment-to-extension compatibility.
4. `shared/src/schemas/content-blocks.schema.ts`: 13 strongly typed content block schemas unified under a discriminated union (`ContentBlockSchema`) on `type`, using `blk_[a-zA-Z0-9_-]{8,32}` block ID pattern.
5. `shared/src/schemas/course.schema.ts`: Complete schemas, Create/Update DTOs, and Public DTO for `Course`.
6. `shared/src/schemas/chapter.schema.ts`: Schemas, Create/Update DTOs, and Public DTO for `Chapter`.
7. `shared/src/schemas/lesson.schema.ts`: Schemas, Create/Update DTOs, and Public/Summary DTOs for `Lesson`.
8. `shared/src/schemas/media.schema.ts`: Schemas, Create/Update DTOs, and Public DTO for `MediaAsset`.
9. `shared/src/schemas/page.schema.ts`: Schemas and DTO for `SitePage` (`pageKey: 'home'`) with Phase 1 CTA route restriction.
10. `shared/src/schemas/import-package.schema.ts`: `CourseImportPackageSchema` with cross-document validation via `superRefine`.

#### B. Backend Workspace (`@techa/backend`)
11. `backend/src/models/content-block.schema.ts`: Mongoose subdocument discriminators for all 13 block types, **genuinely eliminating `Schema.Types.Mixed`**.
12. `backend/src/models/course.model.ts`: Mongoose model and raw interfaces for collection `courses`.
13. `backend/src/models/chapter.model.ts`: Mongoose model and raw interfaces for collection `chapters`.
14. `backend/src/models/lesson.model.ts`: Mongoose model and raw interfaces for collection `lessons`.
15. `backend/src/models/media-asset.model.ts`: Mongoose model and raw interfaces for collection `media_assets`.
16. `backend/src/models/site-page.model.ts`: Mongoose model and raw interfaces for collection `site_pages`.
17. `backend/src/models/index.ts`: Central model registration and export point.
18. `backend/src/services/publication.service.ts`: Publication rules and complete parent publication chain verification.
19. `backend/src/services/course-stats.service.ts`: Course statistics calculator excluding unpublished parent chains, with recalculation and public query safeguards.
20. `backend/src/services/index.ts`: Central service export barrel.

#### C. Fixtures & Verification Scripts
21. `backend/test/fixtures/valid-course-import-package.json`: Realistic Persian course import package with interactive example.
22. `backend/test/fixtures/invalid-course-import-packages.json`: Invalid package fixtures covering duplicate keys, broken references, duplicate block IDs, and undeclared media.
23. `backend/test/unit/primitives-and-paths.test.ts`: Unit tests for primitives, storage key security, and icons.
24. `backend/test/unit/content-blocks.test.ts`: Unit tests for content block discriminated union and bounds.
25. `backend/test/unit/interactive-example.test.ts`: Unit tests for path traversal, entry points, extensions, and byte size.
26. `backend/test/unit/domain-schemas.test.ts`: Unit tests for all 5 domains and Phase 1 route restrictions.
27. `backend/test/unit/import-package.test.ts`: Unit tests for import package fixture validation.
28. `backend/test/unit/mongoose-models-and-services.test.ts`: Integration tests for Mongoose embedded subdocuments, publication chain, and course stats.
29. `scripts/verify-indexes.cjs`: Index ESR mapping and query justification script.
30. `scripts/verify-step2.cjs`: Automated end-to-end Step 2 verification protocol.

---

### 3. Files Modified

1. `shared/src/index.ts`: Added exports for all new primitives, content blocks, domain schemas, and constants.
2. `package.json`: Added `verify:step2` orchestration script.

---

### 4. Models Implemented

All 5 models are defined with pure `Raw` interfaces, explicit collection names, and `HydratedDocument` types:

| Model | Collection Name | Primary Identifier | Key Characteristics |
|---|---|---|---|
| `CourseModel` | `courses` | `_id`, `slug` (unique) | Discriminated `icon` (system vs media), embedded SEO, stats, status (`draft` default) |
| `ChapterModel` | `chapters` | `_id`, compound `(courseId, slug)` | Belongs to `courseId`, status (`draft` default) |
| `LessonModel` | `lessons` | `_id`, compound `(courseId, slug)` | Belongs to `courseId` & `chapterId`, 13 subdocument discriminators (no Mixed), reading time |
| `MediaAssetModel` | `media_assets` | `_id`, `storageKey` (unique) | Category enum, mime-type validation, SHA-256 checksum, dimensions |
| `SitePageModel` | `site_pages` | `_id`, `pageKey: 'home'` (unique) | Hero section with Phase 1 CTA validation, features array, SEO |

---

### 5. Content Block Engine & Zod Contracts

- **13 Supported Block Types:** `heading` (levels 2, 3, 4; 1–250 chars), `paragraph` (1–5000 chars), `richText` (up to 100 spans with formatting/links), `codeBlock` (explicit language enum, max 50KB), `image` (`storageKey`, `altText`), `video` (`storageKey`, poster, duration), `table` (1–10 columns, 1–100 rows, strict column count matching across all rows), `callout` (`info`, `warning`, `tip`, `danger`), `quote` (1–1000 chars, author, citation), `divider` (`strict()`), `downloadableFile` (`storageKey`, title, size limit 500MB), `list` (`ordered`/`unordered`, 1–50 items), `interactiveExample`.
- **Zero `z.any()` / Zero `z.unknown()`:** All fields are strictly validated.
- **Interactive Multi-File Example Security:**
  - Strict path segment normalization.
  - Rejection of leading slashes, backslashes, `..` traversal, null bytes, and empty segments.
  - Single `entryPoint: true` enforcement.
  - Case-insensitive duplicate path rejection.
  - Extension matching for `html-css-js`, `react`, and `react-tailwind`.
  - Max 50KB per file, max 256,000 UTF-8 bytes across all files calculated via cross-platform `TextEncoder`.

---

### 6. Mongoose Subdocument Discriminators (Genuinely Avoiding Mixed)

Rather than using `Schema.Types.Mixed`, `backend/src/models/content-block.schema.ts` implements a base schema with `discriminatorKey: 'type'` and registers individual typed Mongoose schemas for each of the 13 block types:
- Each block discriminator defines an explicit `data` subdocument schema with nested validation.
- Invalid block data (such as a heading with level 5 or mismatched table rows) is caught and rejected by Mongoose document validation (`doc.validate()`).

---

### 7. Publication & Course Statistics Services

1. **`PublicationService` (`backend/src/services/publication.service.ts`):**
   - Default status for Course, Chapter, and Lesson is `draft`.
   - Course publication enforces complete and valid SEO metadata (`PublishedSeoMetadataSchema`).
   - Chapter publication requires the parent Course to exist and be in `published` status.
   - Lesson publication requires:
     1. At least 1 content block.
     2. Parent Chapter exists and is `published`.
     3. Parent Course exists and is `published`.
     4. Chapter's `courseId` strictly matches Lesson's `courseId`.
     5. Valid publication SEO metadata.
   - Parent Unpublishing Safeguard: If a course or chapter is unpublished or archived, descendant lessons are guaranteed not to be publicly visible via `isLessonPubliclyVisible()`, even if their individual status remains `published`.

2. **`CourseStatsService` (`backend/src/services/course-stats.service.ts`):**
   - Recalculates stats via aggregation: counts only published chapters, counts lessons strictly belonging to those published chapters, and sums reading time.
   - If the course is unpublished, public statistics return zeros.
   - Lessons belonging to draft or archived chapters are strictly excluded.

---

### 8. Database Indexes & Query Mapping

All 11 indexes were designed under strict **Equality, Sort, Range (ESR)** principles with zero redundant duplicates:

| Collection | Index Keys | Options | Target Query | ESR Profile |
|---|---|---|---|---|
| `courses` | `{ slug: 1 }` | `unique: true` | Course lookup by unique slug | Equality: `{ slug }` (Unique B-Tree) |
| `courses` | `{ status: 1, order: 1 }` | - | List published courses by display order | Equality: `{ status }`, Sort: `{ order: 1 }` |
| `courses` | `{ status: 1, tags: 1, order: 1 }` | - | Filter published courses by tag, ordered | Equality: `{ status }`, Multikey: `{ tags }`, Sort: `{ order: 1 }` |
| `chapters` | `{ courseId: 1, slug: 1 }` | `unique: true` | Chapter lookup by courseId & slug | Equality: `{ courseId, slug }` (Unique compound) |
| `chapters` | `{ courseId: 1, status: 1, order: 1 }` | - | List published chapters for a course, ordered | Equality: `{ courseId, status }`, Sort: `{ order: 1 }` |
| `lessons` | `{ courseId: 1, slug: 1 }` | `unique: true` | Lesson lookup by courseId & slug | Equality: `{ courseId, slug }` (Unique compound) |
| `lessons` | `{ courseId: 1, status: 1, order: 1 }` | - | List published lessons for course & stats prefix | Equality: `{ courseId, status }`, Sort: `{ order: 1 }` |
| `lessons` | `{ chapterId: 1, status: 1, order: 1 }` | - | List published lessons for chapter, ordered | Equality: `{ chapterId, status }`, Sort: `{ order: 1 }` |
| `media_assets` | `{ storageKey: 1 }` | `unique: true` | MediaAsset lookup by unique storageKey | Equality: `{ storageKey }` (Unique B-Tree) |
| `media_assets` | `{ category: 1 }` | - | Filter media assets by category | Equality: `{ category }` |
| `site_pages` | `{ pageKey: 1 }` | `unique: true` | Homepage lookup by pageKey ('home') | Equality: `{ pageKey }` (Unique B-Tree) |

---

### 9. Test Results & Verification

- **Automated Test Suite:**
  - 54 passing tests across 7 test suites in Vitest (`backend/test/` and `backend/src/`):
    - `primitives-and-paths.test.ts` (11 tests)
    - `content-blocks.test.ts` (9 tests)
    - `interactive-example.test.ts` (11 tests)
    - `domain-schemas.test.ts` (9 tests)
    - `import-package.test.ts` (2 tests)
    - `mongoose-models-and-services.test.ts` (9 tests)
    - `health.test.ts` (3 tests)
- **Protocol Checks:** `npm run verify:step2` verified 22 assertions (10 shared contracts, 6 Mongoose models, 2 services, 2 fixtures, test suite pass) with 0 failures.
- **Build & Compilation:** Both `@techa/shared` and `@techa/backend` compile cleanly via TypeScript 5.7+ with zero errors.

---

### 10. Unresolved Issues & Technical Limitations

- No blocking issues or syntax/runtime errors exist.
- As planned, public API controllers, routes, authentication, and database migration remain out of scope for this step and were intentionally not created.

---

### 11. Safety & Greenfield Confirmations

- **No Production Database Modification:** No connection was made to the user's production MongoDB Atlas cluster during tests; all tests ran in isolated unit/in-memory mocks.
- **No Migration Executed:** Legacy SQL Server migration was not performed, preserving greenfield isolation.
- **No Out-of-Scope Code:** Collections and modules for users, auth, payments, blog, exercises, or exam judge engines were strictly omitted.
- **Zero Regression Guarantee:** All existing frontend files in `frontend/` remain completely intact.
