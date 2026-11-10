import mongoose, { Schema, model, Document, Model, Types } from 'mongoose';
import {
  OTP_PURPOSES,
  OTP_STATUSES,
  OtpPurpose,
  OtpStatus,
} from '@techa/shared';

export interface IOtpChallengeDocument extends Document {
  phoneE164: string;
  userId?: Types.ObjectId | null;
  purpose: OtpPurpose;
  codeDigest: string;
  digestKeyVersion: number;
  provider: string;
  providerMessageId?: string | null;
  status: OtpStatus;
  attemptCount: number;
  maxAttempts: number;
  expiresAt: Date;
  sentAt: Date;
  consumedAt?: Date | null;
  resendAvailableAt?: Date | null;
  invalidatedAt?: Date | null;
  ipHash?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const OtpChallengeSchema = new Schema<IOtpChallengeDocument>(
  {
    phoneE164: {
      type: String,
      required: true,
      trim: true,
      match: [/^\+[1-9]\d{1,14}$/, 'Invalid E.164 phone number'],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    purpose: {
      type: String,
      enum: OTP_PURPOSES,
      required: true,
    },
    codeDigest: {
      type: String,
      required: true,
      trim: true,
      length: 64,
    },
    digestKeyVersion: {
      type: Number,
      default: 1,
      min: 1,
      required: true,
    },
    provider: {
      type: String,
      default: 'kavenegar',
      trim: true,
      required: true,
    },
    providerMessageId: {
      type: String,
      trim: true,
      default: null,
    },
    status: {
      type: String,
      enum: OTP_STATUSES,
      default: 'pending',
      required: true,
    },
    attemptCount: {
      type: Number,
      default: 0,
      min: 0,
      required: true,
    },
    maxAttempts: {
      type: Number,
      default: 5,
      min: 1,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    sentAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    consumedAt: {
      type: Date,
      default: null,
    },
    resendAvailableAt: {
      type: Date,
      default: null,
    },
    invalidatedAt: {
      type: Date,
      default: null,
    },
    ipHash: {
      type: String,
      trim: true,
      maxlength: 128,
      default: null,
    },
  },
  {
    collection: 'otp_challenges',
    timestamps: true,
  }
);

// Indexes specified by Section 13
OtpChallengeSchema.index({ phoneE164: 1, purpose: 1, status: 1, createdAt: -1 });
OtpChallengeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

export const OtpChallengeModel: Model<IOtpChallengeDocument> =
  (mongoose.models?.OtpChallenge as Model<IOtpChallengeDocument>) ||
  model<IOtpChallengeDocument>('OtpChallenge', OtpChallengeSchema);
