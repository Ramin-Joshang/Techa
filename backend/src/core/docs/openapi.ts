import './extend-zod';
import {
  OpenAPIRegistry,
  OpenApiGeneratorV31,
} from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import {
  ApiMetaSchema,
  ApiErrorDetailSchema,
  ApiErrorResponseSchema,
  ApiResponseSchema,
  LivenessResponseSchema,
  ReadinessResponseSchema,
  CoursePublicDtoSchema,
  CourseOutlinePublicDtoSchema,
  ChapterOutlinePublicDtoSchema,
  LessonOutlineItemDtoSchema,
  LessonPublicDtoSchema,
  SitePagePublicDtoSchema,
  ContentBlockSchema,
  HeadingBlockSchema,
  ParagraphBlockSchema,
  RichTextBlockSchema,
  CodeBlockSchema,
  ImageBlockSchema,
  VideoBlockSchema,
  TableBlockSchema,
  CalloutBlockSchema,
  QuoteBlockSchema,
  DividerBlockSchema,
  DownloadableFileBlockSchema,
  ListBlockSchema,
  InteractiveExampleBlockSchema,
  CourseListQuerySchema,
  CourseSlugParamSchema,
  LessonSlugParamsSchema,
  SearchQuerySchema,
  SearchResultDtoSchema,
  PublicSiteSettingsDtoSchema,
  PublicSitePageDtoSchema,
  PageKeyParamSchema,
} from '@techa/shared';
import { env } from '../config/env';

import { ensureOpenApi } from './extend-zod';
import { registerAdminOpenApiRoutes } from './openapi-admin';

