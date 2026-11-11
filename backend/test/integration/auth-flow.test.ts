import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../src/app';
import { UserModel } from '../../src/models/user.model';
import { AuthSessionModel } from '../../src/models/auth-session.model';
import * as dbStatus from '../../src/core/database/database-status';
import {
  hashPassword,
  hashTokenSha256,
  signAccessToken,
  generateOpaqueRefreshToken,
} from '../../src/modules/auth/auth.security';

describe('Phase 4 — Auth Endpoints & Session Lifecycle Integration', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(dbStatus, 'isDatabaseConnected').mockReturnValue(true);
  });

  describe('GET /api/v1/auth/csrf', () => {
    it('returns a new CSRF token and sets the techa_csrf cookie', async () => {
      const res = await request(app).get('/api/v1/auth/csrf');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('csrfToken');
      expect(typeof res.body.data.csrfToken).toBe('string');
      expect(res.body.data.csrfToken.length).toBe(64);

      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const csrfCookie = (cookies as string[]).find((c) => c.startsWith('techa_csrf='));
      expect(csrfCookie).toBeDefined();
    });
  });

  describe('POST /api/v1/auth/register', () => {
    it('creates a new user in pending_verification status and student role', async () => {
      vi.spyOn(UserModel, 'findOne').mockResolvedValue(null);

      const createdDoc = {
        _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
        phoneE164: '+989123456789',
        firstName: 'آرش',
        lastName: 'کمانگیر',
        roles: ['student'],
        status: 'pending_verification',
        phoneVerifiedAt: null,
        failedLoginCount: 0,
        authVersion: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        toObject() {
          return {
            _id: this._id,
            phoneE164: this.phoneE164,
            firstName: this.firstName,
            lastName: this.lastName,
            roles: this.roles,
            status: this.status,
            phoneVerifiedAt: this.phoneVerifiedAt,
            failedLoginCount: this.failedLoginCount,
            authVersion: this.authVersion,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
          };
        },
      };

      vi.spyOn(UserModel, 'create').mockResolvedValue(createdDoc as any);

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          phone: '09123456789',
          password: 'SecurePassword123!',
          firstName: 'آرش',
          lastName: 'کمانگیر',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.phoneE164).toBe('+989123456789');
      expect(res.body.data.status).toBe('pending_verification');
    });

    it('rejects duplicate registration with CONFLICT status', async () => {
      vi.spyOn(UserModel, 'findOne').mockResolvedValue({
        _id: new mongoose.Types.ObjectId(),
        phoneE164: '+989123456789',
      } as any);

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          phone: '09123456789',
          password: 'SecurePassword123!',
          firstName: 'تکراری',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('USER_ALREADY_EXISTS');
    });

    it('rejects registration with invalid or short password (< 12 chars)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          phone: '09123456789',
          password: 'short',
          firstName: 'کوتاه',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('rejects login for pending_verification / unverified user', async () => {
      const validHash = await hashPassword('ValidPass1234!');
      const unverifiedUser = {
        _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
        phoneE164: '+989123456789',
        firstName: 'ناقص',
        passwordHash: validHash,
        roles: ['student'],
        status: 'pending_verification',
        phoneVerifiedAt: null,
        failedLoginCount: 0,
        lockoutUntil: null,
      };

      vi.spyOn(UserModel, 'findOne').mockResolvedValue(unverifiedUser as any);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          phone: '09123456789',
          password: 'ValidPass1234!',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('PHONE_NOT_VERIFIED');
    });

    it('successfully logs in an active verified user and sets auth cookies', async () => {
      const plainPassword = 'CorrectPassword123!';
      const validHash = await hashPassword(plainPassword);
      const userId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439011');
      const sessionId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439099');

      const activeUser = {
        _id: userId,
        phoneE164: '+989123456789',
        firstName: 'کاربر',
        lastName: 'فعال',
        passwordHash: validHash,
        roles: ['student'],
        status: 'active',
        phoneVerifiedAt: new Date(),
        failedLoginCount: 0,
        lockoutUntil: null,
        authVersion: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        toObject() {
          return {
            _id: userId,
            phoneE164: this.phoneE164,
            firstName: this.firstName,
            lastName: this.lastName,
            roles: this.roles,
            status: this.status,
            phoneVerifiedAt: this.phoneVerifiedAt,
            authVersion: this.authVersion,
          };
        },
      };

      const sessionDoc = {
        _id: sessionId,
        userId,
        familyId: 'family-123',
        tokenHash: 'hash-abc',
        expiresAt: new Date(Date.now() + 30 * 86400 * 1000),
        revokedAt: null,
      };

      vi.spyOn(UserModel, 'findOne').mockResolvedValue(activeUser as any);
      vi.spyOn(UserModel, 'findByIdAndUpdate').mockResolvedValue(activeUser as any);
      vi.spyOn(AuthSessionModel, 'create').mockResolvedValue(sessionDoc as any);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          phone: '09123456789',
          password: plainPassword,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.phoneE164).toBe('+989123456789');

      const setCookies = res.headers['set-cookie'] as string[];
      expect(setCookies).toBeDefined();
      expect(setCookies.some((c) => c.startsWith('techa_at='))).toBe(true);
      expect(setCookies.some((c) => c.startsWith('techa_rt='))).toBe(true);
      expect(setCookies.some((c) => c.startsWith('techa_csrf='))).toBe(true);
    });

    it('increments failedLoginCount on wrong password and locks out after threshold', async () => {
      const validHash = await hashPassword('CorrectPassword123!');
      const userId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439011');

      const activeUser = {
        _id: userId,
        phoneE164: '+989123456789',
        passwordHash: validHash,
        roles: ['student'],
        status: 'active',
        phoneVerifiedAt: new Date(),
        failedLoginCount: 4, // 5th will lock
        lockoutUntil: null,
      };

      vi.spyOn(UserModel, 'findOne').mockResolvedValue(activeUser as any);
      const updateSpy = vi.spyOn(UserModel, 'findByIdAndUpdate').mockResolvedValue({} as any);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          phone: '09123456789',
          password: 'WrongPassword999!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
      expect(updateSpy).toHaveBeenCalled();
    });
  });

  describe('POST /api/v1/auth/refresh (Rotation & Reuse Detection)', () => {
    it('rotates refresh token, creates descendant session, and revokes parent session', async () => {
      const rawToken = generateOpaqueRefreshToken();
      const tokenHash = hashTokenSha256(rawToken);
      const userId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439011');
      const parentSessionId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439099');
      const newSessionId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439088');

      const existingSession = {
        _id: parentSessionId,
        userId,
        familyId: 'family-abc',
        tokenHash,
        revokedAt: null,
        expiresAt: new Date(Date.now() + 100000),
      };

      const user = {
        _id: userId,
        phoneE164: '+989123456789',
        roles: ['student'],
        status: 'active',
        authVersion: 1,
      };

      const newSessionDoc = {
        _id: newSessionId,
        userId,
        familyId: 'family-abc',
        parentSessionId,
        tokenHash: 'new-hash',
        expiresAt: new Date(Date.now() + 100000),
        revokedAt: null,
      };

      vi.spyOn(AuthSessionModel, 'findOne').mockResolvedValue(existingSession as any);
      vi.spyOn(UserModel, 'findById').mockResolvedValue(user as any);
      vi.spyOn(AuthSessionModel, 'findByIdAndUpdate').mockResolvedValue({} as any);
      vi.spyOn(AuthSessionModel, 'create').mockResolvedValue(newSessionDoc as any);

      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', `techa_rt=${rawToken}; techa_csrf=test-csrf-123456`)
        .set('x-csrf-token', 'test-csrf-123456');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const cookies = res.headers['set-cookie'] as string[];
      expect(cookies.some((c) => c.startsWith('techa_at='))).toBe(true);
      expect(cookies.some((c) => c.startsWith('techa_rt='))).toBe(true);
    });

    it('CRITICAL: revokes entire session family when revoked token reuse is detected', async () => {
      const rawToken = generateOpaqueRefreshToken();
      const tokenHash = hashTokenSha256(rawToken);
      const userId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439011');
      const alreadyRevokedSession = {
        _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439099'),
        userId,
        familyId: 'compromised-family-123',
        tokenHash,
        revokedAt: new Date(Date.now() - 5000), // ALREADY REVOKED!
        expiresAt: new Date(Date.now() + 100000),
      };

      vi.spyOn(AuthSessionModel, 'findOne').mockResolvedValue(alreadyRevokedSession as any);
      const revokeManySpy = vi.spyOn(AuthSessionModel, 'updateMany').mockResolvedValue({} as any);

      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', `techa_rt=${rawToken}; techa_csrf=test-csrf-123456`)
        .set('x-csrf-token', 'test-csrf-123456');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('SESSION_REUSED');
      // Entire family must be revoked immediately
      expect(revokeManySpy).toHaveBeenCalledWith(
        expect.objectContaining({ familyId: 'compromised-family-123' }),
        expect.objectContaining({ revokeReason: 'reuse_detected' })
      );
    });
  });

  describe('GET /api/v1/auth/me & Protected Middleware', () => {
    it('returns 401 when no access token cookie is provided', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('returns user profile when a valid access token cookie and active session exist', async () => {
      const userId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439011');
      const sessionId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439099');

      const token = signAccessToken({
        userId: userId.toString(),
        sessionId: sessionId.toString(),
        roles: ['student'],
      });

      const sessionDoc = {
        _id: sessionId,
        userId,
        revokedAt: null,
        expiresAt: new Date(Date.now() + 100000),
      };

      const userDoc = {
        _id: userId,
        phoneE164: '+989123456789',
        firstName: 'رضا',
        lastName: 'یزدانی',
        roles: ['student'],
        status: 'active',
        authVersion: 1,
        phoneVerifiedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        toObject() {
          return {
            _id: userId,
            phoneE164: this.phoneE164,
            firstName: this.firstName,
            lastName: this.lastName,
            roles: this.roles,
            status: this.status,
            phoneVerifiedAt: this.phoneVerifiedAt,
            authVersion: this.authVersion,
          };
        },
      };

      vi.spyOn(AuthSessionModel, 'findById').mockResolvedValue(sessionDoc as any);
      vi.spyOn(UserModel, 'findById').mockResolvedValue(userDoc as any);

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Cookie', [`techa_at=${token}`]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.phoneE164).toBe('+989123456789');
      expect(res.body.data.user.firstName).toBe('رضا');
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('revokes the session and clears cookies', async () => {
      const userId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439011');
      const sessionId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439099');

      const token = signAccessToken({
        userId: userId.toString(),
        sessionId: sessionId.toString(),
        roles: ['student'],
      });

      const sessionDoc = {
        _id: sessionId,
        userId,
        revokedAt: null,
        expiresAt: new Date(Date.now() + 100000),
      };

      const userDoc = {
        _id: userId,
        phoneE164: '+989123456789',
        roles: ['student'],
        status: 'active',
        authVersion: 1,
      };

      vi.spyOn(AuthSessionModel, 'findById').mockResolvedValue(sessionDoc as any);
      vi.spyOn(UserModel, 'findById').mockResolvedValue(userDoc as any);
      const revokeSpy = vi.spyOn(AuthSessionModel, 'findByIdAndUpdate').mockResolvedValue({} as any);

      const res = await request(app)
        .post('/api/v1/auth/logout')
        .set('Cookie', `techa_at=${token}; techa_csrf=test-csrf-123456`)
        .set('x-csrf-token', 'test-csrf-123456');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(revokeSpy).toHaveBeenCalled();
    });
  });
});
