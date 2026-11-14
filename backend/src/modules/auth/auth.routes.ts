import { Router } from 'express';
import { authController } from './auth.controller';
import { requireAuth, validateCsrf, authRateLimiter } from './auth.middleware';

const router: Router = Router();

// Public Authentication Endpoints
router.post('/register', authRateLimiter, authController.register);
router.post('/login', authRateLimiter, authController.login);
router.post('/refresh', validateCsrf, authController.refresh);
router.get('/csrf', authController.getCsrf);

// OTP & Phone Verification Endpoints
router.get('/otp/status', authController.getOtpStatus);
router.post('/otp/request', authRateLimiter, authController.requestOtp);
router.post('/otp/verify-registration/request', authRateLimiter, authController.requestRegistrationVerificationOtp);
router.post('/otp/verify', authRateLimiter, authController.verifyOtp);
router.post('/otp/resend', authRateLimiter, authController.resendOtp);

// Password Recovery Endpoints
router.post('/password/forgot', authRateLimiter, authController.forgotPassword);
router.post('/password/reset', authRateLimiter, authController.resetPassword);

// Protected Authentication Endpoints
router.post('/logout', requireAuth, validateCsrf, authController.logout);
router.post('/logout-all', requireAuth, validateCsrf, authController.logoutAll);
router.get('/me', requireAuth, authController.getMe);
router.get('/sessions', requireAuth, authController.getSessions);
router.delete('/sessions/:sessionId', requireAuth, validateCsrf, authController.deleteSession);
router.patch('/password', requireAuth, validateCsrf, authRateLimiter, authController.changePassword);

export default router;
