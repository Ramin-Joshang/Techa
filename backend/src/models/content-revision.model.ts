import mongoose, { Schema, model, Document, Model, Types } from 'mongoose';
import {
  REVISION_RESOURCE_TYPES,
  RevisionResourceType,
} from '@techa/shared';

export interface IContentRevisionDocument extends Document {
  resourceType: RevisionResourceType;
  resourceId: string;
  revisionNumber: number;
  changeSummary: string;
  contentHash: string;
  snapshotJson: string; // Strictly typed stringified JSON, avoids Schema.Types.Mixed
  createdBy?: Types.ObjectId | null;
  createdAt: Date;
}

const ContentRevisionSchema = new Schema<IContentRevisionDocument>(
  {
    resourceType: {
      type: String,
      enum: REVISION_RESOURCE_TYPES,
      required: true,
      index: true,
    },
    resourceId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    revisionNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    changeSummary: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    contentHash: {
      type: String,
      required: true,
      trim: true,
      length: 64,
    },
    snapshotJson: {
      type: String,
      required: true,
      // max 500KB string length constraint
      maxlength: 512000,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
  },
  {
    collection: 'content_revisions',
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Indexes specified by Section 13
ContentRevisionSchema.index(
  { resourceType: 1, resourceId: 1, revisionNumber: 1 },
  { unique: true }
);
ContentRevisionSchema.index({ resourceId: 1, createdAt: -1 });

export const ContentRevisionModel: Model<IContentRevisionDocument> =
  (mongoose.models?.ContentRevision as Model<IContentRevisionDocument>) ||
  model<IContentRevisionDocument>('ContentRevision', ContentRevisionSchema);
