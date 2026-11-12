import { Types } from 'mongoose';
import {
  AdminSitePageListQuery,
  AdminCreateSitePageDto,
  AdminUpdateSitePageDto,
  AdminSitePageDto,
  ContentBlock,
  PublishedSeoMetadataSchema,
} from '@techa/shared';
import { SitePageModel, SitePageRaw } from '../../../models/site-page.model';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '../../../core/errors/app-error';
import { escapeRegex } from '../../../core/utils/regex';
import { AuthenticatedAdminActor } from '../authz/permissions.middleware';
import { adminAuditService } from '../audit/audit.service';
import {
  contentRevisionService,
  withOptionalTransaction,
} from '../revisions/revision.service';
import {
  cacheInvalidationService,
  buildPageRevalidationTargets,
} from '../cache/cache-invalidation.service';
import { adminMediaService, RequestAuditContext } from '../media/media.service';
import { extractMediaKeysFromContentBlocks } from '../lessons/admin-lessons.service';

export function toAdminSitePageDto(doc: SitePageRaw | any): AdminSitePageDto {
  return {
    id: doc._id.toString(),
    pageKey: doc.pageKey,
    title: doc.title,
    heroSection: doc.heroSection,
    features: doc.features,
    contentBlocks: doc.contentBlocks || [],
    seo: doc.seo,
    status: doc.status || 'draft',
    version: doc.version ?? 1,
    publishedAt: doc.publishedAt ? new Date(doc.publishedAt).toISOString() : null,
    archivedAt: doc.archivedAt ? new Date(doc.archivedAt).toISOString() : null,
    createdBy: doc.createdBy ? doc.createdBy.toString() : null,
    updatedBy: doc.updatedBy ? doc.updatedBy.toString() : null,
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
  };
}

