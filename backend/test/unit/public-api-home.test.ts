import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { Types } from 'mongoose';
import { app } from '../../src/app';
import { SitePageModel } from '../../src/models/site-page.model';

describe('Public API: GET /api/v1/public/home', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 200 OK with public SitePage DTO when homepage exists', async () => {
    const mockHomeDoc = {
      _id: new Types.ObjectId(),
      pageKey: 'home',
      title: 'صفحه اصلی تکا',
      heroSection: {
        title: 'مرجع آموزش برنامه‌نویسی',
        subtitle: 'یادگیری عمیق و کاربردی',
        primaryCta: { label: 'مشاهده دوره‌ها', url: '/courses' },
        secondaryCta: { label: 'شروع کنید', url: '/courses/react' },
      },
      features: [
        {
          title: 'مستندات تعاملی',
          description: 'توضیحات ویژگی',
          icon: 'book-open',
        },
      ],
      seo: {
        metaTitle: 'تکا - صفحه اصلی',
        metaDescription: 'توضیحات سئو صفحه اصلی',
      },
      __v: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.spyOn(SitePageModel, 'findOne').mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockHomeDoc),
    } as any);

    const response = await request(app).get('/api/v1/public/home');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('statusCode', 200);
    expect(response.body.data).toHaveProperty('pageKey', 'home');
    expect(response.body.data).toHaveProperty('title', 'صفحه اصلی تکا');
    expect(response.body.data.heroSection.primaryCta.url).toBe('/courses');

    // Never leak internal Mongoose fields
    expect(response.body.data).not.toHaveProperty('_id');
    expect(response.body.data).not.toHaveProperty('__v');

    // Correlation header
    expect(response.headers).toHaveProperty('x-request-id');
  });

  it('returns 404 NOT_FOUND when homepage configuration does not exist', async () => {
    vi.spyOn(SitePageModel, 'findOne').mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    } as any);

    const response = await request(app).get('/api/v1/public/home');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('statusCode', 404);
    expect(response.body.error).toHaveProperty('code', 'NOT_FOUND');
    expect(response.body.error.message).toMatch(/homepage configuration not found/i);
    expect(response.headers).toHaveProperty('x-request-id');
  });
});
