import { Schema, SchemaDefinitionProperty, model, Model, HydratedDocument, Types } from 'mongoose';
import {
  isValidPhase1PublicRoute,
  PublicationStatus,
  PUBLICATION_STATUSES,
  ContentBlock,
} from '@techa/shared';
import {
  BaseContentBlockSchema,
  registerContentBlockDiscriminators,
} from './content-block.schema';

export interface SitePageRaw {
  _id: Types.ObjectId;
  pageKey: string;
  title: string;
  heroSection?: {
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
  features?: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
  contentBlocks: ContentBlock[];
  seo: {
    metaTitle: string;
    metaDescription: string;
    canonicalUrlOverride?: string;
    ogImageStorageKey?: string;
  };
  status: PublicationStatus;
  version: number;
  publishedAt?: Date | null;
  archivedAt?: Date | null;
  createdBy?: Types.ObjectId | null;
  updatedBy?: Types.ObjectId | null;
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

const FeatureItemSchema = new Schema<{
  title: string;
  description: string;
  icon: string;
}>(
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
      trim: true,
      lowercase: true,
      minlength: 1,
      maxlength: 100,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid pageKey format'],
    },
    title: { type: String, required: true, trim: true, minlength: 1, maxlength: 150 },
    heroSection: { type: HeroSectionSchema, required: false },
    features: {
      type: [FeatureItemSchema],
      required: false,
      default: undefined,
      validate: {
        validator: function (this: { pageKey?: string }, v: unknown[] | undefined) {
          if (this.pageKey === 'home') {
            return Array.isArray(v) && v.length >= 1 && v.length <= 6;
          }
          return v === undefined || (Array.isArray(v) && v.length <= 6);
        },
        message: 'Home page features must contain between 1 and 6 items',
      },
    } as SchemaDefinitionProperty<SitePageRaw['features']>,
    contentBlocks: {
      type: [BaseContentBlockSchema],
      default: [],
    },
    seo: { type: PageSeoSchema, required: true },
    status: { type: String, required: true, enum: PUBLICATION_STATUSES, default: 'draft' },
    version: { type: Number, required: true, default: 1, min: 1 },
    publishedAt: { type: Date, default: null },
    archivedAt: { type: Date, default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  {
    collection: 'site_pages',
    timestamps: true,
  }
);

const pageContentBlocksPath = SitePageSchema.path('contentBlocks') as Schema.Types.DocumentArray;
registerContentBlockDiscriminators(pageContentBlocksPath);

SitePageSchema.index({ pageKey: 1 }, { unique: true });
SitePageSchema.index({ status: 1 });

export const SitePageModel: Model<SitePageRaw> = model<SitePageRaw>('SitePage', SitePageSchema);
