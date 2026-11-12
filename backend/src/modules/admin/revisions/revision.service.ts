import crypto from 'node:crypto';
import mongoose, { ClientSession, Types } from 'mongoose';
import { RevisionResourceType } from '@techa/shared';
import {
  ContentRevisionModel,
  IContentRevisionDocument,
} from '../../../models/content-revision.model';
import { NotFoundError } from '../../../core/errors/app-error';

export interface CreateRevisionInput {
  resourceType: RevisionResourceType;
  resourceId: string;
  snapshot: object;
  changeSummary: string;
  createdBy?: Types.ObjectId | string | null;
}

export interface ContentRevisionDto {
  id: string;
  resourceType: RevisionResourceType;
  resourceId: string;
  revisionNumber: number;
  changeSummary: string;
  contentHash: string;
  snapshot: Record<string, unknown>;
  createdBy: string | null;
  createdAt: string;
}

const SENSITIVE_SNAPSHOT_KEYS = new Set([
  'passwordHash',
  'tokenHash',
  'codeDigest',
  '__v',
]);

export function sanitizeSnapshotObject(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== 'object') {
    return {};
  }
  const plain =
    typeof (input as { toObject?: () => unknown }).toObject === 'function'
      ? ((input as { toObject: () => Record<string, unknown> }).toObject())
      : (input as Record<string, unknown>);

  const clean: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(plain)) {
    if (SENSITIVE_SNAPSHOT_KEYS.has(k)) continue;
    clean[k] = v;
  }
  return clean;
}

export function computeCanonicalHash(snapshotJson: string): string {
  return crypto.createHash('sha256').update(snapshotJson, 'utf8').digest('hex');
}

export function toContentRevisionDto(
  doc: IContentRevisionDocument | any,
  includeSnapshot = true
): ContentRevisionDto {
  let parsedSnapshot: Record<string, unknown> = {};
  if (includeSnapshot && typeof doc.snapshotJson === 'string') {
    try {
      parsedSnapshot = JSON.parse(doc.snapshotJson);
    } catch {
      parsedSnapshot = {};
    }
  }
  return {
    id: doc._id.toString(),
    resourceType: doc.resourceType,
    resourceId: doc.resourceId,
    revisionNumber: doc.revisionNumber,
    changeSummary: doc.changeSummary || '',
    contentHash: doc.contentHash,
    snapshot: parsedSnapshot,
    createdBy: doc.createdBy ? doc.createdBy.toString() : null,
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
  };
}

/**
 * Runs an operation inside a MongoDB transaction when running on a replica set / mongos,
 * and gracefully executes directly without crashing on standalone MongoDB instances or unit mocks.
 */
export async function withOptionalTransaction<T>(
  fn: (session?: ClientSession) => Promise<T>
): Promise<T> {
  if (typeof mongoose.startSession !== 'function' || mongoose.connection.readyState !== 1) {
    return fn(undefined);
  }

  const session = await mongoose.startSession();
  try {
    let result!: T;
    await session.withTransaction(async () => {
      result = await fn(session);
    });
    return result;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '';
    // MongoDB standalone error code 20 / IllegalOperation: Transaction numbers are only allowed on a replica set member or mongos
    if (
      msg.includes('Transaction numbers are only allowed on a replica set') ||
      msg.includes('sessions are not supported')
    ) {
      return fn(undefined);
    }
    throw err;
  } finally {
    await session.endSession();
  }
}

export class ContentRevisionService {
  public async createRevision(
    input: CreateRevisionInput,
    session?: ClientSession
  ): Promise<IContentRevisionDocument> {
    const latestQuery = ContentRevisionModel.findOne({
      resourceType: input.resourceType,
      resourceId: input.resourceId,
    })
      .sort({ revisionNumber: -1 })
      .select({ revisionNumber: 1 });

    if (session) {
      latestQuery.session(session);
    }

    const latest = await latestQuery.lean();
    const nextRevisionNumber = (latest?.revisionNumber ?? 0) + 1;

    const cleanSnapshot = sanitizeSnapshotObject(input.snapshot);
    const snapshotJson = JSON.stringify(cleanSnapshot);
    const contentHash = computeCanonicalHash(snapshotJson);

    const createdById =
      input.createdBy && Types.ObjectId.isValid(input.createdBy.toString())
        ? new Types.ObjectId(input.createdBy.toString())
        : null;

    const payload = {
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      revisionNumber: nextRevisionNumber,
      changeSummary: (input.changeSummary || `Revision #${nextRevisionNumber}`).slice(0, 500),
      contentHash,
      snapshotJson,
      createdBy: createdById,
    };

    if (session) {
      const [created] = await ContentRevisionModel.create([payload], { session });
      return created;
    }

    return ContentRevisionModel.create(payload);
  }

  public async listRevisions(
    resourceType: RevisionResourceType,
    resourceId: string,
    page = 1,
    limit = 20
  ) {
    const filter = { resourceType, resourceId };
    const skip = (page - 1) * limit;

    const [total, docs] = await Promise.all([
      ContentRevisionModel.countDocuments(filter),
      ContentRevisionModel.find(filter)
        .sort({ revisionNumber: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    return {
      items: (docs || []).map((d) => toContentRevisionDto(d, true)),
      total: total || 0,
      page,
      limit,
      totalPages: Math.ceil((total || 0) / limit) || 1,
    };
  }

  public async listAllRevisions(params: {
    resourceType?: RevisionResourceType;
    resourceId?: string;
    q?: string;
    page?: number;
    limit?: number;
  }) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const filter: Record<string, unknown> = {};
    if (params.resourceType) {
      filter.resourceType = params.resourceType;
    }
    if (params.resourceId) {
      filter.resourceId = params.resourceId;
    }
    if (params.q) {
      const escaped = params.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { changeSummary: { $regex: escaped, $options: 'i' } },
        { resourceId: { $regex: escaped, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [total, docs] = await Promise.all([
      ContentRevisionModel.countDocuments(filter),
      ContentRevisionModel.find(filter)
        .sort({ createdAt: -1, revisionNumber: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    return {
      items: (docs || []).map((d) => toContentRevisionDto(d, true)),
      total: total || 0,
      page,
      limit,
      totalPages: Math.ceil((total || 0) / limit) || 1,
    };
  }

  public async getRevisionById(revisionId: string): Promise<ContentRevisionDto> {
    if (!Types.ObjectId.isValid(revisionId)) {
      throw new NotFoundError('نسخه مورد نظر یافت نشد');
    }
    const doc = await ContentRevisionModel.findById(revisionId).lean();
    if (!doc) {
      throw new NotFoundError('نسخه مورد نظر یافت نشد');
    }
    return toContentRevisionDto(doc, true);
  }
}

export const contentRevisionService = new ContentRevisionService();
