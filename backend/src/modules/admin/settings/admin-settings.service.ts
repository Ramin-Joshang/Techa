import { AdminUpdateSiteSettingsDto } from '@techa/shared';
import { SiteSettingsModel, SiteSettingsRaw } from '../../../models/site-settings.model';
import { ConflictError, NotFoundError } from '../../../core/errors/app-error';
import { AuthenticatedAdminActor } from '../authz/permissions.middleware';
import { adminAuditService } from '../audit/audit.service';
import {
  contentRevisionService,
  withOptionalTransaction,
} from '../revisions/revision.service';
import {
  cacheInvalidationService,
  buildSettingsRevalidationTargets,
} from '../cache/cache-invalidation.service';
import { adminMediaService, RequestAuditContext } from '../media/media.service';

export function toAdminSiteSettingsDto(doc: SiteSettingsRaw | any) {
  return {
    id: doc._id.toString(),
    settingsKey: doc.settingsKey,
    branding: doc.branding,
    header: doc.header,
    footer: doc.footer,
    seo: doc.seo,
    general: doc.general,
    version: doc.version ?? 1,
    updatedBy: doc.updatedBy ? doc.updatedBy.toString() : null,
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
  };
}

export class AdminSettingsService {
  public async getSettings() {
    const doc = await SiteSettingsModel.findOne({ settingsKey: 'global' }).lean<SiteSettingsRaw>();
    if (!doc) {
      throw new NotFoundError('تنظیمات عمومی سایت در پایگاه داده یافت نشد');
    }
    return toAdminSiteSettingsDto(doc);
  }

  public async updateSettings(
    dto: AdminUpdateSiteSettingsDto,
    actor: AuthenticatedAdminActor,
    ctx: RequestAuditContext
  ) {
    const existing = await SiteSettingsModel.findOne({ settingsKey: 'global' });

    if (existing && dto.expectedVersion !== undefined && (existing.version ?? 1) !== dto.expectedVersion) {
      throw new ConflictError('تضاد نسخه هنگام بروزرسانی تنظیمات سایت', {
        currentVersion: existing.version ?? 1,
        expectedVersion: dto.expectedVersion,
      });
    }

    await adminMediaService.assertMediaKeysExist([
      dto.branding?.logoMediaKey,
      dto.branding?.faviconMediaKey,
      dto.branding?.defaultOgImageMediaKey,
    ]);

    const changedFields: string[] = [];
    const updatePayload: Record<string, unknown> = {
      updatedBy: actor.objectId,
    };

    for (const section of ['branding', 'header', 'footer', 'seo', 'general'] as const) {
      if (dto[section] !== undefined) {
        updatePayload[section] = dto[section];
        changedFields.push(section);
      }
    }

    const updated = await withOptionalTransaction(async (session) => {
      let doc;
      if (!existing) {
        const createdArr = session
          ? await SiteSettingsModel.create(
              [
                {
                  settingsKey: 'global',
                  ...updatePayload,
                  version: 1,
                },
              ],
              { session }
            )
          : [
              await SiteSettingsModel.create({
                settingsKey: 'global',
                ...updatePayload,
                version: 1,
              }),
            ];
        doc = createdArr[0];
      } else {
        doc = await SiteSettingsModel.findOneAndUpdate(
          {
            _id: existing._id,
            ...(dto.expectedVersion !== undefined
              ? { $or: [{ version: dto.expectedVersion }, { version: { $exists: false } }] }
              : {}),
          },
          {
            $set: updatePayload,
            $inc: { version: 1 },
          },
          { new: true, runValidators: true, session }
        );
        if (!doc) {
          throw new ConflictError('تنظیمات سایت همزمان توسط مدیر دیگری تغییر کرده است');
        }
      }

      await contentRevisionService.createRevision(
        {
          resourceType: 'site_settings',
          resourceId: doc._id.toString(),
          snapshot: doc.toObject(),
          changeSummary: dto.changeSummary || 'بروزرسانی تنظیمات عمومی سایت',
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
          changedFields,
          changeSummary: dto.changeSummary || 'تغییر تنظیمات عمومی پلتفرم',
          ipHash: ctx.ipHash,
          userAgent: ctx.userAgent,
        },
        session
      );

      return doc;
    });

    await cacheInvalidationService.invalidate(buildSettingsRevalidationTargets());
    return toAdminSiteSettingsDto(updated);
  }
}

export const adminSettingsService = new AdminSettingsService();
