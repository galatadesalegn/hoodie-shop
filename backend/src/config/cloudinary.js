import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import { AppError } from '../utils/response.js';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async () => {
    return {
      folder: 'hoodie-store/products',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
      transformation: [{ 
        width: 1200, 
        height: 1200, 
        crop: 'limit', 
        quality: 'auto',
        flags: 'strip_profile' // Strip metadata
      }],
      public_id: `hoodie_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  },
});

const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: async () => ({
    folder: 'hoodie-store/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
    transformation: [{ 
      width: 400, 
      height: 400, 
      crop: 'fill', 
      quality: 'auto',
      flags: 'strip_profile'
    }],
    public_id: `avatar_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  }),
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Invalid file type. Only JPG, PNG, WEBP, AVIF allowed.', 400), false);
  }
};

const paymentStorage = new CloudinaryStorage({
  cloudinary,
  params: async () => ({
    folder: 'hoodie-store/payments',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
    transformation: [{ 
      width: 1200, 
      height: 1200, 
      crop: 'limit', 
      quality: 'auto',
      flags: 'strip_profile'
    }],
    public_id: `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  }),
});

const paymentScreenshotUpload = multer({
  storage: paymentStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
}).single('screenshot');

export const uploadPaymentScreenshot = (req, res, next) => {
  paymentScreenshotUpload(req, res, (error) => {
    if (!error) return next();

    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return next(new AppError('Payment screenshot must be 5MB or smaller.', 400));
      }
      return next(new AppError(error.message, 400));
    }

    if (error.isOperational) return next(error);

    console.error('Payment screenshot upload error:', error);
    return next(new AppError('Could not upload payment screenshot. Please try again.', 503));
  });
};

export const uploadProductImages = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 6 },
}).array('images', 6);

export const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
}).single('avatar');

export const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
  }
};

export default cloudinary;
