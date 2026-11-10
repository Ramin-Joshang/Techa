import { z } from 'zod';
import { StorageKeySchema, ObjectIdSchema } from './primitives.schema';

export const NavigationItemSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1).max(50),
  path: z.string().min(1).max(200),
  external: z.boolean().default(false),
  order: z.number().int().default(0),
});

export const SocialLinkSchema = z.object({
  platform: z.string().min(1).max(50),
  url: z.string().url(),
  label: z.string().min(1).max(50),
});

export const FooterLinkGroupSchema = z.object({
  title: z.string().min(1).max(50),
  links: z.array(NavigationItemSchema).max(10).default([]),
});

export const SiteSettingsSchema = z.object({
  id: ObjectIdSchema.optional(),
  settingsKey: z.literal('global').default('global'),
  branding: z.object({
    siteName: z.string().min(1).max(100).default('تکا (TECHA)'),
    siteDescription: z.string().max(300).default('پلتفرم جامع آموزش و کارآموزی برنامه‌نویسی وب'),
    logoMediaKey: StorageKeySchema.optional(),
    faviconMediaKey: StorageKeySchema.optional(),
    defaultOgImageMediaKey: StorageKeySchema.optional(),
  }),
  header: z.object({
    logoText: z.string().max(50).default('تکا'),
    navigationItems: z.array(NavigationItemSchema).default([
      { id: 'nav-home', label: 'صفحه اصلی', path: '/', external: false, order: 1 },
      { id: 'nav-docs', label: 'مستندات و دوره‌ها', path: '/docs', external: false, order: 2 },
    ]),
    ctaButton: z
      .object({
        label: z.string().max(50),
        url: z.string().max(200),
        enabled: z.boolean().default(true),
      })
      .optional(),
  }),
  footer: z.object({
    description: z.string().max(500).default('مجموعه‌ای در بدنه دانشگاه با هدف توانمندسازی دانشجویان جهت ورود به بازار کار نرم‌افزار.'),
    copyright: z.string().max(200).default('تمامی حقوق محفوظ است © تکا'),
    linkGroups: z.array(FooterLinkGroupSchema).default([]),
    socialLinks: z.array(SocialLinkSchema).default([]),
  }),
  seo: z.object({
    defaultMetaTitle: z.string().min(1).max(100).default('مرجع تخصصی آموزش برنامه‌نویسی وب | تکا'),
    defaultMetaDescription: z.string().min(1).max(300).default('آموزش جامع فرانت‌اند و بک‌اند با استانداردهای مدرن وب به زبان فارسی.'),
    robotsPolicy: z.enum(['index, follow', 'noindex, nofollow', 'index, nofollow']).default('index, follow'),
  }),
  general: z.object({
    primaryDomain: z.string().min(1).default('techa.ir'),
    supportContact: z.string().max(100).optional(),
    timezone: z.string().default('Asia/Tehran'),
  }),
  updatedBy: ObjectIdSchema.optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export const UpdateSiteSettingsDtoSchema = SiteSettingsSchema.omit({
  id: true,
  settingsKey: true,
  createdAt: true,
  updatedAt: true,
}).partial();

export type NavigationItem = z.infer<typeof NavigationItemSchema>;
export type SocialLink = z.infer<typeof SocialLinkSchema>;
export type FooterLinkGroup = z.infer<typeof FooterLinkGroupSchema>;
export type SiteSettings = z.infer<typeof SiteSettingsSchema>;
export type UpdateSiteSettingsDto = z.infer<typeof UpdateSiteSettingsDtoSchema>;