export class AdminPagesService {
  public async listPages(query: AdminSitePageListQuery) {
    const filter: Record<string, unknown> = {};
    if (query.status) filter.status = query.status;
    if (query.q) {
      const regex = new RegExp(escapeRegex(query.q.trim()), 'i');
      filter.$or = [{ title: { $regex: regex } }, { pageKey: { $regex: regex } }];
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;
    const sortDir = query.order === 'asc' ? 1 : -1;
    const sortField = query.sort || 'updatedAt';

    const [total, docs] = await Promise.all([
      SitePageModel.countDocuments(filter),
      SitePageModel.find(filter)
        .sort({ [sortField]: sortDir, _id: 1 })
        .skip(skip)
        .limit(limit)
        .lean<SitePageRaw[]>(),
    ]);

    return {
      items: (docs || []).map(toAdminSitePageDto),
      total: total || 0,
      page,
      limit,
      totalPages: Math.ceil((total || 0) / limit) || 1,
    };
  }

  public async getPageById(pageId: string): Promise<AdminSitePageDto> {
    if (!Types.ObjectId.isValid(pageId)) {
      throw new NotFoundError('صفحه مورد نظر یافت نشد');
    }
    const doc = await SitePageModel.findById(pageId).lean<SitePageRaw>();
    if (!doc) {
      throw new NotFoundError('صفحه مورد نظر یافت نشد');
    }
    return toAdminSitePageDto(doc);
  }

  public async createPage(
    dto: AdminCreateSitePageDto,
    actor: AuthenticatedAdminActor,
    ctx: RequestAuditContext
  ): Promise<AdminSitePageDto> {
    const exists = await SitePageModel.findOne({ pageKey: dto.pageKey }).select({ _id: 1 }).lean();
    if (exists) {
      throw new ConflictError(`صفحه‌ای با شناسه "${dto.pageKey}" از قبل وجود دارد`);
    }

    await adminMediaService.assertMediaKeysExist([
      ...extractMediaKeysFromContentBlocks((dto.contentBlocks || []) as ContentBlock[]),
      dto.seo.ogImageStorageKey,
    ]);

    const created = await withOptionalTransaction(async (session) => {
      const payload = {
        pageKey: dto.pageKey,
        title: dto.title,
        heroSection: dto.heroSection,
        features: dto.features,
        contentBlocks: dto.contentBlocks || [],
        seo: dto.seo,
        status: 'draft' as const,
        version: 1,
        createdBy: actor.objectId,
        updatedBy: actor.objectId,
      };

      const [doc] = session
        ? await SitePageModel.create([payload], { session })
        : [await SitePageModel.create(payload)];

      await contentRevisionService.createRevision(
        {
          resourceType: 'site_page',
          resourceId: doc._id.toString(),
          snapshot: doc.toObject(),
          changeSummary: dto.changeSummary || `ایجاد صفحه "${doc.title}"`,
          createdBy: actor.objectId,
        },
        session
      );

      await adminAuditService.record(
        {
          actorUserId: actor.objectId,
          actorRole: actor.primaryRole,
          action: 'create',
          resourceType: 'site_page',
          resourceId: doc._id.toString(),
          result: 'success',
          requestId: ctx.requestId,
          changedFields: ['pageKey', 'title', 'seo'],
          changeSummary: dto.changeSummary || `ایجاد صفحه "${doc.title}"`,
          ipHash: ctx.ipHash,
          userAgent: ctx.userAgent,
        },
        session
      );
      return doc;
    });

    return toAdminSitePageDto(created);
  }

  public async updatePage(
    pageId: string,
    dto: AdminUpdateSitePageDto,
    actor: AuthenticatedAdminActor,
    ctx: RequestAuditContext
  ): Promise<AdminSitePageDto> {
    const existing = await SitePageModel.findById(pageId);
    if (!existing) {
      throw new NotFoundError('صفحه مورد نظر یافت نشد');
    }

    if ((existing.version ?? 1) !== dto.expectedVersion) {
      throw new ConflictError('تضاد نسخه هنگام ویرایش صفحه', {
        currentVersion: existing.version ?? 1,
        expectedVersion: dto.expectedVersion,
      });
    }

    await adminMediaService.assertMediaKeysExist([
      ...(dto.contentBlocks
        ? extractMediaKeysFromContentBlocks(dto.contentBlocks as ContentBlock[])
        : []),
      dto.seo?.ogImageStorageKey,
    ]);

    if (existing.status === 'published' && dto.seo) {
      const seoCheck = PublishedSeoMetadataSchema.safeParse(dto.seo);
      if (!seoCheck.success) {
        throw new BadRequestError(
          `تنظیمات SEO صفحه منتشرشده نامعتبر است: ${seoCheck.error.issues.map((i) => i.message).join(', ')}`
        );
      }
    }

    const updateSet: Record<string, unknown> = { updatedBy: actor.objectId };
    const changedFields: string[] = [];
    for (const field of ['title', 'heroSection', 'features', 'contentBlocks', 'seo'] as const) {
      if (dto[field] !== undefined) {
        updateSet[field] = dto[field];
        changedFields.push(field);
      }
    }

    const updated = await withOptionalTransaction(async (session) => {
      const doc = await SitePageModel.findOneAndUpdate(
        {
          _id: existing._id,
          $or: [{ version: dto.expectedVersion }, { version: { $exists: false } }],
        },
        {
          $set: updateSet,
          $inc: { version: 1 },
        },
        { new: true, runValidators: true, session }
      );
      if (!doc) throw new ConflictError('صفحه همزمان تغییر کرده است');

      await contentRevisionService.createRevision(
        {
          resourceType: 'site_page',
          resourceId: doc._id.toString(),
          snapshot: doc.toObject(),
          changeSummary: dto.changeSummary || 'بروزرسانی صفحه',
          createdBy: actor.objectId,
        },
        session
      );

      await adminAuditService.record(
        {
          actorUserId: actor.objectId,
          actorRole: actor.primaryRole,
          action: 'update',
          resourceType: 'site_page',
          resourceId: doc._id.toString(),
          result: 'success',
          requestId: ctx.requestId,
          changedFields,
          changeSummary: dto.changeSummary || `ویرایش صفحه "${doc.title}"`,
          ipHash: ctx.ipHash,
          userAgent: ctx.userAgent,
        },
        session
      );

      return doc;
    });

    if (updated.status === 'published') {
      await cacheInvalidationService.invalidate(buildPageRevalidationTargets(updated.pageKey));
    }
    return toAdminSitePageDto(updated);
  }

  public async publishPage(
    pageId: string,
    actor: AuthenticatedAdminActor,
    ctx: RequestAuditContext,
    expectedVersion?: number,
    changeSummary?: string
  ): Promise<AdminSitePageDto> {
    const existing = await SitePageModel.findById(pageId);
    if (!existing) {
      throw new NotFoundError('صفحه مورد نظر یافت نشد');
    }
    if (expectedVersion !== undefined && (existing.version ?? 1) !== expectedVersion) {
      throw new ConflictError('تضاد نسخه هنگام انتشار صفحه');
    }

    const seoValidation = PublishedSeoMetadataSchema.safeParse(existing.seo);
    if (!seoValidation.success) {
      throw new BadRequestError(
        `متادیتای SEO صفحه برای انتشار کامل نیست: ${seoValidation.error.issues.map((i) => i.message).join(', ')}`
      );
    }

    if (existing.pageKey === 'home' && (!existing.heroSection || !existing.features?.length)) {
      throw new BadRequestError('صفحه اصلی باید دارای بخش Hero و حداقل یک ویژگی باشد');
    }

    const now = new Date();
    const updated = await withOptionalTransaction(async (session) => {
      const doc = await SitePageModel.findOneAndUpdate(
        {
          _id: existing._id,
          ...(expectedVersion !== undefined ? { version: expectedVersion } : {}),
        },
        {
          $set: {
            status: 'published',
            publishedAt: existing.publishedAt || now,
            archivedAt: null,
            updatedBy: actor.objectId,
          },
          $inc: { version: 1 },
        },
        { new: true, session }
      );
      if (!doc) throw new ConflictError('صفحه همزمان تغییر کرده است');

      await contentRevisionService.createRevision(
        {
          resourceType: 'site_page',
          resourceId: doc._id.toString(),
          snapshot: doc.toObject(),
          changeSummary: changeSummary || 'انتشار صفحه',
          createdBy: actor.objectId,
        },
        session
      );

      await adminAuditService.record(
        {
          actorUserId: actor.objectId,
          actorRole: actor.primaryRole,
          action: 'publish',
          resourceType: 'site_page',
          resourceId: doc._id.toString(),
          result: 'success',
          requestId: ctx.requestId,
          changedFields: ['status', 'publishedAt'],
          changeSummary: changeSummary || `انتشار صفحه "${doc.title}"`,
          ipHash: ctx.ipHash,
          userAgent: ctx.userAgent,
        },
        session
      );
      return doc;
    });

    await cacheInvalidationService.invalidate(buildPageRevalidationTargets(updated.pageKey));
    return toAdminSitePageDto(updated);
  }

  public async unpublishPage(
    pageId: string,
    actor: AuthenticatedAdminActor,
    ctx: RequestAuditContext,
    expectedVersion?: number,
    changeSummary?: string
  ): Promise<AdminSitePageDto> {
    const existing = await SitePageModel.findById(pageId);
    if (!existing) {
      throw new NotFoundError('صفحه مورد نظر یافت نشد');
    }
    if (expectedVersion !== undefined && (existing.version ?? 1) !== expectedVersion) {
      throw new ConflictError('تضاد نسخه هنگام خروج صفحه از انتشار');
    }

    const updated = await withOptionalTransaction(async (session) => {
      const doc = await SitePageModel.findOneAndUpdate(
        {
          _id: existing._id,
          ...(expectedVersion !== undefined ? { version: expectedVersion } : {}),
        },
        {
          $set: { status: 'draft', updatedBy: actor.objectId },
          $inc: { version: 1 },
        },
        { new: true, session }
      );
      if (!doc) throw new ConflictError('صفحه همزمان تغییر کرده است');

      await contentRevisionService.createRevision(
        {
          resourceType: 'site_page',
          resourceId: doc._id.toString(),
          snapshot: doc.toObject(),
          changeSummary: changeSummary || 'تبدیل صفحه به پیش‌نویس',
          createdBy: actor.objectId,
        },
        session
      );

      await adminAuditService.record(
        {
          actorUserId: actor.objectId,
          actorRole: actor.primaryRole,
          action: 'unpublish',
          resourceType: 'site_page',
          resourceId: doc._id.toString(),
          result: 'success',
          requestId: ctx.requestId,
          changedFields: ['status'],
          changeSummary: changeSummary || `خروج صفحه "${doc.title}" از انتشار`,
          ipHash: ctx.ipHash,
          userAgent: ctx.userAgent,
        },
        session
      );
      return doc;
    });

    await cacheInvalidationService.invalidate(buildPageRevalidationTargets(updated.pageKey));
    return toAdminSitePageDto(updated);
  }

  public async archivePage(
    pageId: string,
    actor: AuthenticatedAdminActor,
    ctx: RequestAuditContext,
    expectedVersion?: number,
    changeSummary?: string
  ): Promise<AdminSitePageDto> {
    const existing = await SitePageModel.findById(pageId);
    if (!existing) {
      throw new NotFoundError('صفحه مورد نظر یافت نشد');
    }
    if (expectedVersion !== undefined && (existing.version ?? 1) !== expectedVersion) {
      throw new ConflictError('تضاد نسخه هنگام بایگانی صفحه');
    }

    const updated = await withOptionalTransaction(async (session) => {
      const doc = await SitePageModel.findOneAndUpdate(
        {
          _id: existing._id,
          ...(expectedVersion !== undefined ? { version: expectedVersion } : {}),
        },
        {
          $set: { status: 'archived', archivedAt: new Date(), updatedBy: actor.objectId },
          $inc: { version: 1 },
        },
        { new: true, session }
      );
      if (!doc) throw new ConflictError('صفحه همزمان تغییر کرده است');

      await contentRevisionService.createRevision(
        {
          resourceType: 'site_page',
          resourceId: doc._id.toString(),
          snapshot: doc.toObject(),
          changeSummary: changeSummary || 'بایگانی صفحه',
          createdBy: actor.objectId,
        },
        session
      );

      await adminAuditService.record(
        {
          actorUserId: actor.objectId,
          actorRole: actor.primaryRole,
          action: 'archive',
          resourceType: 'site_page',
          resourceId: doc._id.toString(),
          result: 'success',
          requestId: ctx.requestId,
          changedFields: ['status', 'archivedAt'],
          changeSummary: changeSummary || `بایگانی صفحه "${doc.title}"`,
          ipHash: ctx.ipHash,
          userAgent: ctx.userAgent,
        },
        session
      );
      return doc;
    });

    await cacheInvalidationService.invalidate(buildPageRevalidationTargets(updated.pageKey));
    return toAdminSitePageDto(updated);
  }
}

export const adminPagesService = new AdminPagesService();
