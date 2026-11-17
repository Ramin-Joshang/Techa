import { Readable } from 'node:stream';
import Busboy from 'busboy';
import { Request, Response } from 'express';
import mongoose, { Types } from 'mongoose';
import {
  AdminMediaListQuery,
  AdminMediaOverviewDto,
  AdminUpdateMediaDto,
  AdminUpdateMediaLimitsDto,
  MEDIA_CATEGORIES,
  MEDIA_VISIBILITIES,
  MediaCategory,
  MediaUsageItem,
  MediaVisibility,
  AdminMediaDto,
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
import { localMediaStorage, parseHttpByteRange } from './media-storage.service';
import { mediaGridFsStorage } from './media-gridfs.service';
import { MediaSizeLimitsBytes, getDefaultMediaLimitsBytes } from './media-validation';
import {
  AuthenticatedAdminActor,
  assertOwnershipIfEditorOnly,
} from '../authz/permissions.middleware';
import { adminAuditService } from '../audit/audit.service';
import { contentRevisionService, withOptionalTransaction } from '../revisions/revision.service';

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
  public async getActiveMediaLimits(): Promise<{
    limitsMb: AdminUpdateMediaLimitsDto;
    limitsBytes: MediaSizeLimitsBytes;
  }> {
    const defaults = getDefaultMediaLimitsBytes();
    let maxImageSizeMb = Math.max(1, Math.round(defaults.image / (1024 * 1024)));
    let maxVideoSizeMb = Math.max(5, Math.round(defaults.video / (1024 * 1024)));
    let maxDocumentSizeMb = Math.max(1, Math.round(defaults.document / (1024 * 1024)));

    if (mongoose.connection.readyState === 1) {
      try {
        const settings = await SiteSettingsModel.findOne({ settingsKey: 'global' })
          .select({ media: 1 })
          .lean();
        if (settings?.media) {
          if (typeof settings.media.maxImageSizeMb === 'number' && settings.media.maxImageSizeMb >= 1) {
            maxImageSizeMb = settings.media.maxImageSizeMb;
          }
          if (typeof settings.media.maxVideoSizeMb === 'number' && settings.media.maxVideoSizeMb >= 5) {
            maxVideoSizeMb = settings.media.maxVideoSizeMb;
          }
          if (typeof settings.media.maxDocumentSizeMb === 'number' && settings.media.maxDocumentSizeMb >= 1) {
            maxDocumentSizeMb = settings.media.maxDocumentSizeMb;
          }
        }
      } catch {
        // Fallback to env defaults
      }
    }

    return {
      limitsMb: {
        maxImageSizeMb,
        maxVideoSizeMb,
        maxDocumentSizeMb,
      },
      limitsBytes: {
        image: Math.round(maxImageSizeMb * 1024 * 1024),
        video: Math.round(maxVideoSizeMb * 1024 * 1024),
        document: Math.round(maxDocumentSizeMb * 1024 * 1024),
      },
    };
  }

  public async getMediaOverview(): Promise<AdminMediaOverviewDto> {
    const { limitsMb, limitsBytes } = await this.getActiveMediaLimits();

    const agg = await MediaAssetModel.aggregate<{
      _id: MediaCategory;
      count: number;
      totalBytes: number;
    }>([
      { $match: { status: { $ne: 'archived' } } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalBytes: { $sum: '$sizeBytes' },
        },
      },
    ]);

    const byCategory = new Map<string, { count: number; totalBytes: number }>();
    let totalFiles = 0;
    let totalBytes = 0;

    for (const row of agg || []) {
      const count = Number(row.count || 0);
      const bytes = Number(row.totalBytes || 0);
      byCategory.set(row._id, { count, totalBytes: bytes });
      totalFiles += count;
      totalBytes += bytes;
    }

    const folders = MEDIA_CATEGORIES.map((category) => {
      const stats = byCategory.get(category) || { count: 0, totalBytes: 0 };
      return {
        category,
        folderPath: `media/${category}`,
        count: stats.count,
        totalBytes: stats.totalBytes,
      };
    });

    return {
      limits: {
        ...limitsMb,
        maxImageBytes: limitsBytes.image,
        maxVideoBytes: limitsBytes.video,
        maxDocumentBytes: limitsBytes.document,
      },
      storage: {
        totalFiles,
        totalBytes,
        gridFsPersistentBackup: mediaGridFsStorage.isAvailable(),
        gitTrackedPath: 'backend/storage/media',
        folders,
      },
    };
  }

  public async updateMediaLimits(
    dto: AdminUpdateMediaLimitsDto,
    actor: AuthenticatedAdminActor,
    ctx: RequestAuditContext
  ): Promise<AdminMediaOverviewDto> {
    const updatedDoc = await withOptionalTransaction(async (session) => {
      const existing = await SiteSettingsModel.findOne({ settingsKey: 'global' }).session(session ?? null);
      let doc;
      if (!existing) {
        const createdArr = session
          ? await SiteSettingsModel.create(
              [
                {
                  settingsKey: 'global',
                  media: dto,
                  updatedBy: actor.objectId,
                  version: 1,
                },
              ],
              { session }
            )
          : [
              await SiteSettingsModel.create({
                settingsKey: 'global',
                media: dto,
                updatedBy: actor.objectId,
                version: 1,
              }),
            ];
        doc = createdArr[0];
      } else {
        doc = await SiteSettingsModel.findOneAndUpdate(
          { _id: existing._id },
          {
            $set: {
              media: dto,
              updatedBy: actor.objectId,
            },
            $inc: { version: 1 },
          },
          { returnDocument: 'after', runValidators: true, session }
        );
      }

      if (doc) {
        await contentRevisionService.createRevision(
          {
            resourceType: 'site_settings',
            resourceId: doc._id.toString(),
            snapshot: doc.toObject(),
            changeSummary: `تغییر سقف حجم آپلود رسانه (تصویر ${dto.maxImageSizeMb}MB، ویدیو ${dto.maxVideoSizeMb}MB، سند ${dto.maxDocumentSizeMb}MB)`,
            createdBy: actor.objectId,
          },
          session
        );

        await adminAuditService.record(
          {
            actorUserId: actor.objectId,
            actorRole: actor.primaryRole,
            action: 'settings_update',
            resourceType: 'site_settings',
            resourceId: doc._id.toString(),
            result: 'success',
            requestId: ctx.requestId,
            changedFields: ['media'],
            changeSummary: `بروزرسانی سقف مجاز آپلود رسانه‌ها`,
            ipHash: ctx.ipHash,
            userAgent: ctx.userAgent,
          },
          session
        );
      }
      return doc;
    });

    if (!updatedDoc) {
      throw new NotFoundError('تنظیمات سایت برای ذخیره سقف حجم یافت نشد');
    }

    return this.getMediaOverview();
  }

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

    const { limitsBytes } = await this.getActiveMediaLimits();

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
        const preCategory = (fields.category || 'site_asset').trim() as MediaCategory;
        const initialCategory: MediaCategory = MEDIA_CATEGORIES.includes(preCategory)
          ? preCategory
          : 'site_asset';

        filePromise = localMediaStorage.storeFromStream({
          fileStream,
          originalFileName: info.filename || 'upload',
          claimedMimeType: info.mimeType || 'application/octet-stream',
          category: initialCategory,
          limits: limitsBytes,
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

          // Ensure file resides inside its exact category subfolder even if category field followed the file
          const finalStorageKey = await localMediaStorage.relocateToCategoryFolder({
            currentStorageKey: stored.storageKey,
            targetCategory: rawCategory,
            safeFilename: stored.safeFilename,
          });
          stored.storageKey = finalStorageKey;

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
      // Persist binary copy in MongoDB GridFS so media survives container restarts/deployments
      const savedDiskPath = localMediaStorage.resolveSafePath(parsedUpload.stored.storageKey);
      await mediaGridFsStorage.saveFromFile({
        storageKey: parsedUpload.stored.storageKey,
        filePath: savedDiskPath,
        metadata: {
          mimeType: parsedUpload.stored.mimeType,
          mediaType: parsedUpload.stored.mediaType,
          category: parsedUpload.category,
          checksumSha256: parsedUpload.stored.checksumSha256,
        },
      });

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
      await mediaGridFsStorage.deleteByStorageKey(parsedUpload.stored.storageKey);
      throw err;
    }
  }

  /**
   * Opens a stream for public/admin serving. If local disk file was wiped
   * (e.g. container restart), automatically recovers from MongoDB GridFS and
   * re-hydrates the disk cache seamlessly.
   */
  public async openMediaForServing(
    storageKey: string,
    range?: { start: number; end: number }
  ): Promise<{ stream: Readable; sizeBytes: number } | null> {
    if (await localMediaStorage.exists(storageKey)) {
      return localMediaStorage.openReadStreamSafe(storageKey, range);
    }

    // Attempt transparent recovery from MongoDB GridFS
    const diskPath = localMediaStorage.resolveSafePath(storageKey);
    const restored = await mediaGridFsStorage.restoreToDisk(storageKey, diskPath);
    if (restored && (await localMediaStorage.exists(storageKey))) {
      return localMediaStorage.openReadStreamSafe(storageKey, range);
    }

    // Fallback: stream directly from GridFS if disk write is unavailable
    return mediaGridFsStorage.openDownloadStream(storageKey, range);
  }

  public async getMediaTotalSize(storageKey: string): Promise<number | null> {
    if (await localMediaStorage.exists(storageKey)) {
      const opened = await localMediaStorage.openReadStreamSafe(storageKey);
      opened.stream.destroy();
      return opened.sizeBytes;
    }

    const record = await mediaGridFsStorage.findFileRecord(storageKey);
    return record ? record.length : null;
  }

  public async serveMediaStream(params: {
    req: Request;
    res: Response;
    media: {
      storageKey: string;
      mimeType: string;
      mediaType: string;
      originalFileName: string;
    };
    cacheControl?: string;
    notFoundMessage?: string;
  }): Promise<void> {
    const { req, res, media, cacheControl, notFoundMessage } = params;
    const totalSize = await this.getMediaTotalSize(media.storageKey);
    if (totalSize === null) {
      throw new NotFoundError(notFoundMessage || 'فایل رسانه در مخزن موجود نیست');
    }

    const disposition = media.mediaType === 'document' ? 'attachment' : 'inline';
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Type', media.mimeType);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (cacheControl) {
      res.setHeader('Cache-Control', cacheControl);
    }
    res.setHeader(
      'Content-Disposition',
      `${disposition}; filename="${encodeURIComponent(media.originalFileName)}"`
    );

    const parsedRange = parseHttpByteRange(req.headers.range, totalSize);
    if (parsedRange?.kind === 'unsatisfiable') {
      res.setHeader('Content-Range', `bytes */${totalSize}`);
      res.status(416).end();
      return;
    }

    const activeRange =
      parsedRange?.kind === 'range'
        ? { start: parsedRange.start, end: parsedRange.end }
        : undefined;

    const opened = await this.openMediaForServing(media.storageKey, activeRange);
    if (!opened) {
      throw new NotFoundError(notFoundMessage || 'فایل رسانه در مخزن موجود نیست');
    }

    if (activeRange) {
      const chunkLen = activeRange.end - activeRange.start + 1;
      res.status(206);
      res.setHeader('Content-Range', `bytes ${activeRange.start}-${activeRange.end}/${totalSize}`);
      res.setHeader('Content-Length', String(chunkLen));
    } else {
      res.status(200);
      res.setHeader('Content-Length', String(opened.sizeBytes));
    }

    opened.stream.on('error', () => {
      if (!res.headersSent) {
        res.status(500).end();
      } else {
        res.destroy();
      }
    });

    res.on('close', () => {
      if (!opened.stream.destroyed) {
        opened.stream.destroy();
      }
    });

    opened.stream.pipe(res);
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
    if (!Types.ObjectId.isValid(mediaId)) {
      throw new NotFoundError('رسانه مورد نظر یافت نشد');
    }
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

    try {
      await localMediaStorage.deleteFile(deleted.storageKey);
    } catch {
      // Do not fail DB deletion if orphaned disk file cannot be unlinked
    }

    await mediaGridFsStorage.deleteByStorageKey(deleted.storageKey);

    await adminAuditService.record({
      actorUserId: actor.objectId,
      actorRole: actor.primaryRole,
      action: 'delete',
      resourceType: 'media_asset',
      resourceId: mediaId,
      result: 'success',
      requestId: ctx.requestId,
      changedFields: ['deleted'],
      changeSummary: `حذف فایل رسانه ${deleted.originalFileName || deleted.storageKey}`,
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
