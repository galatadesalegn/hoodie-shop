import Hoodie from '../models/Hoodie.js';
import { deleteFromCloudinary } from '../config/cloudinary.js';
import { logSecurityEvent, getClientInfo } from '../utils/securityLog.js';
import { AppError } from '../utils/response.js';

// Get all hoodies (public)
export const getHoodies = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, category, featured, newArrival, search, sort = '-createdAt', minPrice, maxPrice } = req.query;

    const filter = { isActive: true };
    if (category) filter.category = category;
    if (featured === 'true') filter.featured = true;
    if (newArrival === 'true') filter.newArrival = true;
    if (search) filter.$text = { $search: search };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Hoodie.countDocuments(filter);
    const hoodies = await Hoodie.find(filter).sort(sort).skip(skip).limit(Number(limit)).select('-__v');

    res.json({
      success: true,
      data: { hoodies, total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

// Get single hoodie (public)
export const getHoodie = async (req, res, next) => {
  try {
    const hoodie = await Hoodie.findOne({ slug: req.params.slug, isActive: true });
    if (!hoodie) return next(new AppError('Hoodie not found.', 404));

    // Increment view count
    await Hoodie.findByIdAndUpdate(hoodie._id, { $inc: { viewCount: 1 } });

    // Get related hoodies
    const related = await Hoodie.find({
      category: hoodie.category,
      _id: { $ne: hoodie._id },
      isActive: true,
    }).limit(4).select('name slug price discountPrice images');

    res.json({ success: true, data: { hoodie, related } });
  } catch (error) {
    next(error);
  }
};

// Admin: Create hoodie
export const createHoodie = async (req, res, next) => {
  try {
    const files = req.files || [];
    if (files.length === 0) return next(new AppError('At least one image is required.', 400));

    const images = files.map((f) => ({ url: f.path, publicId: f.filename, alt: req.body.name }));

    let sizes = req.body.sizes;
    let colors = req.body.colors;

    if (typeof sizes === 'string') sizes = JSON.parse(sizes);
    if (typeof colors === 'string') colors = JSON.parse(colors);

    const hoodie = await Hoodie.create({
      ...req.body,
      sizes,
      colors,
      images,
      createdBy: req.user._id,
    });

    await logSecurityEvent({ event: 'product_created', userId: req.user._id, ...getClientInfo(req), details: { productId: hoodie._id, name: hoodie.name } });

    res.status(201).json({ success: true, message: 'Hoodie created successfully.', data: { hoodie } });
  } catch (error) {
    next(error);
  }
};

// Admin: Update hoodie
export const updateHoodie = async (req, res, next) => {
  try {
    const hoodie = await Hoodie.findById(req.params.id);
    if (!hoodie) return next(new AppError('Hoodie not found.', 404));

    const newImages = req.files?.map((f) => ({ url: f.path, publicId: f.filename, alt: req.body.name || hoodie.name })) || [];

    let sizes = req.body.sizes;
    let colors = req.body.colors;
    let removeImages = req.body.removeImages;

    if (typeof sizes === 'string') sizes = JSON.parse(sizes);
    if (typeof colors === 'string') colors = JSON.parse(colors);
    if (typeof removeImages === 'string') removeImages = JSON.parse(removeImages);

    // Remove specified images
    if (removeImages?.length > 0) {
      for (const publicId of removeImages) {
        await deleteFromCloudinary(publicId);
        hoodie.images = hoodie.images.filter((img) => img.publicId !== publicId);
      }
    }

    // Add new images
    hoodie.images = [...hoodie.images, ...newImages];

    Object.assign(hoodie, { ...req.body, sizes: sizes || hoodie.sizes, colors: colors || hoodie.colors });
    await hoodie.save();

    await logSecurityEvent({ event: 'product_updated', userId: req.user._id, ...getClientInfo(req), details: { productId: hoodie._id } });

    res.json({ success: true, message: 'Hoodie updated.', data: { hoodie } });
  } catch (error) {
    next(error);
  }
};

// Admin: Delete hoodie
export const deleteHoodie = async (req, res, next) => {
  try {
    const hoodie = await Hoodie.findById(req.params.id);
    if (!hoodie) return next(new AppError('Hoodie not found.', 404));

    // Delete images from cloudinary
    for (const img of hoodie.images) {
      await deleteFromCloudinary(img.publicId);
    }

    await hoodie.deleteOne();

    await logSecurityEvent({ event: 'product_deleted', userId: req.user._id, ...getClientInfo(req), details: { productId: req.params.id, name: hoodie.name }, severity: 'medium' });

    res.json({ success: true, message: 'Hoodie deleted.' });
  } catch (error) {
    next(error);
  }
};

// Admin: Get all hoodies (including inactive)
export const adminGetHoodies = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, category } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (search) filter.$text = { $search: search };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Hoodie.countDocuments(filter);
    const hoodies = await Hoodie.find(filter).sort('-createdAt').skip(skip).limit(Number(limit));

    res.json({ success: true, data: { hoodies, total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
};

// Admin: Get dashboard stats
export const getDashboardStats = async (req, res, next) => {
  try {
    const [totalProducts, totalOrders, totalCustomers, mostViewed, recentOrders, categoryStats] = await Promise.all([
      Hoodie.countDocuments(),
      (await import('../models/Order.js')).default.countDocuments(),
      (await import('../models/User.js')).default.countDocuments({ role: 'customer' }),
      Hoodie.find({ isActive: true }).sort('-viewCount').limit(5).select('name viewCount images price'),
      (await import('../models/Order.js')).default.find().sort('-createdAt').limit(10).populate('items.hoodie', 'name images'),
      Hoodie.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
    ]);

    // Orders by status
    const Order = (await import('../models/Order.js')).default;
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Revenue last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const revenueData = await Order.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo }, status: { $ne: 'cancelled' } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$totalAmount' }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      data: { totalProducts, totalOrders, totalCustomers, mostViewed, recentOrders, categoryStats, ordersByStatus, revenueData },
    });
  } catch (error) {
    next(error);
  }
};
