import mongoose, { Schema, model, Model, HydratedDocument, Types } from 'mongoose';

export interface SiteSettingsRaw {
  _id: Types.ObjectId;
  settingsKey: string;
  branding: {
    siteName: string;
    siteDescription: string;
    logoMediaKey?: string;
    faviconMediaKey?: string;
    defaultOgImageMediaKey?: string;
  };
  header: {
    logoText: string;
    navigationItems: Array<{
      id: string;
      label: string;
      path: string;
      external: boolean;
      order: number;
    }>;
    ctaButton?: {
      label: string;
      url: string;
      enabled: boolean;
    };
  };
  footer: {
    description: string;
    copyright: string;
    linkGroups: Array<{
      title: string;
      links: Array<{
        id: string;
        label: string;
        path: string;
        external: boolean;
        order: number;
      }>;
    }>;
    socialLinks: Array<{
      platform: string;
      url: string;
      label: string;
    }>;
  };
  seo: {
    defaultMetaTitle: string;
    defaultMetaDescription: string;
    robotsPolicy: 'index, follow' | 'noindex, nofollow' | 'index, nofollow';
  };
  general: {
    primaryDomain: string;
    supportContact?: string;
    timezone: string;
  };
  version: number;
  updatedBy?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

export type SiteSettingsDocument = HydratedDocument<SiteSettingsRaw>;

const NavigationItemSubSchema = new Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true, maxlength: 50 },
    path: { type: String, required: true, maxlength: 200 },
    external: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const FooterLinkGroupSubSchema = new Schema(
  {
    title: { type: String, required: true, maxlength: 50 },
    links: { type: [NavigationItemSubSchema], default: [] },
  },
  { _id: false }
);

const SocialLinkSubSchema = new Schema(
  {
    platform: { type: String, required: true, maxlength: 50 },
    url: { type: String, required: true },
    label: { type: String, required: true, maxlength: 50 },
  },
  { _id: false }
);

const HeaderCtaButtonSubSchema = new Schema(
  {
    label: { type: String, required: true },
    url: { type: String, required: true },
    enabled: { type: Boolean, default: true },
  },
  { _id: false }
);

export const SiteSettingsSchema = new Schema<SiteSettingsRaw>(
  {
    settingsKey: {
      type: String,
      required: true,
      unique: true,
      default: 'global',
      immutable: true,
    },
    branding: {
      siteName: { type: String, required: true, default: 'تکا (TECHA)' },
      siteDescription: { type: String, default: 'پلتفرم جامع آموزش و کارآموزی برنامه‌نویسی وب' },
      logoMediaKey: { type: String, trim: true },
      faviconMediaKey: { type: String, trim: true },
      defaultOgImageMediaKey: { type: String, trim: true },
    },
    header: {
      logoText: { type: String, default: 'تکا' },
      navigationItems: {
        type: [NavigationItemSubSchema],
        default: [
          { id: 'nav-home', label: 'صفحه اصلی', path: '/', external: false, order: 1 },
          { id: 'nav-docs', label: 'مستندات و دوره‌ها', path: '/docs', external: false, order: 2 },
        ],
      },
      ctaButton: { type: HeaderCtaButtonSubSchema, default: undefined },
    },
    footer: {
      description: {
        type: String,
        default: 'مجموعه‌ای در بدنه دانشگاه با هدف توانمندسازی دانشجویان جهت ورود به بازار کار نرم‌افزار.',
      },
      copyright: { type: String, default: 'تمامی حقوق محفوظ است © تکا' },
      linkGroups: { type: [FooterLinkGroupSubSchema], default: [] },
      socialLinks: { type: [SocialLinkSubSchema], default: [] },
    },
    seo: {
      defaultMetaTitle: { type: String, required: true, default: 'مرجع تخصصی آموزش برنامه‌نویسی وب | تکا' },
      defaultMetaDescription: {
        type: String,
        required: true,
        default: 'آموزش جامع فرانت‌اند و بک‌اند با استانداردهای مدرن وب به زبان فارسی.',
      },
      robotsPolicy: {
        type: String,
        enum: ['index, follow', 'noindex, nofollow', 'index, nofollow'],
        default: 'index, follow',
      },
    },
    general: {
      primaryDomain: { type: String, required: true, default: 'techa.ir' },
      supportContact: { type: String },
      timezone: { type: String, default: 'Asia/Tehran' },
    },
    version: { type: Number, required: true, default: 1, min: 1 },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  {
    collection: 'site_settings',
    timestamps: true,
  }
);

// Indexes
SiteSettingsSchema.index({ settingsKey: 1 }, { unique: true });

export const SiteSettingsModel: Model<SiteSettingsRaw> =
  (mongoose.models?.SiteSettings as Model<SiteSettingsRaw>) ||
  model<SiteSettingsRaw>('SiteSettings', SiteSettingsSchema);
