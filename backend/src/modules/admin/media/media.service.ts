import Busboy from 'busboy';
import { Request } from 'express';
import { Types } from 'mongoose';
import {
  MEDIA_CATEGORIES,
  MEDIA_VISIBILITIES,
  MediaCategory,
  MediaVisibility,
  AdminMediaListQuery,
  AdminUpdateMediaDto,
  AdminMediaDto,
  MediaUsageItem,
} from '@techa/shared';
import { MediaAssetModel, MediaAssetRaw } from '../../../models/media-asset.model';
import { CourseModel } from '../../../models/course.model';
import { LessonModel } from '../../../models/lesson.model';
import { SitePageModel } from '../../../models/site-page.model';
import { SiteSettingsModel } from '../../../models/site-settings.model';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '../../../core/errors/app-error';
import { escapeRegex } from '../../../core/utils/regex';
import { localMediaStorage } from './media-storage.service';
import { AuthenticatedAdminActor, assertOwnershipIfEditorOnly } from '../authz/permissions.middleware';
import { adminAuditService } from '../audit/audit.service';

export interface RequestAuditContext {
  requestId: string;
  ipHash: string;
  userAgent: string | null;
}

export function buildPublicMediaUrl(storageKey: string): string {
  return `/api/v1/public/media/${storageKey}`;
}

export function toAdminMediaDto(doc: MediaAssetRaw | any): AdminMediaDto {
  return {
    id: doc._id.toString(),
    storageKey: doc.storageKey,
    safeFilename: doc.safeFilename,
    originalFileName: doc.originalFileName,
    mimeType: doc.mimeType,
    mediaType: doc.mediaType || 'image',
    sizeBytes: doc.sizeBytes,
    width: doc.width,
    height: doc.height,
    checksumSha256: doc.checksumSha256,
    category: doc.category,
    storageProvider: doc.storageProvider || 'local',
    visibility: doc.visibility || 'public',
    status: doc.status || 'ready',
    altText: doc.altText,
    uploadedBy: doc.uploadedBy ? doc.uploadedBy.toString() : null,
    archivedAt: doc.archivedAt ? new Date(doc.archivedAt).toISOString() : null,
    publicUrl: buildPublicMediaUrl(doc.storageKey),
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
  };
}

export class AdminMediaService {
  public async assertMediaKeysExist(storageKeys: Array<string | undefined | null>): Promise<void> {
    const keys = Array.from(
      new Set(storageKeys.filter((k): k is string => typeof k === 'string' && k.trim().length > 0))
    );
    if (keys.length === 0) return;

    const found = await MediaAssetModel.find(
      { storageKey: { $in: keys }, status: { $ne: 'archived' } },
      { storageKey: 1 }
    ).lean();

    const foundSet = new Set((found || []).map((f) => f.storageKey));
    const missing = keys.filter((k) => !foundSet.has(k));
    if (missing.length > 0) {
      throw new BadRequestError(
        `فایل رسانه با کلید ${missing.join(', ')} در مخزن رسانه یافت نشد یا آماده استفاده نیست`
      );
    }
  }

