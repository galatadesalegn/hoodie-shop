import express from 'express';
import { register, login, logout, verifyEmail, verifyEmailOtp, resendVerificationOtp, forgotPassword, resetPassword, refreshToken, getMe, resendVerification, updateProfile } from '../controllers/authController.js';
import { loginLimiter, registerLimiter, forgotPasswordLimiter, verifyOtpLimiter } from '../middleware/rateLimiter.js';
import { protect } from '../middleware/auth.js';
import { body, param } from 'express-validator';
import { validateRequest } from '../middleware/validate.js';

const router = express.Router();

const passwordPolicy = body('password')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters')
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
  .withMessage('Password must contain uppercase, lowercase, number, and special character');

router.post('/register', registerLimiter, [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 60 }),
  body('username').trim().notEmpty().isLength({ min: 3, max: 30 }).matches(/^[a-zA-Z0-9_]+$/),
  body('email').normalizeEmail().isEmail().withMessage('Valid email required'),
  passwordPolicy,
  validateRequest,
], register);

router.post('/login', loginLimiter, [
  body('email').normalizeEmail().isEmail(),
  body('password').notEmpty(),
  validateRequest,
], login);

router.post('/logout', protect, logout);
router.post('/refresh', refreshToken);
router.get('/me', protect, getMe);
router.patch('/profile', protect, [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 60 }),
  validateRequest,
], updateProfile);

router.post('/verify-email-otp', verifyOtpLimiter, [
  body('email').normalizeEmail().isEmail().withMessage('Valid email required'),
  body('otp').trim().matches(/^\d{6}$/).withMessage('OTP must be a 6-digit code'),
  validateRequest,
], verifyEmailOtp);

router.post('/resend-otp', verifyOtpLimiter, [
  body('email').normalizeEmail().isEmail().withMessage('Valid email required'),
  validateRequest,
], resendVerificationOtp);

router.get('/verify-email/:token', [
  param('token').notEmpty(),
  validateRequest,
], verifyEmail);

router.post('/resend-verification', protect, resendVerification);

router.post('/forgot-password', forgotPasswordLimiter, [
  body('email').normalizeEmail().isEmail(),
  validateRequest,
], forgotPassword);

router.post('/reset-password/:token', [
  param('token').notEmpty(),
  passwordPolicy,
  validateRequest,
], resetPassword);

export default router;
