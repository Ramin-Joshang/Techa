import { Request, Response } from 'express';
import { authService, AuthService } from './auth.service';
import { setAuthCookies, clearAuthCookies, getCookies } from './auth.cookies';
import { generateCsrfToken } from './auth.security';
import {
  RegisterRequestSchema,
  LoginRequestSchema,
  ChangePasswordRequestSchema,
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

      const result = await this.service.register(parseResult.data);

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
      setAuthCookies(res, {
        accessToken: result.accessToken,
        refreshToken: result.rawRefreshToken,
        csrfToken: result.csrfToken,
      });

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
      setAuthCookies(res, {
        accessToken: result.accessToken,
        refreshToken: result.newRawRefreshToken,
        csrfToken: result.csrfToken,
      });

      res.status(200).json({
        success: true,
        data: {
          user: result.user,
          csrfToken: result.csrfToken,
          message: 'نشست کاربری با موفقیت تمدید شد',
        },
      });
    } catch (err: unknown) {
      clearAuthCookies(res);
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
      clearAuthCookies(res);
      res.status(200).json({
        success: true,
        data: {
          message: 'خروج از حساب با موفقیت انجام شد',
        },
      });
    } catch {
      clearAuthCookies(res);
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
      clearAuthCookies(res);
      res.status(200).json({
        success: true,
        data: {
          message: 'تمام نشست‌های فعال این حساب کاربری با موفقیت ابطال شدند',
        },
      });
    } catch (err: unknown) {
      clearAuthCookies(res);
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

      await this.service.changePassword({
        userId: req.user._id.toString(),
        currentSessionId: req.session._id.toString(),
        currentPassword: parseResult.data.currentPassword,
        newPassword: parseResult.data.newPassword,
      });

      // Clear cookies to force re-login with new password
      clearAuthCookies(res);

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
   * GET /api/v1/auth/csrf
   * Issues or refreshes CSRF token cookie and returns token for SPA
   */
  getCsrf = (req: Request, res: Response): void => {
    const cookies = getCookies(req);
    let csrfToken = cookies.csrfToken;
    if (!csrfToken) {
      csrfToken = generateCsrfToken();
      res.cookie('techa_csrf', csrfToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
    }
    res.status(200).json({
      success: true,
      data: { csrfToken },
    });
  };
}

export const authController = new AuthController();
