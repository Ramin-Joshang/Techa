import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { Types } from 'mongoose';
import { app } from '../../src/app';
import { SitePageModel } from '../../src/models/site-page.model';

describe('Phase 2 — Public Site Pages API (GET /api/v1/public/pages/:pageKey)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 200 OK with published site page DTO', async () => {
    const mockPageDoc = {
      _id: new Types.ObjectId(),
      pageKey: 'home',
      title: 'صفحه اصلی',
      heroSection: {
        title: 'تیتر اصلی',
        subtitle: 'زیرتیتر',
        primaryCta: { label: 'دوره‌ها', url: '/courses' },
      },
      features: [{ title: 'ویژگی ۱', description: 'توضیحات', icon: 'code' }],
      seo: { metaTitle: 'صفحه اصلی', metaDescription: 'توضیحات سئو' },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.spyOn(SitePageModel, 'findOne').mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockPageDoc),
    } as any);

    const response = await request(app).get('/api/v1/public/pages/home');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toHaveProperty('pageKey', 'home');
    expect(response.body.data).toHaveProperty('title', 'صفحه اصلی');
    expect(response.body.data).not.toHaveProperty('_id');
  });

  it('returns 404 NOT_FOUND when page does not exist in database', async () => {
    vi.spyOn(SitePageModel, 'findOne').mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    } as any);

    const response = await request(app).get('/api/v1/public/pages/nonexistent-page');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body.error).toHaveProperty('code', 'NOT_FOUND');
  });

  it('rejects invalid pageKey slug with 422 VALIDATION_ERROR', async () => {
    const response = await request(app).get('/api/v1/public/pages/INVALID_SLUG_UPPERCASE');

    expect(response.status).toBe(422);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
  });
});
