import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import connectDB from './config/database.js';
import logger from './utils/logger.js';
import { globalErrorHandler, notFound } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import csrf from 'csurf';
import validateEnv from './utils/validateEnv.js';

// Validate environment variables at startup
validateEnv();

import authRoutes from './routes/auth.js';
import hoodieRoutes from './routes/hoodies.js';
import orderRoutes from './routes/orders.js';
import adminRoutes from './routes/admin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Ensure logs directory
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

const app = express();

// Security Headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'res.cloudinary.com', '*.unsplash.com'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", 'fonts.gstatic.com'],
      scriptSrc: ["'self'", "'unsafe-inline'"], // unsafe-inline needed for some recharts/framer-motion scenarios, but ideally remove
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  // xContentTypeOptions defaults to true (nosniff) in recent helmet versions and does not accept options
  xFrameOptions: { action: 'deny' },
  xXssProtection: true,
}));

// CORS — allow storefront and admin panel origins
const getAllowedOrigins = () => {
  if (process.env.NODE_ENV !== 'production') {
    return [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000',
      'http://localhost:3001',
    ];
  }
  const origins = [
    ...(process.env.FRONTEND_URL?.split(',') || []),
    ...(process.env.ADMIN_URL?.split(',') || []),
  ].map((o) => o.trim().replace(/\/$/, '')).filter(Boolean);
  return origins;
};

app.use(cors({
  origin: getAllowedOrigins(),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Requested-With'],
}));

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Sanitize
app.use(mongoSanitize());

// CSRF Protection
const csrfProtection = csrf({ 
  cookie: { 
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  } 
});

const csrfUnlessBearerToken = (req, res, next) => {
  if (req.headers.authorization?.startsWith('Bearer ')) {
    return next();
  }
  return csrfProtection(req, res, next);
};

// Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Hoodie Shop API is running',
    health: '/health',
  });
});

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// CSRF Token endpoint
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/hoodies', csrfUnlessBearerToken, hoodieRoutes);
app.use('/api/orders', csrfUnlessBearerToken, orderRoutes);
app.use('/api/admin', csrfUnlessBearerToken, adminRoutes);

// 404
app.use(notFound);

// Global error handler
app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
};

start();

export default app;
