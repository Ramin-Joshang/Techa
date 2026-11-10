import mongoose, { Schema, model, Document, Model, Types } from 'mongoose';
import {
  AUDIT_ACTIONS,
  AUDIT_RESULTS,
  AuditAction,
  AuditResult,
} from '@techa/shared';

export interface IAdminAuditLogDocument extends Document {
  actorUserId?: Types.ObjectId | null;
  actorRole: string;
  action: AuditAction;
  resourceType: string;
  resourceId: string;
  result: AuditResult;
  requestId: string;
  changedFields: string[];
  changeSummary: string;
  ipHash?: string | null;
  userAgent?: string | null;
  createdAt: Date;
}

const AdminAuditLogSchema = new Schema<IAdminAuditLogDocument>(
  {
    actorUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    actorRole: {
      type: String,
      required: true,
      trim: true,
    },
    action: {
      type: String,
      enum: AUDIT_ACTIONS,
      required: true,
      index: true,
    },
    resourceType: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    resourceId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    result: {
      type: String,
      enum: AUDIT_RESULTS,
      required: true,
    },
    requestId: {
      type: String,
      required: true,
      trim: true,
    },
    changedFields: {
      type: [String],
      default: [],
    },
    changeSummary: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
    ipHash: {
      type: String,
      trim: true,
      maxlength: 128,
      default: null,
    },
    userAgent: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
  },
  {
    collection: 'admin_audit_logs',
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Indexes specified by Section 13
AdminAuditLogSchema.index({ actorUserId: 1, createdAt: -1 });
AdminAuditLogSchema.index({ resourceType: 1, resourceId: 1, createdAt: -1 });
AdminAuditLogSchema.index({ createdAt: -1 });

export const AdminAuditLogModel: Model<IAdminAuditLogDocument> =
  (mongoose.models?.AdminAuditLog as Model<IAdminAuditLogDocument>) ||
  model<IAdminAuditLogDocument>('AdminAuditLog', AdminAuditLogSchema);
