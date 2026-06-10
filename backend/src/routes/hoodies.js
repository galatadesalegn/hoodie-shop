import express from 'express';
import { getHoodies, getHoodie, createHoodie, updateHoodie, deleteHoodie, adminGetHoodies, getDashboardStats } from '../controllers/hoodieController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { uploadProductImages } from '../config/cloudinary.js';
import { uploadLimiter, apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public routes
router.get('/', apiLimiter, getHoodies);
router.get('/slug/:slug', apiLimiter, getHoodie);

// Admin routes
router.use(protect, restrictTo('admin', 'superadmin'));
router.get('/admin/all', adminGetHoodies);
router.get('/admin/dashboard', getDashboardStats);
router.post('/', uploadLimiter, (req, res, next) => {
  uploadProductImages(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    next();
  });
}, createHoodie);
router.put('/:id', uploadLimiter, (req, res, next) => {
  uploadProductImages(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    next();
  });
}, updateHoodie);
router.delete('/:id', deleteHoodie);

export default router;
