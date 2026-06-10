import express from 'express';
import { getAdmins, createAdmin, updateAdmin, deleteAdmin, getCustomers, updateProfile, changePassword, uploadProfileAvatar, getSecurityLogs, verifyEmailChange, verifyAdminEmailOtp } from '../controllers/adminController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { uploadLimiter, adminActionLimiter, securityLogLimiter, emailChangeLimiter } from '../middleware/rateLimiter.js';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validate.js';

const router = express.Router();

// Public route for email verification (doesn't need 'protect' yet because it uses token)
router.get('/verify-email-change/:token', emailChangeLimiter, verifyEmailChange);

router.use(protect, restrictTo('admin', 'superadmin'));

router.get('/customers', adminActionLimiter, getCustomers);
router.patch('/profile', adminActionLimiter, updateProfile);
router.post('/verify-email-otp', adminActionLimiter, [body('email').isEmail(), body('otp').matches(/^\d{6}$/)], validateRequest, verifyAdminEmailOtp);
router.patch('/change-password', [
  adminActionLimiter,
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/),
  validateRequest,
], changePassword);
router.post('/avatar', uploadLimiter, uploadProfileAvatar);

// Super admin only
router.use(restrictTo('superadmin'));
router.get('/admins', adminActionLimiter, getAdmins);
router.post('/admins', adminActionLimiter, createAdmin);
router.put('/admins/:id', adminActionLimiter, updateAdmin);
router.delete('/admins/:id', adminActionLimiter, deleteAdmin);
router.get('/security-logs', securityLogLimiter, getSecurityLogs);

export default router;
