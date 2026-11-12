import { ClientSession, Types } from 'mongoose';
import {
  AuditAction,
  AuditResult,
  AdminAuditLogQuery,
} from '@techa/shared';
import {
  AdminAuditLogModel,
  IAdminAuditLogDocument,
} from '../../../models/admin-audit-log.model';
import { isDatabaseConnected } from '../../../core/database/database-status';
import { logger } from '../../../core/logger/logger';

export interface RecordAuditLogInput {
  actorUserId?: Types.ObjectId | string | null;
  actorRole: string;
  action: AuditAction;
  resourceType: string;
  resourceId: string;
  result?: AuditResult;
  requestId: string;
  changedFields?: string[];
  changeSummary: string;
  ipHash?: string | null;
  userAgent?: string | null;
}

const SENSITIVE_FIELD_PATTERNS = [
  'password',
  'passwordHash',
  'token',
  'tokenHash',
  'refreshToken',
  'secret',
  'otp',
  'codeDigest',
  'authorization',
  'cookie',
];

export function redactSensitiveFieldNames(fields: string[] = []): string[] {
  return fields
    .filter((f) => typeof f === 'string' && f.trim().length > 0)
    .filter((f) => {
      const lower = f.toLowerCase();
      return !SENSITIVE_FIELD_PATTERNS.some((s) => lower.includes(s.toLowerCase()));
    })
    .slice(0, 50);
}

export function sanitizeSummaryText(summary: string): string {
  return summary
    .replace(/Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi, 'Bearer [REDACTED]')
    .replace(/(password|secret|token)\s*[:=]\s*\S+/gi, '$1=[REDACTED]')
    .trim()
    .slice(0, 500);
}

export interface AuditLogDto {
  id: string;
  actorUserId: string | null;
  actorRole: string;
  action: AuditAction;
  resourceType: string;
  resourceId: string;
  result: AuditResult;
  requestId: string;
  changedFields: string[];
  changeSummary: string;
  ipHash: string | null;
  userAgent: string | null;
  createdAt: string;
}

export function toAuditLogDto(doc: IAdminAuditLogDocument | any): AuditLogDto {
  return {
    id: doc._id.toString(),
    actorUserId: doc.actorUserId ? doc.actorUserId.toString() : null,
    actorRole: doc.actorRole,
    action: doc.action,
    resourceType: doc.resourceType,
    resourceId: doc.resourceId,
    result: doc.result,
    requestId: doc.requestId,
    changedFields: Array.isArray(doc.changedFields) ? doc.changedFields : [],
    changeSummary: doc.changeSummary || '',
    ipHash: doc.ipHash || null,
    userAgent: doc.userAgent || null,
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
  };
}

export class AdminAuditService {
  public async record(
    input: RecordAuditLogInput,
    session?: ClientSession
  ): Promise<IAdminAuditLogDocument> {
    const actorObjId =
      input.actorUserId && Types.ObjectId.isValid(input.actorUserId.toString())
        ? new Types.ObjectId(input.actorUserId.toString())
        : null;

    const payload = {
      actorUserId: actorObjId,
      actorRole: input.actorRole || 'unknown',
      action: input.action,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      result: input.result || 'success',
      requestId: input.requestId || 'unknown',
      changedFields: redactSensitiveFieldNames(input.changedFields || []),
      changeSummary: sanitizeSummaryText(input.changeSummary || `${input.action} ${input.resourceType}`),
      ipHash: input.ipHash || null,
      userAgent: input.userAgent ? input.userAgent.slice(0, 500) : null,
    };

    if (session) {
      const [created] = await AdminAuditLogModel.create([payload], { session });
      return created;
    }
    return AdminAuditLogModel.create(payload);
  }

  public async recordDeniedSafely(input: Omit<RecordAuditLogInput, 'result'>): Promise<void> {
    try {
      if (!isDatabaseConnected()) {
        return;
      }
      await this.record({ ...input, result: 'denied' });
    } catch (err) {
      logger.warn({ err }, '[AdminAuditService] Failed to persist denied audit log');
    }
  }

  public async queryLogs(query: AdminAuditLogQuery): Promise<{
    items: AuditLogDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const filter: Record<string, unknown> = {};

    if (query.actorUserId) {
      filter.actorUserId = new Types.ObjectId(query.actorUserId);
    }
    if (query.action) {
      filter.action = query.action;
    }
    if (query.resourceType) {
      filter.resourceType = query.resourceType;
    }
    if (query.resourceId) {
      filter.resourceId = query.resourceId;
    }
    if (query.result) {
      filter.result = query.result;
    }
    if (query.from || query.to) {
      const dateRange: Record<string, Date> = {};
      if (query.from) dateRange.$gte = new Date(query.from);
      if (query.to) dateRange.$lte = new Date(query.to);
      filter.createdAt = dateRange;
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;
    const sortDir = query.order === 'asc' ? 1 : -1;

    const [total, docs] = await Promise.all([
      AdminAuditLogModel.countDocuments(filter),
      AdminAuditLogModel.find(filter)
        .sort({ createdAt: sortDir, _id: sortDir })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const totalPages = Math.ceil((total || 0) / limit) || 1;
    return {
      items: (docs || []).map(toAuditLogDto),
      total: total || 0,
      page,
      limit,
      totalPages,
    };
  }
}

export const adminAuditService = new AdminAuditService();
