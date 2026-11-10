import mongoose from 'mongoose';
import { TargetCollection, TARGET_COLLECTIONS } from '@techa/shared';
import { TARGET_COLLECTION_REGISTRY } from './collections';
import { connectToDatabase, isDatabaseConnected, sanitizeMongoUri } from './mongoose';
import { logger } from '../logger/logger';
import { SiteSettingsModel } from '../../models/site-settings.model';

export interface ProvisionedCollectionReport {
  name: TargetCollection;
  description: string;
  exists: boolean;
  documentCount: number;
  indexes: Array<{
    name: string;
    key: Record<string, any>;
    unique?: boolean;
    expireAfterSeconds?: number;
  }>;
}

export interface ProvisioningResult {
  status: 'COMPLETE' | 'BLOCKED' | 'FAILED';
  connectionStatus: 'connected' | 'disconnected' | 'missing_uri';
  databaseName?: string;
  sanitizedUri?: string;
  reason?: string;
  collections: ProvisionedCollectionReport[];
  totalCollections: number;
  totalIndexes: number;
  defaultSettingsCreated?: boolean;
}

/**
 * Idempotently provisions all 11 collections and indexes on MongoDB Atlas.
 * If MONGODB_URI is absent or the connection cannot be made, returns status BLOCKED.
 */
export async function provisionDatabase(options?: {
  dryRun?: boolean;
  uriOverride?: string;
}): Promise<ProvisioningResult> {
  const uri = options?.uriOverride || process.env.MONGODB_URI;

  if (!uri) {
    return {
      status: 'BLOCKED',
      connectionStatus: 'missing_uri',
      reason: 'متغیر محیطی MONGODB_URI تنظیم نشده است و اتصال به MongoDB Atlas بدون کلید دسترسی مسدود می‌باشد.',
      collections: [],
      totalCollections: 0,
      totalIndexes: 0,
    };
  }

  const sanitized = sanitizeMongoUri(uri);

  try {
    if (!isDatabaseConnected()) {
      await connectToDatabase(uri);
    }

    if (!isDatabaseConnected() || !mongoose.connection.db) {
      return {
        status: 'BLOCKED',
        connectionStatus: 'disconnected',
        sanitizedUri: sanitized,
        reason: 'برقراری اتصال شبکه به سرور MongoDB Atlas ناموفق بود یا دسترسی شبکه در دسترس نیست.',
        collections: [],
        totalCollections: 0,
        totalIndexes: 0,
      };
    }

    const db = mongoose.connection.db;
    const databaseName = db.databaseName;

    // Get existing collection names from MongoDB
    const existingCollectionsCursor = await db.listCollections().toArray();
    const existingCollectionNames = new Set(existingCollectionsCursor.map((c) => c.name));

    const reports: ProvisionedCollectionReport[] = [];
    let totalIndexesCount = 0;

    for (const collName of TARGET_COLLECTIONS) {
      const meta = TARGET_COLLECTION_REGISTRY[collName];
      const model = meta.model;

      if (!options?.dryRun) {
        // Idempotently create collection if it does not exist
        if (!existingCollectionNames.has(collName)) {
          logger.info(`[Provisioner] Creating collection '${collName}'...`);
          await db.createCollection(collName);
          existingCollectionNames.add(collName);
        }

        // Idempotently sync model indexes
        logger.info(`[Provisioner] Synchronizing indexes for model '${model.modelName}' (${collName})...`);
        await model.syncIndexes();
      }

      // Read current state
      const collectionExists = existingCollectionNames.has(collName);
      let docCount = 0;
      let indexes: Array<any> = [];

      if (collectionExists) {
        try {
          docCount = await model.countDocuments();
          const rawIndexes = await db.collection(collName).indexes();
          indexes = rawIndexes.map((idx) => ({
            name: idx.name,
            key: idx.key,
            ...(idx.unique ? { unique: true } : {}),
            ...(idx.expireAfterSeconds !== undefined
              ? { expireAfterSeconds: idx.expireAfterSeconds }
              : {}),
          }));
          totalIndexesCount += indexes.length;
        } catch (err) {
          logger.warn({ err, collection: collName }, '[Provisioner] Failed to read indexes/count');
        }
      }

      reports.push({
        name: collName,
        description: meta.description,
        exists: collectionExists,
        documentCount: docCount,
        indexes,
      });
    }

    // Ensure default site_settings document exists if not present
    let defaultSettingsCreated = false;
    if (!options?.dryRun && existingCollectionNames.has('site_settings')) {
      const existingSettings = await SiteSettingsModel.findOne({ settingsKey: 'global' });
      if (!existingSettings) {
        logger.info('[Provisioner] Initializing default global site settings document...');
        await SiteSettingsModel.create({
          settingsKey: 'global',
          branding: {
            siteName: 'تکا (TECHA)',
            siteDescription: 'پلتفرم جامع آموزش و کارآموزی برنامه‌نویسی وب',
          },
          header: {
            logoText: 'تکا',
            navigationItems: [
              { id: 'nav-home', label: 'صفحه اصلی', path: '/', external: false, order: 1 },
              { id: 'nav-docs', label: 'مستندات و دوره‌ها', path: '/docs', external: false, order: 2 },
            ],
          },
          footer: {
            description: 'مجموعه‌ای در بدنه دانشگاه با هدف توانمندسازی دانشجویان جهت ورود به بازار کار نرم‌افزار.',
            copyright: 'تمامی حقوق محفوظ است © تکا',
            linkGroups: [],
            socialLinks: [
              { platform: 'github', url: 'https://github.com/techa', label: 'گیت‌هاب' },
            ],
          },
          seo: {
            defaultMetaTitle: 'مرجع تخصصی آموزش برنامه‌نویسی وب | تکا',
            defaultMetaDescription: 'آموزش جامع فرانت‌اند و بک‌اند با استانداردهای مدرن وب به زبان فارسی.',
            robotsPolicy: 'index, follow',
          },
          general: {
            primaryDomain: 'techa.ir',
            timezone: 'Asia/Tehran',
          },
        });
        defaultSettingsCreated = true;
      }
    }

    return {
      status: 'COMPLETE',
      connectionStatus: 'connected',
      databaseName,
      sanitizedUri: sanitized,
      collections: reports,
      totalCollections: reports.filter((r) => r.exists).length,
      totalIndexes: totalIndexesCount,
      defaultSettingsCreated,
    };
  } catch (error: any) {
    logger.error({ error }, '[Provisioner] Exception during database provisioning.');
    return {
      status: 'FAILED',
      connectionStatus: isDatabaseConnected() ? 'connected' : 'disconnected',
      sanitizedUri: sanitized,
      reason: error?.message || 'خطای غیرمنتظره هنگام عملیات پایگاه داده',
      collections: [],
      totalCollections: 0,
      totalIndexes: 0,
    };
  }
}

/**
 * Read-only inspection of MongoDB Atlas collections and indexes.
 */
export async function inspectDatabase(options?: {
  uriOverride?: string;
}): Promise<ProvisioningResult> {
  return provisionDatabase({ dryRun: true, uriOverride: options?.uriOverride });
}
