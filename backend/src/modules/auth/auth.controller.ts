import { Request, Response } from 'express';
import { authService, AuthService } from './auth.service';
import { setAuthCookies, clearAuthCookies, getCookies, setCsrfCookie } from './auth.cookies';
import { generateCsrfToken } from './auth.security';
import {
  RegisterRequestSchema,
  LoginRequestSchema,
  ChangePasswordRequestSchema,
  OtpRequestSchema,
  OtpVerifySchema,
  OtpResendSchema,
  ForgotPasswordRequestSchema,
  ResetPasswordRequestSchema,
} from '@techa/shared';

export class AuthController {
  constructor(private service: AuthService = authService) {}

  /**
   * POST /api/v1/auth/register
   */
  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const parseResult = RegisterRequestSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: parseResult.error.issues[0]?.message || 'اطلاعات وارد شده نامعتبر است',
            details: parseResult.error.issues,
          },
        });
        return;
      }

      const clientIp = (req.ip || req.socket.remoteAddress) as string | undefined;
      const result = await this.service.register(parseResult.data, clientIp);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'خطا در ثبت‌نام کاربر';
      const isDuplicate = message.includes('وجود ندارد') || message.includes('قبلاً') || message.includes('تکراری');
      res.status(isDuplicate ? 409 : 400).json({
        success: false,
        error: {
          code: isDuplicate ? 'USER_ALREADY_EXISTS' : 'REGISTRATION_FAILED',
          message,
        },
      });
    }
  };

  /**
   * POST /api/v1/auth/login
   */
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const parseResult = LoginRequestSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: parseResult.error.issues[0]?.message || 'شماره موبایل یا رمز عبور نامعتبر است',
          },
        });
        return;
      }

      const result = await this.service.login(parseResult.data, {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip || req.socket.remoteAddress,
      });

      // Set HttpOnly authentication cookies
      setAuthCookies(
        res,
        {
          accessToken: result.accessToken,
          refreshToken: result.rawRefreshToken,
          csrfToken: result.csrfToken,
        },
        req
      );

      res.status(200).json({
        success: true,
        data: {
          user: result.user,
          csrfToken: result.csrfToken,
          message: 'ورود با موفقیت انجام شد',
        },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'شماره موبایل یا رمز عبور صحیح نیست';
      const isPendingVerification = message.includes('تأیید نشده');
      res.status(isPendingVerification ? 403 : 401).json({
        success: false,
        error: {
          code: isPendingVerification ? 'PHONE_NOT_VERIFIED' : 'INVALID_CREDENTIALS',
          message,
        },
      });
    }
  };

  /**
   * POST /api/v1/auth/refresh
   */
  refresh = async (req: Request, res: Response): Promise<void> => {
    try {
      const cookies = getCookies(req);
      const rawRefreshToken = cookies.refreshToken;

      if (!rawRefreshToken) {
        res.status(401).json({
          success: false,
          error: {
            code: 'NO_REFRESH_TOKEN',
            message: 'توکن تمدید نشست یافت نشد',
          },
        });
        return;
      }

      const result = await this.service.refresh(rawRefreshToken, {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip || req.socket.remoteAddress,
      });

      // Set new rotated cookies
      setAuthCookies(
        res,
        {
          accessToken: result.accessToken,
          refreshToken: result.newRawRefreshToken,
          csrfToken: result.csrfToken,
        },
        req
      );

      res.status(200).json({
        success: true,
        data: {
          user: result.user,
          csrfToken: result.csrfToken,
          message: 'نشست کاربری با موفقیت تمدید شد',
        },
      });
    } catch (err: unknown) {
      clearAuthCookies(res, req);
      const message = err instanceof Error ? err.message : 'تمدید نشست ناموفق بود';
      const isReuse = message.includes('مجدد') || message.includes('شناسایی');
      res.status(401).json({
        success: false,
        error: {
          code: isReuse ? 'SESSION_REUSED' : 'REFRESH_FAILED',
          message,
        },
      });
    }
  };

  /**
   * POST /api/v1/auth/logout
   */
  logout = async (req: Request, res: Response): Promise<void> => {
    try {
      if (req.session?._id) {
        await this.service.logout(req.session._id.toString());
      }
      clearAuthCookies(res, req);
      res.status(200).json({
        success: true,
        data: {
          message: 'خروج از حساب با موفقیت انجام شد',
        },
      });
    } catch {
      clearAuthCookies(res, req);
      res.status(200).json({
        success: true,
        data: {
          message: 'خروج از حساب انجام شد',
        },
      });
    }
  };

  /**
   * POST /api/v1/auth/logout-all
   */
  logoutAll = async (req: Request, res: Response): Promise<void> => {
    try {
      if (req.user?._id) {
        await this.service.logoutAll(req.user._id.toString());
      }
      clearAuthCookies(res, req);
      res.status(200).json({
        success: true,
        data: {
          message: 'تمام نشست‌های فعال این حساب کاربری با موفقیت ابطال شدند',
        },
      });
    } catch (err: unknown) {
      clearAuthCookies(res, req);
      res.status(500).json({
        success: false,
        error: {
          code: 'LOGOUT_ALL_FAILED',
          message: 'خطا در خروج از تمام نشست‌ها',
        },
      });
    }
  };

  /**
   * GET /api/v1/auth/me
   */
  getMe = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await this.service.getCurrentUser(req.user._id.toString());
      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (err: unknown) {
      res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'اطلاعات کاربر یافت نشد',
        },
      });
    }
  };

  /**
   * GET /api/v1/auth/sessions
   */
  getSessions = async (req: Request, res: Response): Promise<void> => {
    try {
      const sessions = await this.service.getActiveSessions(
        req.user._id.toString(),
        req.session._id.toString()
      );
      res.status(200).json({
        success: true,
        data: { sessions },
      });
    } catch {
      res.status(500).json({
        success: false,
        error: {
          code: 'SESSIONS_FETCH_FAILED',
          message: 'خطا در دریافت لیست نشست‌ها',
        },
      });
    }
  };

  /**
   * DELETE /api/v1/auth/sessions/:sessionId
   */
  deleteSession = async (req: Request, res: Response): Promise<void> => {
    try {
      const sessionId = String(req.params.sessionId);
      await this.service.revokeSession(req.user._id.toString(), sessionId);
      res.status(200).json({
        success: true,
        data: {
          message: 'نشست مورد نظر با موفقیت لغو شد',
        },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'خطا در لغو نشست';
      res.status(400).json({
        success: false,
        error: {
          code: 'REVOKE_FAILED',
          message,
        },
      });
    }
  };

  /**
   * PATCH /api/v1/auth/password
   */
  changePassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const parseResult = ChangePasswordRequestSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: parseResult.error.issues[0]?.message || 'اطلاعات وارد شده نامعتبر است',
          },
        });
        return;
      }

      await this.service.changePassword(
        req.user._id.toString(),
        {
          currentPassword: parseResult.data.currentPassword,
          newPassword: parseResult.data.newPassword,
        }
      );

      // Clear cookies to force re-login with new password
      clearAuthCookies(res, req);

      res.status(200).json({
        success: true,
        data: {
          message: 'رمز عبور با موفقیت تغییر یافت. لطفاً با رمز عبور جدید وارد شوید.',
        },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'خطا در تغییر رمز عبور';
      res.status(400).json({
        success: false,
        error: {
          code: 'PASSWORD_CHANGE_FAILED',
          message,
        },
      });
    }
  };

  /**
   * POST /api/v1/auth/otp/request
   * Requests an OTP challenge for login (with anti-enumeration protection)
   */
  requestOtp = async (req: Request, res: Response): Promise<void> => {
    try {
      const parseResult = OtpRequestSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: parseResult.error.issues[0]?.message || 'شماره موبایل وارد شده نامعتبر است',
            details: parseResult.error.issues,
          },
        });
        return;
      }

      const clientIp = (req.ip || req.socket.remoteAddress) as string | undefined;
      const result = await this.service.requestLoginOtp(parseResult.data.phone, clientIp);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err: unknown) {
      const mapped = this.mapOtpError(err);
      res.status(mapped.status).json({
        success: false,
        error: {
          code: mapped.code,
          message: mapped.message,
        },
      });
    }
  };

  /**
   * POST /api/v1/auth/otp/verify
   * Verifies OTP code and authenticates user (registration activation or OTP login)
   */
  verifyOtp = async (req: Request, res: Response): Promise<void> => {
    try {
      const parseResult = OtpVerifySchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: parseResult.error.issues[0]?.message || 'اطلاعات وارد شده نامعتبر است',
            details: parseResult.error.issues,
          },
        });
        return;
      }

      const result = await this.service.verifyOtpAndLogin({
        challengeId: parseResult.data.challengeId,
        code: parseResult.data.code,
        context: {
          userAgent: req.headers['user-agent'],
          ipAddress: req.ip || req.socket.remoteAddress,
        },
      });

      // Set HttpOnly authentication cookies
      setAuthCookies(
        res,
        {
          accessToken: result.accessToken,
          refreshToken: result.rawRefreshToken,
          csrfToken: result.csrfToken,
        },
        req
      );

      res.status(200).json({
        success: true,
        data: {
          user: result.user,
          csrfToken: result.csrfToken,
          message: result.message,
        },
      });
    } catch (err: unknown) {
      const mapped = this.mapOtpError(err);
      res.status(mapped.status).json({
        success: false,
        error: {
          code: mapped.code,
          message: mapped.message,
        },
      });
    }
  };

  /**
   * POST /api/v1/auth/otp/resend
   * Resends OTP code if cooldown has elapsed
   */
  resendOtp = async (req: Request, res: Response): Promise<void> => {
    try {
      const parseResult = OtpResendSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: parseResult.error.issues[0]?.message || 'شناسه درخواست نامعتبر است',
          },
        });
        return;
      }

      const clientIp = (req.ip || req.socket.remoteAddress) as string | undefined;
      const result = await this.service.resendOtp(parseResult.data.challengeId, clientIp);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err: unknown) {
      const mapped = this.mapOtpError(err);
      res.status(mapped.status).json({
        success: false,
        error: {
          code: mapped.code,
          message: mapped.message,
        },
      });
    }
  };

  /**
   * POST /api/v1/auth/password/forgot
   * Requests password reset OTP (anti-enumeration response)
   */
  forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const parseResult = ForgotPasswordRequestSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: parseResult.error.issues[0]?.message || 'شماره موبایل وارد شده نامعتبر است',
            details: parseResult.error.issues,
          },
        });
        return;
      }

      const clientIp = (req.ip || req.socket.remoteAddress) as string | undefined;
      const result = await this.service.forgotPassword(parseResult.data.phone, clientIp);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err: unknown) {
      const mapped = this.mapOtpError(err);
      res.status(mapped.status).json({
        success: false,
        error: {
          code: mapped.code,
          message: mapped.message,
        },
      });
    }
  };

  /**
   * POST /api/v1/auth/password/reset
   * Resets password using valid OTP challenge and revokes all active sessions
   */
  resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const parseResult = ResetPasswordRequestSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: parseResult.error.issues[0]?.message || 'اطلاعات وارد شده نامعتبر است',
            details: parseResult.error.issues,
          },
        });
        return;
      }

      const result = await this.service.resetPasswordWithOtp({
        challengeId: parseResult.data.challengeId,
        code: parseResult.data.code,
        newPassword: parseResult.data.newPassword,
      });

      // Clear any cookies if user had an existing session
      clearAuthCookies(res, req);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err: unknown) {
      const mapped = this.mapOtpError(err);
      res.status(mapped.status).json({
        success: false,
        error: {
          code: mapped.code,
          message: mapped.message,
        },
      });
    }
  };

  private mapOtpError(err: unknown): { status: number; code: string; message: string } {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('OTP_EXPIRED')) {
      return { status: 410, code: 'OTP_EXPIRED', message: 'کد اعتبارسنجی منقضی شده است. لطفاً درخواست کد جدید ثبت کنید.' };
    }
    if (msg.includes('OTP_LOCKED')) {
      return { status: 423, code: 'OTP_LOCKED', message: 'تعداد دفعات تلاش بیش از حد مجاز بود و این درخواست مسدود شد.' };
    }
    if (msg.includes('OTP_ALREADY_USED')) {
      return { status: 409, code: 'OTP_ALREADY_USED', message: 'این کد اعتبارسنجی قبلاً استفاده شده است.' };
    }
    if (msg.includes('OTP_INVALID')) {
      return { status: 400, code: 'OTP_INVALID', message: 'کد اعتبارسنجی وارد شده صحیح نیست.' };
    }
    if (msg.includes('OTP_RESEND_COOLDOWN_ACTIVE')) {
      return { status: 429, code: 'OTP_RESEND_COOLDOWN_ACTIVE', message: 'لطفاً تا پایان زمان انتظار منتظر بمانید.' };
    }
    if (msg.includes('OTP_HOURLY_LIMIT_PHONE_EXCEEDED')) {
      return { status: 429, code: 'OTP_HOURLY_LIMIT_PHONE_EXCEEDED', message: 'سقف مجاز ارسال پیامک در این ساعت برای این شماره پر شده است.' };
    }
    if (msg.includes('OTP_HOURLY_LIMIT_IP_EXCEEDED')) {
      return { status: 429, code: 'OTP_HOURLY_LIMIT_IP_EXCEEDED', message: 'سقف مجاز ارسال پیامک برای این آدرس اینترنتی پر شده است.' };
    }
    if (msg.includes('OTP_CHALLENGE_NOT_FOUND')) {
      return { status: 404, code: 'OTP_CHALLENGE_NOT_FOUND', message: 'درخواست اعتبارسنجی یافت نشد یا باطل شده است.' };
    }
    if (msg.includes('OTP_PROVIDER_NOT_CONFIGURED')) {
      return { status: 503, code: 'OTP_PROVIDER_NOT_CONFIGURED', message: 'سرویس ارسال پیامک در حال حاضر پیکربندی نشده است.' };
    }
    if (msg.includes('OTP_PROVIDER_UNAVAILABLE')) {
      return { status: 503, code: 'OTP_PROVIDER_UNAVAILABLE', message: 'ارتباط با سامانه پیامکی با وقفه مواجه شد. لطفاً لحظاتی دیگر تلاش کنید.' };
    }
    if (msg.includes('OTP_PROVIDER_AUTH_FAILED')) {
      return { status: 502, code: 'OTP_PROVIDER_AUTH_FAILED', message: 'خطا در احراز هویت سرویس ارسال پیامک.' };
    }
    if (msg.includes('OTP_PROVIDER_INSUFFICIENT_CREDIT')) {
      return { status: 503, code: 'OTP_PROVIDER_INSUFFICIENT_CREDIT', message: 'سرویس ارسال پیامک موقتاً در دسترس نیست.' };
    }
    if (msg.includes('OTP_TEMPLATE_INVALID')) {
      return { status: 502, code: 'OTP_TEMPLATE_INVALID', message: 'الگوی پیامک اعتبارسنجی به درستی پیکربندی نشده است.' };
    }
    if (msg.includes('OTP_DELIVERY_FAILED') || msg.includes('OTP_PROVIDER_ERROR')) {
      return { status: 502, code: 'OTP_DELIVERY_FAILED', message: 'خطا در ارسال پیامک اعتبارسنجی. لطفاً مجدداً تلاش کنید.' };
    }
    return { status: 400, code: 'OTP_OPERATION_FAILED', message: msg || 'عملیات اعتبارسنجی ناموفق بود.' };
  };

  /**
   * GET /api/v1/auth/csrf
   * Issues or refreshes CSRF token cookie and returns token for SPA
   */
  getCsrf = (req: Request, res: Response): void => {
    const cookies = getCookies(req);
    let csrfToken = cookies.csrfToken;
    if (!csrfToken) {
      csrfToken = generateCsrfToken();
      setCsrfCookie(res, csrfToken, req);
    }
    res.status(200).json({
      success: true,
      data: { csrfToken },
    });
  };
}

export const authController = new AuthController();
