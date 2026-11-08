import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { openApiDocument } from '../../src/core/docs/openapi';

describe('OpenAPI 3.1 & Documentation Endpoints', () => {
  // 1. Backend Root Landing Page
  describe('GET / and GET /backend', () => {
    it('GET / should return HTTP 200 with English landing page HTML', async () => {
      const res = await request(app).get('/');
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/text\/html/);
      expect(res.text).toContain('TECHA API Service');
      expect(res.text).toContain('/api-docs');
      expect(res.text).toContain('/api-docs.json');
      expect(res.text).toContain('Service Operational');
      // Ensure no database credentials or secrets leaked
      expect(res.text).not.toContain('mongodb');
      expect(res.text).not.toContain('password');
    });

    it('GET /backend should return HTTP 200 with the same English landing page', async () => {
      const res = await request(app).get('/backend');
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/text\/html/);
      expect(res.text).toContain('TECHA API Service');
      expect(res.text).toContain('Explore API Documentation');
    });
  });

  // 2. Swagger UI Route
  describe('GET /api-docs', () => {
    it('GET /api-docs should return HTTP 200 or 301/302 redirecting to /api-docs/', async () => {
      const res = await request(app).get('/api-docs/');
      expect([200, 301, 302]).toContain(res.status);
      if (res.status === 200) {
        expect(res.headers['content-type']).toMatch(/text\/html/);
        expect(res.text).toContain('swagger');
      }
    });
  });

  // 3. Raw OpenAPI Specification JSON Route
  describe('GET /api-docs.json', () => {
    it('GET /api-docs.json should return HTTP 200 and valid JSON', async () => {
      const res = await request(app).get('/api-docs.json');
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/application\/json/);
      expect(res.body).toBeDefined();
      expect(res.body.openapi).toBe('3.1.0');
    });
  });

  // 4. OpenAPI Specification Integrity & Content
  describe('OpenAPI 3.1 Specification Contract Audit', () => {
    it('should declare OpenAPI 3.1.0 version and correct info metadata', () => {
      expect(openApiDocument.openapi).toBe('3.1.0');
      expect(openApiDocument.info.title).toBe('TECHA API Documentation');
      expect(openApiDocument.info.version).toBe('1.0.0');
    });

    it('should document exactly all 7 registered backend endpoints', () => {
      const paths = Object.keys(openApiDocument.paths || {});
      expect(paths).toContain('/api/v1/health/liveness');
      expect(paths).toContain('/api/v1/health/readiness');
      expect(paths).toContain('/api/v1/public/home');
      expect(paths).toContain('/api/v1/public/courses');
      expect(paths).toContain('/api/v1/public/courses/{courseSlug}');
      expect(paths).toContain('/api/v1/public/courses/{courseSlug}/outline');
      expect(paths).toContain('/api/v1/public/courses/{courseSlug}/lessons/{lessonSlug}');
      expect(paths.length).toBe(7);
    });

    it('should register all 13 supported content block variant schemas', () => {
      const schemas = (openApiDocument.components?.schemas || {}) as Record<string, unknown>;
      const expectedBlockSchemas = [
        'HeadingBlock',
        'ParagraphBlock',
        'RichTextBlock',
        'CodeBlock',
        'ImageBlock',
        'VideoBlock',
        'TableBlock',
        'CalloutBlock',
        'QuoteBlock',
        'DividerBlock',
        'DownloadableFileBlock',
        'ListBlock',
        'InteractiveExampleBlock',
        'ContentBlock',
      ];
      for (const blockName of expectedBlockSchemas) {
        expect(schemas[blockName]).toBeDefined();
      }
    });

    it('should register all public DTO schemas and response envelopes', () => {
      const schemas = (openApiDocument.components?.schemas || {}) as Record<string, unknown>;
      expect(schemas['CoursePublicDto']).toBeDefined();
      expect(schemas['CourseOutlinePublicDto']).toBeDefined();
      expect(schemas['LessonPublicDto']).toBeDefined();
      expect(schemas['SitePagePublicDto']).toBeDefined();
      expect(schemas['LivenessResponse']).toBeDefined();
      expect(schemas['ReadinessResponse']).toBeDefined();
      expect(schemas['ApiErrorResponse']).toBeDefined();
      expect(schemas['CourseListResponse']).toBeDefined();
      expect(schemas['CourseDetailResponse']).toBeDefined();
      expect(schemas['LessonDetailResponse']).toBeDefined();
    });

    it('should configure production canonical URL and avoid leaking private IPs or credentials', () => {
      const servers = openApiDocument.servers || [];
      expect(servers.length).toBeGreaterThanOrEqual(1);
      const prodServer = servers.find((s) => s.url === 'https://techa.ir');
      expect(prodServer).toBeDefined();

      const specString = JSON.stringify(openApiDocument);
      expect(specString).not.toContain('mongodb');
      expect(specString).not.toContain('password');
      expect(specString).not.toContain('62.220.123.21');
    });

    it('should verify that all human-readable descriptions, summaries, and tags contain 0 Persian characters', () => {
      const persianRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;

      // Check info
      expect(persianRegex.test(openApiDocument.info.description || '')).toBe(false);
      expect(persianRegex.test(openApiDocument.info.title)).toBe(false);

      // Check tags
      for (const tag of openApiDocument.tags || []) {
        expect(persianRegex.test(tag.name)).toBe(false);
        expect(persianRegex.test(tag.description || '')).toBe(false);
      }

      // Check path summaries and descriptions
      for (const [pathKey, pathItem] of Object.entries(openApiDocument.paths || {})) {
        for (const [method, operation] of Object.entries(pathItem as Record<string, any>)) {
          if (operation && typeof operation === 'object') {
            if (operation.summary) {
              expect(
                persianRegex.test(operation.summary),
                `Persian text found in summary of ${method.toUpperCase()} ${pathKey}`
              ).toBe(false);
            }
            if (operation.description) {
              expect(
                persianRegex.test(operation.description),
                `Persian text found in description of ${method.toUpperCase()} ${pathKey}`
              ).toBe(false);
            }
          }
        }
      }
    });
  });
});
