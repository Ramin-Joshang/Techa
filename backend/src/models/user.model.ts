import mongoose, { Schema, model, Document, Model } from 'mongoose';
import {
  USER_ROLES,
  ACCOUNT_STATUSES,
  UserRole,
  AccountStatus,
} from '@techa/shared';

export interface IUserDocument extends Document {
  phoneE164: string;
  phoneVerifiedAt?: Date | null;
  firstName?: string | null;
  lastName?: string | null;
  passwordHash?: string | null;
  passwordChangedAt?: Date | null;
  roles: UserRole[];
  status: AccountStatus;
  failedLoginCount: number;
  lockedUntil?: Date | null;
  lastLoginAt?: Date | null;
  lastPasswordResetAt?: Date | null;
  authVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    phoneE164: {
      type: String,
      required: true,
      trim: true,
      match: [/^\+[1-9]\d{1,14}$/, 'Invalid E.164 phone number'],
    },
    phoneVerifiedAt: {
      type: Date,
      default: null,
    },
    firstName: {
      type: String,
      trim: true,
      maxlength: 100,
      default: null,
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: 100,
      default: null,
    },
    passwordHash: {
      type: String,
      default: null,
    },
    passwordChangedAt: {
      type: Date,
      default: null,
    },
    roles: {
      type: [String],
      enum: USER_ROLES,
      default: ['student'],
      required: true,
    },
    status: {
      type: String,
      enum: ACCOUNT_STATUSES,
      default: 'pending_verification',
      required: true,
    },
    failedLoginCount: {
      type: Number,
      default: 0,
      min: 0,
      required: true,
    },
    lockedUntil: {
      type: Date,
      default: null,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    lastPasswordResetAt: {
      type: Date,
      default: null,
    },
    authVersion: {
      type: Number,
      default: 1,
      min: 1,
      required: true,
    },
  },
  {
    collection: 'users',
    timestamps: true,
  }
);

// Indexes specified by Section 13
UserSchema.index({ phoneE164: 1 }, { unique: true });
UserSchema.index({ status: 1, roles: 1 });

export const UserModel: Model<IUserDocument> =
  (mongoose.models?.User as Model<IUserDocument>) ||
  model<IUserDocument>('User', UserSchema);