  public async uploadFromMultipartRequest(
    req: Request,
    actor: AuthenticatedAdminActor,
    ctx: RequestAuditContext
  ): Promise<AdminMediaDto> {
    const contentType = req.headers['content-type'] || '';
    if (!contentType.toLowerCase().includes('multipart/form-data')) {
      throw new BadRequestError('درخواست بارگذاری فایل باید از نوع multipart/form-data باشد');
    }

    const parsedUpload = await new Promise<{
      stored: Awaited<ReturnType<typeof localMediaStorage.storeFromStream>>;
      category: MediaCategory;
      altText?: string;
      visibility: MediaVisibility;
    }>((resolve, reject) => {
      const fields: Record<string, string> = {};
      let filePromise: Promise<Awaited<ReturnType<typeof localMediaStorage.storeFromStream>>> | null = null;
      let fileCount = 0;
      let settled = false;

      const failOnce = (err: unknown) => {
        if (settled) return;
        settled = true;
        reject(err);
      };

      let bb: ReturnType<typeof Busboy>;
      try {
        bb = Busboy({
          headers: req.headers,
          limits: {
            files: 1,
            fields: 10,
            fieldSize: 4096,
          },
        });
      } catch (err) {
        return failOnce(new BadRequestError('هدر multipart/form-data نامعتبر است', err));
      }

      bb.on('field', (name: string, value: string) => {
        fields[name] = value;
      });

      bb.on('file', (_fieldname: string, fileStream, info) => {
        fileCount += 1;
        if (fileCount > 1) {
          fileStream.resume();
          return;
        }
        filePromise = localMediaStorage.storeFromStream({
          fileStream,
          originalFileName: info.filename || 'upload',
          claimedMimeType: info.mimeType || 'application/octet-stream',
        });
        filePromise.catch((err) => failOnce(err));
      });

      bb.on('filesLimit', () => {
        failOnce(new BadRequestError('در هر درخواست فقط یک فایل قابل بارگذاری است'));
      });

      bb.on('error', (err) => {
        failOnce(new BadRequestError('خطا در پردازش جریان بارگذاری فایل', err));
      });

      bb.on('finish', async () => {
        if (settled) return;
        if (!filePromise) {
          return failOnce(new BadRequestError('هیچ فایلی برای بارگذاری ارسال نشده است'));
        }
        try {
          const stored = await filePromise;
          const rawCategory = (fields.category || 'site_asset').trim() as MediaCategory;
          if (!MEDIA_CATEGORIES.includes(rawCategory)) {
            await localMediaStorage.deleteFile(stored.storageKey);
            return failOnce(new BadRequestError('دسته‌بندی رسانه نامعتبر است'));
          }

          const rawVisibility = (fields.visibility || 'public').trim() as MediaVisibility;
          if (!MEDIA_VISIBILITIES.includes(rawVisibility)) {
            await localMediaStorage.deleteFile(stored.storageKey);
            return failOnce(new BadRequestError('سطح دسترسی رسانه نامعتبر است'));
          }

          const altText = fields.altText ? fields.altText.trim().slice(0, 200) : undefined;
          settled = true;
          resolve({
            stored,
            category: rawCategory,
            altText,
            visibility: rawVisibility,
          });
        } catch (err) {
          failOnce(err);
        }
      });

      req.pipe(bb);
    });

    try {
      const created = await MediaAssetModel.create({
        storageKey: parsedUpload.stored.storageKey,
        safeFilename: parsedUpload.stored.safeFilename,
        originalFileName: parsedUpload.stored.originalFileName,
        mimeType: parsedUpload.stored.mimeType,
        mediaType: parsedUpload.stored.mediaType,
        sizeBytes: parsedUpload.stored.sizeBytes,
        checksumSha256: parsedUpload.stored.checksumSha256,
        category: parsedUpload.category,
        storageProvider: 'local',
        visibility: parsedUpload.visibility,
        status: 'ready',
        altText: parsedUpload.altText,
        uploadedBy: actor.objectId,
      });

      await adminAuditService.record({
        actorUserId: actor.objectId,
        actorRole: actor.primaryRole,
        action: 'create',
        resourceType: 'media_asset',
        resourceId: created._id.toString(),
        result: 'success',
        requestId: ctx.requestId,
        changedFields: ['storageKey', 'category', 'mimeType', 'sizeBytes'],
        changeSummary: `بارگذاری رسانه جدید (${created.originalFileName})`,
        ipHash: ctx.ipHash,
        userAgent: ctx.userAgent,
      });

      return toAdminMediaDto(created);
    } catch (err) {
      await localMediaStorage.deleteFile(parsedUpload.stored.storageKey);
      throw err;
    }
  }

