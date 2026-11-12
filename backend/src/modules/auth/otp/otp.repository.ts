import { Types } from 'mongoose';
import { OtpChallengeModel, IOtpChallengeDocument } from '../../../models/otp-challenge.model';
import { OtpPurpose, OtpStatus } from '@techa/shared';

export interface CreateChallengeData {
  challengeId: string;
  phoneE164: string;
  userId?: Types.ObjectId | null;
  purpose: OtpPurpose;
  codeDigest: string;
  digestKeyVersion?: number;
  provider?: string;
  maxAttempts?: number;
  expiresAt: Date;
  resendAvailableAt: Date;
  ipHash?: string | null;
}

export class OtpChallengeRepository {
  async createChallenge(data: CreateChallengeData): Promise<IOtpChallengeDocument> {
    return OtpChallengeModel.create({
      challengeId: data.challengeId,
      phoneE164: data.phoneE164,
      userId: data.userId || null,
      purpose: data.purpose,
      codeDigest: data.codeDigest,
      digestKeyVersion: data.digestKeyVersion || 1,
      provider: data.provider || 'kavenegar',
      status: 'pending',
      deliveryStatus: 'pending',
      attemptCount: 0,
      maxAttempts: data.maxAttempts || 5,
      expiresAt: data.expiresAt,
      sentAt: new Date(),
      resendAvailableAt: data.resendAvailableAt,
      consumedAt: null,
      invalidatedAt: null,
      ipHash: data.ipHash || null,
    }) as unknown as Promise<IOtpChallengeDocument>;
  }

  async findChallengeById(challengeId: string): Promise<IOtpChallengeDocument | null> {
    return OtpChallengeModel.findOne({ challengeId }) as unknown as Promise<IOtpChallengeDocument | null>;
  }

  async findLatestByPhoneAndPurpose(
    phoneE164: string,
    purpose: OtpPurpose
  ): Promise<IOtpChallengeDocument | null> {
    return OtpChallengeModel.findOne({ phoneE164, purpose })
      .sort({ createdAt: -1 }) as unknown as Promise<IOtpChallengeDocument | null>;
  }

  async invalidatePreviousChallenges(phoneE164: string, purpose: OtpPurpose): Promise<number> {
    const res = await (OtpChallengeModel as any).updateMany(
      {
        phoneE164,
        purpose,
        status: { $in: ['pending', 'active'] },
      },
      {
        $set: {
          status: 'superseded',
          invalidatedAt: new Date(),
        },
      }
    );
    return res.modifiedCount || 0;
  }

  async countSendsForPhoneInPastHour(phoneE164: string): Promise<number> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return OtpChallengeModel.countDocuments({
      phoneE164,
      createdAt: { $gte: oneHourAgo },
    }) as unknown as Promise<number>;
  }

  async countSendsForIpInPastHour(ipHash: string): Promise<number> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return OtpChallengeModel.countDocuments({
      ipHash,
      createdAt: { $gte: oneHourAgo },
    }) as unknown as Promise<number>;
  }

  async updateDeliveryStatus(
    challengeId: string,
    deliveryStatus: 'accepted' | 'failed',
    providerMessageId?: string | null
  ): Promise<IOtpChallengeDocument | null> {
    return OtpChallengeModel.findOneAndUpdate(
      { challengeId },
      {
        $set: {
          deliveryStatus,
          status: deliveryStatus === 'accepted' ? 'active' : 'delivery_failed',
          providerMessageId: providerMessageId || null,
        },
      },
      { returnDocument: 'after' }
    ) as unknown as Promise<IOtpChallengeDocument | null>;
  }

  async incrementAttemptCount(
    challengeId: string,
    maxAttempts: number = 5
  ): Promise<IOtpChallengeDocument | null> {
    const doc = await OtpChallengeModel.findOneAndUpdate(
      { challengeId },
      { $inc: { attemptCount: 1 } },
      { returnDocument: 'after' }
    );

    if (doc && doc.attemptCount >= maxAttempts) {
      doc.status = 'locked';
      await doc.save();
    }

    return doc as unknown as IOtpChallengeDocument | null;
  }

  /**
   * Atomic consumption of challenge.
   * Guarantees single-use across concurrent requests.
   */
  async consumeChallenge(challengeId: string): Promise<IOtpChallengeDocument | null> {
    return (OtpChallengeModel as any).findOneAndUpdate(
      {
        challengeId,
        status: { $in: ['pending', 'active'] },
        consumedAt: null,
        expiresAt: { $gt: new Date() },
      },
      {
        $set: {
          status: 'consumed',
          consumedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    ) as unknown as Promise<IOtpChallengeDocument | null>;
  }
}

export const otpChallengeRepository = new OtpChallengeRepository();
