import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { Types } from 'mongoose';
import { app } from '../../src/app';
import { SiteSettingsModel } from '../../src/models/site-settings.model';

describe('Phase 2 — Public Settings API (GET /api/v1/public/settings)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 200 OK with public site settings and never leaks confidential fields', async () => {
    const mockSettingsDoc = {
      _id: new Types.ObjectId(),
      settingsKey: 'global',
      branding: {
        siteName: 'تکا (TECHA)',
        siteDescription: 'پلتفرم آموزش برنامه‌نویسی',
      },
      header: {
        logoText: 'تکا',
        navigationItems: [{ id: '1', label: 'صفحه اصلی', path: '/', external: false, order: 1 }],
      },
      footer: {
        description: 'توضیحات فوتر',
        copyright: 'تمامی حقوق محفوظ است',
        linkGroups: [],
        socialLinks: [{ platform: 'github', url: 'https://github.com/techa', label: 'گیت‌هاب' }],
      },
      seo: {
        defaultMetaTitle: 'تکا',
        defaultMetaDescription: 'توضیحات پیش‌فرض',
        robotsPolicy: 'index, follow',
      },
      general: {
        primaryDomain: 'techa.ir',
        timezone: 'Asia/Tehran',
      },
      updatedBy: new Types.ObjectId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.spyOn(SiteSettingsModel, 'findOne').mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockSettingsDoc),
    } as any);

    const response = await request(app).get('/api/v1/public/settings');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toHaveProperty('branding');
    expect(response.body.data.branding.siteName).toBe('تکا (TECHA)');
    expect(response.body.data).toHaveProperty('header');
    expect(response.body.data).toHaveProperty('footer');
    expect(response.body.data).toHaveProperty('seo');
    expect(response.body.data).toHaveProperty('general');

    // Confidential and administrative fields must NEVER be returned
    expect(response.body.data).not.toHaveProperty('_id');
    expect(response.body.data).not.toHaveProperty('updatedBy');
    expect(response.body.data).not.toHaveProperty('settingsKey');
  });

  it('returns 404 NOT_FOUND when site settings are not found in database', async () => {
    vi.spyOn(SiteSettingsModel, 'findOne').mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    } as any);

    const response = await request(app).get('/api/v1/public/settings');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body.error).toHaveProperty('code', 'NOT_FOUND');
  });
});