export function buildOpenApiDocument() {
  const registry = new OpenAPIRegistry();
  const reg = <T extends z.ZodTypeAny>(name: string, schema: T) => registry.register(name, ensureOpenApi(schema));

  // 1. Register Core Metadata and Response Envelopes
  reg('ApiMeta', ApiMetaSchema);
  reg('ApiErrorDetail', ApiErrorDetailSchema);
  reg('ApiErrorResponse', ApiErrorResponseSchema);

  // 2. Register Health Schemas
  reg('LivenessResponse', LivenessResponseSchema);
  reg('ReadinessResponse', ReadinessResponseSchema);

  // 3. Register Content Block Schemas (All 13 variants)
  reg('HeadingBlock', HeadingBlockSchema);
  reg('ParagraphBlock', ParagraphBlockSchema);
  reg('RichTextBlock', RichTextBlockSchema);
  reg('CodeBlock', CodeBlockSchema);
  reg('ImageBlock', ImageBlockSchema);
  reg('VideoBlock', VideoBlockSchema);
  reg('TableBlock', TableBlockSchema);
  reg('CalloutBlock', CalloutBlockSchema);
  reg('QuoteBlock', QuoteBlockSchema);
  reg('DividerBlock', DividerBlockSchema);
  reg('DownloadableFileBlock', DownloadableFileBlockSchema);
  reg('ListBlock', ListBlockSchema);
  reg('InteractiveExampleBlock', InteractiveExampleBlockSchema);
  reg('ContentBlock', ContentBlockSchema);

  // 4. Register Public DTOs
  reg('CoursePublicDto', CoursePublicDtoSchema);
  reg('ChapterOutlinePublicDto', ChapterOutlinePublicDtoSchema);
  reg('LessonOutlineItemDto', LessonOutlineItemDtoSchema);
  reg('CourseOutlinePublicDto', CourseOutlinePublicDtoSchema);
  reg('LessonPublicDto', LessonPublicDtoSchema);
  reg('SitePagePublicDto', SitePagePublicDtoSchema);

  // 5. Register Wrapped Envelopes
  const HomepageResponseSchema = reg(
    'HomepageResponse',
    ApiResponseSchema(SitePagePublicDtoSchema)
  );
  const CourseListResponseSchema = reg(
    'CourseListResponse',
    ApiResponseSchema(z.array(CoursePublicDtoSchema))
  );
  const CourseDetailResponseSchema = reg(
    'CourseDetailResponse',
    ApiResponseSchema(CoursePublicDtoSchema)
  );
  const CourseOutlineResponseSchema = reg(
    'CourseOutlineResponse',
    ApiResponseSchema(CourseOutlinePublicDtoSchema)
  );
  const LessonDetailResponseSchema = reg(
    'LessonDetailResponse',
    ApiResponseSchema(LessonPublicDtoSchema)
  );
  const SearchResponseSchema = reg(
    'SearchResponse',
    ApiResponseSchema(SearchResultDtoSchema)
  );
  const SettingsResponseSchema = reg(
    'SettingsResponse',
    ApiResponseSchema(PublicSiteSettingsDtoSchema)
  );
  const SitePageResponseSchema = reg(
    'SitePageResponse',
    ApiResponseSchema(PublicSitePageDtoSchema)
  );

  // ---------------------------------------------------------------------------
  // Register Routes
  // ---------------------------------------------------------------------------

  // Health: Liveness
  registry.registerPath({
    method: 'get',
    path: '/api/v1/health/liveness',
    summary: 'Liveness probe',
    description: 'Verifies that the Express application server is running and accepting incoming HTTP requests.',
    tags: ['Health'],
    responses: {
      200: {
        description: 'Server process is live and responsive.',
        content: {
          'application/json': {
            schema: LivenessResponseSchema,
          },
        },
      },
    },
  });

  // Health: Readiness
  registry.registerPath({
    method: 'get',
    path: '/api/v1/health/readiness',
    summary: 'Readiness probe',
    description: 'Verifies connectivity and operational status of downstream dependencies, primarily MongoDB Atlas database.',
    tags: ['Health'],
    responses: {
      200: {
        description: 'Server and database connection are fully operational.',
        content: {
          'application/json': {
            schema: ReadinessResponseSchema,
          },
        },
      },
      503: {
        description: 'Database connection is degraded or disconnected.',
        content: {
          'application/json': {
            schema: ReadinessResponseSchema,
          },
        },
      },
    },
  });

  // Public: Homepage
  registry.registerPath({
    method: 'get',
    path: '/api/v1/public/home',
    summary: 'Get homepage configuration',
    description: 'Returns the public configuration for the landing page including hero section, call-to-actions, features, and SEO metadata.',
    tags: ['Public Content'],
    responses: {
      200: {
        description: 'Homepage configuration retrieved successfully.',
        content: {
          'application/json': {
            schema: HomepageResponseSchema,
          },
        },
      },
      503: {
        description: 'Database service unavailable.',
        content: {
          'application/json': {
            schema: ApiErrorResponseSchema,
          },
        },
      },
    },
  });

  // Public: Published Course List
  registry.registerPath({
    method: 'get',
    path: '/api/v1/public/courses',
    summary: 'List published courses',
    description: 'Returns a paginated list of published educational courses with optional level, tag, and pagination filters.',
    tags: ['Public Courses'],
    request: {
      query: ensureOpenApi(CourseListQuerySchema),
    },
    responses: {
      200: {
        description: 'Published course catalog retrieved successfully.',
        content: {
          'application/json': {
            schema: CourseListResponseSchema,
          },
        },
      },
      400: {
        description: 'Invalid query parameters provided.',
        content: {
          'application/json': {
            schema: ApiErrorResponseSchema,
          },
        },
      },
      500: {
        description: 'Internal server error.',
        content: {
          'application/json': {
            schema: ApiErrorResponseSchema,
          },
        },
      },
    },
  });

  // Public: Course Detail
  registry.registerPath({
    method: 'get',
    path: '/api/v1/public/courses/{courseSlug}',
    summary: 'Get published course details',
    description: 'Returns full overview metadata, target audience, prerequisites, reading stats, and SEO information for a published course by slug.',
    tags: ['Public Courses'],
    request: {
      params: ensureOpenApi(CourseSlugParamSchema),
    },
    responses: {
      200: {
        description: 'Course details retrieved successfully.',
        content: {
          'application/json': {
            schema: CourseDetailResponseSchema,
          },
        },
      },
      400: {
        description: 'Invalid course slug format.',
        content: {
          'application/json': {
            schema: ApiErrorResponseSchema,
          },
        },
      },
      404: {
        description: 'Course not found or not published.',
        content: {
          'application/json': {
            schema: ApiErrorResponseSchema,
          },
        },
      },
      500: {
        description: 'Internal server error.',
        content: {
          'application/json': {
            schema: ApiErrorResponseSchema,
          },
        },
      },
    },
  });

  // Public: Course Outline
  registry.registerPath({
    method: 'get',
    path: '/api/v1/public/courses/{courseSlug}/outline',
    summary: 'Get published course outline',
    description: 'Returns the hierarchical syllabus of published chapters and lessons for a given course slug. Used by sidebar navigation.',
    tags: ['Public Courses'],
    request: {
      params: ensureOpenApi(CourseSlugParamSchema),
    },
    responses: {
      200: {
        description: 'Course outline retrieved successfully.',
        content: {
          'application/json': {
            schema: CourseOutlineResponseSchema,
          },
        },
      },
      400: {
        description: 'Invalid course slug format.',
        content: {
          'application/json': {
            schema: ApiErrorResponseSchema,
          },
        },
      },
      404: {
        description: 'Course not found or not published.',
        content: {
          'application/json': {
            schema: ApiErrorResponseSchema,
          },
        },
      },
      500: {
        description: 'Internal server error.',
        content: {
          'application/json': {
            schema: ApiErrorResponseSchema,
          },
        },
      },
    },
  });

  // Public: Lesson Detail
  registry.registerPath({
    method: 'get',
    path: '/api/v1/public/courses/{courseSlug}/lessons/{lessonSlug}',
    summary: 'Get published lesson details and content blocks',
    description: 'Returns complete lesson reading content, including the ordered array of 13 supported content block types, metadata, and SEO data.',
    tags: ['Public Lessons'],
    request: {
      params: ensureOpenApi(LessonSlugParamsSchema),
    },
    responses: {
      200: {
        description: 'Lesson content retrieved successfully.',
        content: {
          'application/json': {
            schema: LessonDetailResponseSchema,
          },
        },
      },
      400: {
        description: 'Invalid course or lesson slug format.',
        content: {
          'application/json': {
            schema: ApiErrorResponseSchema,
          },
        },
      },
      404: {
        description: 'Lesson or parent course/chapter not found or not published.',
        content: {
          'application/json': {
            schema: ApiErrorResponseSchema,
          },
        },
      },
      500: {
        description: 'Internal server error.',
        content: {
          'application/json': {
            schema: ApiErrorResponseSchema,
          },
        },
      },
    },
  });

  // Public: Search
  registry.registerPath({
    method: 'get',
    path: '/api/v1/public/search',
    summary: 'Search published courses and lessons',
    description: 'Searches published catalog items with regex escaping and rate limiting protection.',
    tags: ['Public Content'],
    request: {
      query: ensureOpenApi(SearchQuerySchema),
    },
    responses: {
      200: {
        description: 'Search results returned successfully.',
        content: {
          'application/json': {
            schema: SearchResponseSchema,
          },
        },
      },
      422: {
        description: 'Validation failed (e.g. query length under 2 characters).',
        content: {
          'application/json': {
            schema: ApiErrorResponseSchema,
          },
        },
      },
      429: {
        description: 'Rate limit exceeded.',
        content: {
          'application/json': {
            schema: ApiErrorResponseSchema,
          },
        },
      },
    },
  });

  // Public: Settings
  registry.registerPath({
    method: 'get',
    path: '/api/v1/public/settings',
    summary: 'Get public site settings',
    description: 'Returns publicly viewable website branding, navigation, footer, and default SEO.',
    tags: ['Public Content'],
    responses: {
      200: {
        description: 'Public settings retrieved successfully.',
        content: {
          'application/json': {
            schema: SettingsResponseSchema,
          },
        },
      },
      404: {
        description: 'Site settings not configured.',
        content: {
          'application/json': {
            schema: ApiErrorResponseSchema,
          },
        },
      },
    },
  });

  // Public: Pages
  registry.registerPath({
    method: 'get',
    path: '/api/v1/public/pages/{pageKey}',
    summary: 'Get published site page content',
    description: 'Retrieves published page content by its unique page key.',
    tags: ['Public Content'],
    request: {
      params: ensureOpenApi(PageKeyParamSchema),
    },
    responses: {
      200: {
        description: 'Page content retrieved successfully.',
        content: {
          'application/json': {
            schema: SitePageResponseSchema,
          },
        },
      },
      404: {
        description: 'Page not found.',
        content: {
          'application/json': {
            schema: ApiErrorResponseSchema,
          },
        },
      },
    },
  });

  // Phase 6 Admin & Media Routes
  registerAdminOpenApiRoutes(registry);

  // ---------------------------------------------------------------------------
  // Generate OpenAPI 3.1 Document
  // ---------------------------------------------------------------------------
  const generator = new OpenApiGeneratorV31(registry.definitions);

  const document = generator.generateDocument({
    openapi: '3.1.0',
    info: {
      title: 'TECHA API Documentation',
      version: '1.0.0',
      description:
        'Official OpenAPI 3.1 specification for the TECHA 2.0 educational platform. Provides read-only access to published courses, lessons, structured content blocks, and service health checks.',
      contact: {
        name: 'TECHA Engineering Team',
        url: env.CANONICAL_API_URL,
      },
    },
    servers: [
      {
        url: env.CANONICAL_API_URL,
        description: 'Production IIS Reverse Proxy Gateway',
      },
      {
        url: `http://${env.API_HOST}:${env.API_PORT}`,
        description: 'Local Loopback Development Server',
      },
    ],
    tags: [
      {
        name: 'Public Content',
        description: 'General public website content and site-wide configurations.',
      },
      {
        name: 'Public Courses',
        description: 'Course catalog, detailed course specifications, and course syllabus outlines.',
      },
      {
        name: 'Public Lessons',
        description: 'Lesson viewer and interactive content block engine.',
      },
      {
        name: 'Health',
        description: 'Service liveness and readiness monitoring endpoints.',
      },
      {
        name: 'Admin Dashboard & Preview',
        description: 'Live platform metrics and administrative draft content previews.',
      },
      {
        name: 'Admin Courses',
        description: 'Course lifecycle, publication workflow, outline, and statistics management.',
      },
      {
        name: 'Admin Chapters',
        description: 'Chapter creation, updates, reordering, and publication controls.',
      },
      {
        name: 'Admin Lessons',
        description: 'Lesson authoring with 13 typed content blocks, reordering, and publishing.',
      },
      {
        name: 'Admin Media',
        description: 'Streaming media uploads, usage checks, metadata updates, and safe deletion.',
      },
      {
        name: 'Admin Pages & Settings',
        description: 'Site pages CMS and global platform settings management.',
      },
      {
        name: 'Admin Users & Governance',
        description: 'User status, RBAC role assignments, and session revocation controls.',
      },
      {
        name: 'Admin Revisions & Audit',
        description: 'Immutable content revision snapshots, restores, and audit trail queries.',
      },
    ],
  });

  return document;
}

// Cached document instance
export const openApiDocument = buildOpenApiDocument();