  public async listMedia(query: AdminMediaListQuery) {
    const filter: Record<string, unknown> = {};
    if (query.category) filter.category = query.category;
    if (query.mediaType) filter.mediaType = query.mediaType;
    if (query.status) filter.status = query.status;

    if (query.q) {
      const regex = new RegExp(escapeRegex(query.q.trim()), 'i');
      filter.$or = [
        { originalFileName: { $regex: regex } },
        { altText: { $regex: regex } },
        { storageKey: { $regex: regex } },
      ];
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;
    const sortDir = query.order === 'asc' ? 1 : -1;
    const sortField = query.sort || 'createdAt';

    const [total, docs] = await Promise.all([
      MediaAssetModel.countDocuments(filter),
      MediaAssetModel.find(filter)
        .sort({ [sortField]: sortDir, _id: sortDir })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    return {
      items: (docs || []).map(toAdminMediaDto),
      total: total || 0,
      page,
      limit,
      totalPages: Math.ceil((total || 0) / limit) || 1,
    };
  }

  public async getMediaById(mediaId: string): Promise<AdminMediaDto> {
    if (!Types.ObjectId.isValid(mediaId)) {
      throw new NotFoundError('رسانه مورد نظر یافت نشد');
    }
    const doc = await MediaAssetModel.findById(mediaId).lean();
    if (!doc) {
      throw new NotFoundError('رسانه مورد نظر یافت نشد');
    }
    return toAdminMediaDto(doc);
  }

  public async updateMedia(
    mediaId: string,
    dto: AdminUpdateMediaDto,
    actor: AuthenticatedAdminActor,
    ctx: RequestAuditContext
  ): Promise<AdminMediaDto> {
    const doc = await MediaAssetModel.findById(mediaId);
    if (!doc) {
      throw new NotFoundError('رسانه مورد نظر یافت نشد');
    }

    assertOwnershipIfEditorOnly(actor, doc.uploadedBy, 'فایل رسانه');

    const changedFields: string[] = [];
    if (dto.altText !== undefined) {
      doc.altText = dto.altText;
      changedFields.push('altText');
    }
    if (dto.category !== undefined) {
      doc.category = dto.category;
      changedFields.push('category');
    }
    if (dto.visibility !== undefined) {
      doc.visibility = dto.visibility;
      changedFields.push('visibility');
    }
    if (dto.status !== undefined) {
      doc.status = dto.status;
      if (dto.status === 'archived') {
        doc.archivedAt = new Date();
      }
      changedFields.push('status');
    }

    await doc.save();

    await adminAuditService.record({
      actorUserId: actor.objectId,
      actorRole: actor.primaryRole,
      action: 'update',
      resourceType: 'media_asset',
      resourceId: doc._id.toString(),
      result: 'success',
      requestId: ctx.requestId,
      changedFields,
      changeSummary: `بروزرسانی اطلاعات رسانه ${doc.originalFileName}`,
      ipHash: ctx.ipHash,
      userAgent: ctx.userAgent,
    });

    return toAdminMediaDto(doc);
  }

  public async getMediaUsage(mediaId: string): Promise<{
    media: AdminMediaDto;
    usages: MediaUsageItem[];
    usedInPublishedContent: boolean;
  }> {
    const doc = await MediaAssetModel.findById(mediaId).lean();
    if (!doc) {
      throw new NotFoundError('رسانه مورد نظر یافت نشد');
    }

    const storageKey = doc.storageKey;
    const usages: MediaUsageItem[] = [];

    const [courses, lessons, pages, settings] = await Promise.all([
      CourseModel.find({
        $or: [
          { coverStorageKey: storageKey },
          { 'icon.storageKey': storageKey },
          { 'seo.ogImageStorageKey': storageKey },
        ],
      })
        .select({ _id: 1, title: 1, slug: 1, status: 1, coverStorageKey: 1, icon: 1, seo: 1 })
        .lean(),
      LessonModel.find({
        $or: [
          { 'seo.ogImageStorageKey': storageKey },
          { 'contentBlocks.data.storageKey': storageKey },
          { 'contentBlocks.data.posterStorageKey': storageKey },
        ],
      })
        .select({ _id: 1, title: 1, slug: 1, status: 1, seo: 1 })
        .lean(),
      SitePageModel.find({
        $or: [
          { 'seo.ogImageStorageKey': storageKey },
          { 'contentBlocks.data.storageKey': storageKey },
          { 'contentBlocks.data.posterStorageKey': storageKey },
        ],
      })
        .select({ _id: 1, title: 1, pageKey: 1, status: 1 })
        .lean(),
      SiteSettingsModel.findOne({
        $or: [
          { 'branding.logoMediaKey': storageKey },
          { 'branding.faviconMediaKey': storageKey },
          { 'branding.defaultOgImageMediaKey': storageKey },
        ],
      })
        .select({ _id: 1, settingsKey: 1 })
        .lean(),
    ]);

    for (const c of courses || []) {
      usages.push({
        resourceType: 'course',
        resourceId: c._id.toString(),
        title: c.title,
        slug: c.slug,
        status: c.status,
        field: c.coverStorageKey === storageKey ? 'coverStorageKey' : 'icon/seo',
      });
    }

    for (const l of lessons || []) {
      usages.push({
        resourceType: 'lesson',
        resourceId: l._id.toString(),
        title: l.title,
        slug: l.slug,
        status: l.status,
        field: l.seo?.ogImageStorageKey === storageKey ? 'seo.ogImageStorageKey' : 'contentBlocks',
      });
    }

    for (const p of pages || []) {
      usages.push({
        resourceType: 'site_page',
        resourceId: p._id.toString(),
        title: p.title,
        slug: p.pageKey,
        status: p.status || 'published',
        field: 'contentBlocks/seo',
      });
    }

    if (settings) {
      usages.push({
        resourceType: 'site_settings',
        resourceId: settings._id.toString(),
        title: 'تنظیمات عمومی سایت',
        slug: settings.settingsKey,
        status: 'published',
        field: 'branding',
      });
    }

    const usedInPublishedContent = usages.some((u) => u.status === 'published');

    return {
      media: toAdminMediaDto(doc),
      usages,
      usedInPublishedContent,
    };
  }

  public async deleteMedia(
    mediaId: string,
    actor: AuthenticatedAdminActor,
    ctx: RequestAuditContext
  ): Promise<{ deletedId: string; storageKey: string }> {
    const usageResult = await this.getMediaUsage(mediaId);
    if (usageResult.usedInPublishedContent) {
      throw new ConflictError(
        'امکان حذف این فایل وجود ندارد زیرا در محتوای منتشرشده استفاده شده است',
        { usages: usageResult.usages }
      );
    }

    if (usageResult.usages.length > 0) {
      throw new ConflictError(
        'این فایل هنوز به دوره‌ها، درس‌ها یا صفحات دیگر متصل است. ابتدا ارجاعات آن را حذف کنید.',
        { usages: usageResult.usages }
      );
    }

    const deleted = await MediaAssetModel.findByIdAndDelete(mediaId);
    if (!deleted) {
      throw new NotFoundError('رسانه مورد نظر یافت نشد');
    }

    await localMediaStorage.deleteFile(deleted.storageKey);

    await adminAuditService.record({
      actorUserId: actor.objectId,
      actorRole: actor.primaryRole,
      action: 'delete',
      resourceType: 'media_asset',
      resourceId: mediaId,
      result: 'success',
      requestId: ctx.requestId,
      changedFields: ['deleted'],
      changeSummary: `حذف فایل رسانه ${deleted.originalFileName}`,
      ipHash: ctx.ipHash,
      userAgent: ctx.userAgent,
    });

    return {
      deletedId: mediaId,
      storageKey: deleted.storageKey,
    };
  }

  public async findPublicServableByStorageKey(storageKey: string): Promise<MediaAssetRaw | null> {
    return MediaAssetModel.findOne({
      storageKey,
      status: 'ready',
      visibility: 'public',
    }).lean<MediaAssetRaw>();
  }
}

export const adminMediaService = new AdminMediaService();
