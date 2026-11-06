import { z } from 'zod';
import { ObjectIdSchema, SeoMetadataSchema } from './primitives.schema';

export function isValidPhase1PublicRoute(url: string): boolean {
  if (url === '/' || url === '/courses') {
    return true;
  }
  // /courses/:slug
  if (/^\/courses\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(url)) {
    return true;
  }
  // /courses/:courseSlug/lessons/:lessonSlug
  if (/^\/courses\/[a-z0-9]+(?:-[a-z0-9]+)*\/lessons\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(url)) {
    return true;
  }
  return false;
}

export const Phase1PublicRouteSchema = z
  .string()
  .min(1, 'Route cannot be empty')
  .superRefine((url, ctx) => {
    if (!isValidPhase1PublicRoute(url)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Route "${url}" is not an allowed Phase 1 public route. Allowed routes: "/", "/courses", "/courses/:slug", or "/courses/:courseSlug/lessons/:lessonSlug"`,
      });
    }
  });

export const PageCtaSchema = z.object({
  label: z.string().min(1, 'CTA label cannot be empty').max(50, 'CTA label cannot exceed 50 characters'),
  url: Phase1PublicRouteSchema,
});

export const HomePageHeroSectionSchema = z.object({
  title: z.string().min(1, 'Hero title cannot be empty').max(150, 'Hero title cannot exceed 150 characters'),
  subtitle: z.string().min(1, 'Hero subtitle cannot be empty').max(300, 'Hero subtitle cannot exceed 300 characters'),
  primaryCta: PageCtaSchema,
  secondaryCta: PageCtaSchema.optional(),
});

export const HomePageFeatureItemSchema = z.object({
  title: z.string().min(1, 'Feature title cannot be empty').max(100, 'Feature title cannot exceed 100 characters'),
  description: z.string().min(1, 'Feature description cannot be empty').max(300, 'Feature description cannot exceed 300 characters'),
  icon: z.string().min(1, 'Feature icon is required').max(50, 'Feature icon cannot exceed 50 characters'),
});

export const SitePageSchema = z.object({
  id: ObjectIdSchema.optional(),
  pageKey: z.literal('home'),
  title: z.string().min(1, 'Page title cannot be empty').max(150, 'Page title cannot exceed 150 characters'),
  heroSection: HomePageHeroSectionSchema,
  features: z
    .array(HomePageFeatureItemSchema)
    .min(1, 'At least 1 feature is required')
    .max(6, 'Cannot exceed 6 features')
    .default([]),
  seo: SeoMetadataSchema,
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export const UpdateSitePageDtoSchema = z.object({
  title: z.string().min(1).max(150).optional(),
  heroSection: HomePageHeroSectionSchema.optional(),
  features: z.array(HomePageFeatureItemSchema).min(1).max(6).optional(),
  seo: SeoMetadataSchema.optional(),
});

export const SitePagePublicDtoSchema = z.object({
  pageKey: z.literal('home'),
  title: z.string(),
  heroSection: HomePageHeroSectionSchema,
  features: z.array(HomePageFeatureItemSchema),
  seo: SeoMetadataSchema,
});

export type SitePage = z.infer<typeof SitePageSchema>;
export type UpdateSitePageDto = z.input<typeof UpdateSitePageDtoSchema>;
export type SitePagePublicDto = z.infer<typeof SitePagePublicDtoSchema>;
