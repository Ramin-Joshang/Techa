import mongoose, { Schema, model, Document, Model, Types } from 'mongoose';

export interface IAuthSessionDocument extends Document {
  userId: Types.ObjectId;
  tokenHash: string;
  familyId: string;
  jti: string;
  expiresAt: Date;
  issuedAt: Date;
  lastUsedAt?: Date | null;
  revokedAt?: Date | null;
  revokeReason?: string | null;
  replacedBySessionId?: Types.ObjectId | null;
  ipHash?: string | null;
  userAgent?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const AuthSessionSchema = new Schema<IAuthSessionDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      trim: true,
      length: 64,
    },
    familyId: {
      type: String,
      required: true,
      trim: true,
    },
    jti: {
      type: String,
      required: true,
      trim: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    issuedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    lastUsedAt: {
      type: Date,
      default: null,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
    revokeReason: {
      type: String,
      trim: true,
      maxlength: 255,
      default: null,
    },
    replacedBySessionId: {
      type: Schema.Types.ObjectId,
      ref: 'AuthSession',
      default: null,
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
  },
  {
    collection: 'auth_sessions',
    timestamps: true,
  }
);

// Indexes specified by Section 13
AuthSessionSchema.index({ tokenHash: 1 }, { unique: true });
AuthSessionSchema.index({ userId: 1, expiresAt: 1 });
AuthSessionSchema.index({ familyId: 1 });
AuthSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

export const AuthSessionModel: Model<IAuthSessionDocument> =
  (mongoose.models?.AuthSession as Model<IAuthSessionDocument>) ||
  model<IAuthSessionDocument>('AuthSession', AuthSessionSchema);
