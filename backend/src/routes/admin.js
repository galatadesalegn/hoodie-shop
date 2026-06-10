import express from 'express';
import { getAdmins, createAdmin, updateAdmin, deleteAdmin, getCustomers, updateProfile, changePassword, uploadProfileAvatar, getSecurityLogs } from '../controllers/adminController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { uploadLimiter } from '../middleware/rateLimiter.js';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validate.js';

const router = express.Router();

router.use(protect, restrictTo('admin', 'superadmin'));

router.get('/customers', getCustomers);
router.patch('/profile', updateProfile);
router.patch('/change-password', [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/),
  validateRequest,
], changePassword);
router.post('/avatar', uploadLimiter, uploadProfileAvatar);

// Super admin only
router.use(restrictTo('superadmin'));
router.get('/admins', getAdmins);
router.post('/admins', createAdmin);
router.put('/admins/:id', updateAdmin);
router.delete('/admins/:id', deleteAdmin);
router.get('/security-logs', getSecurityLogs);

export default router;
