import express from 'express';
import { createOrder, getOrders, getOrder, updateOrderStatus, getMyOrders } from '../controllers/orderController.js';
import { protect, restrictTo, optionalAuth } from '../middleware/auth.js';
import { uploadPaymentScreenshot } from '../config/cloudinary.js';
import { apiLimiter } from '../middleware/rateLimiter.js';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validate.js';

const router = express.Router();

router.post('/', apiLimiter, optionalAuth, uploadPaymentScreenshot, createOrder);

router.get('/my-orders', protect, getMyOrders);

// Admin routes
router.use(protect, restrictTo('admin', 'superadmin'));
router.get('/', getOrders);
router.get('/:id', getOrder);
router.patch('/:id/status', [
  body('status').isIn(['pending', 'confirmed', 'processing', 'delivered', 'cancelled']),
  validateRequest,
], updateOrderStatus);

export default router;
