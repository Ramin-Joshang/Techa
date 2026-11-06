import { Schema, model, Model, HydratedDocument, Types } from 'mongoose';
import { isValidPhase1PublicRoute } from '@techa/shared';

export interface SitePageRaw {
  _id: Types.ObjectId;
  pageKey: 'home';
  title: string;
  heroSection: {
    title: string;
    subtitle: string;
    primaryCta: {
      label: string;
      url: string;
    };
    secondaryCta?: {
      label: string;
      url: string;
    };
  };
  features: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
  seo: {
    metaTitle: string;
    metaDescription: string;
    canonicalUrlOverride?: string;
    ogImageStorageKey?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export type SitePageDocument = HydratedDocument<SitePageRaw>;

const CtaSchema = new Schema(
  {
    label: { type: String, required: true, trim: true, minlength: 1, maxlength: 50 },
    url: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: (v: string) => isValidPhase1PublicRoute(v),
        message: 'CTA URL must be a valid Phase 1 public route',
      },
    },
  },
  { _id: false }
);

const HeroSectionSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 1, maxlength: 150 },
    subtitle: { type: String, required: true, trim: true, minlength: 1, maxlength: 300 },
    primaryCta: { type: CtaSchema, required: true },
    secondaryCta: { type: CtaSchema },
  },
  { _id: false }
);

const FeatureItemSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 1, maxlength: 100 },
    description: { type: String, required: true, trim: true, minlength: 1, maxlength: 300 },
    icon: { type: String, required: true, trim: true, minlength: 1, maxlength: 50 },
  },
  { _id: false }
);

const PageSeoSchema = new Schema(
  {
    metaTitle: { type: String, required: true, minlength: 1, maxlength: 100 },
    metaDescription: { type: String, required: true, minlength: 1, maxlength: 300 },
    canonicalUrlOverride: { type: String, maxlength: 255 },
    ogImageStorageKey: { type: String, maxlength: 200 },
  },
  { _id: false }
);

export const SitePageSchema = new Schema<SitePageRaw>(
  {
    pageKey: {
      type: String,
      required: true,
      unique: true,
      enum: ['home'],
      default: 'home',
    },
    title: { type: String, required: true, trim: true, minlength: 1, maxlength: 150 },
    heroSection: { type: HeroSectionSchema, required: true },
    features: {
      type: [FeatureItemSchema],
      required: true,
      validate: {
        validator: (v: unknown[]) => Array.isArray(v) && v.length >= 1 && v.length <= 6,
        message: 'Features must contain between 1 and 6 items',
      },
    },
    seo: { type: PageSeoSchema, required: true },
  },
  {
    collection: 'site_pages',
    timestamps: true,
  }
);

// Indexes:
// 1. SitePage lookup by unique pageKey (unique: true)
SitePageSchema.index({ pageKey: 1 }, { unique: true });

export const SitePageModel: Model<SitePageRaw> = model<SitePageRaw>('SitePage', SitePageSchema);
