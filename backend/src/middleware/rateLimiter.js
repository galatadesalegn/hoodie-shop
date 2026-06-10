import rateLimit from 'express-rate-limit';

const createLimiter = (windowMs, max, message) =>
  rateLimit({
    windowMs,
    max,
    message: { success: false, message },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    // Add trust proxy for production (e.g. behind Nginx)
    validate: { trustProxy: false },
  });

export const loginLimiter = createLimiter(
  60 * 1000,      // 1 minute
  5,              // 5 attempts
  'Too many login attempts. Please wait 1 minute before trying again.'
);

export const registerLimiter = createLimiter(
  60 * 60 * 1000, // 1 hour
  10,
  'Too many registration attempts. Please try again later.'
);

export const forgotPasswordLimiter = createLimiter(
  60 * 60 * 1000, // 1 hour
  3,
  'Too many password reset requests. Please try again after 1 hour.'
);

export const apiLimiter = createLimiter(
  15 * 60 * 1000, // 15 minutes
  100,
  'Too many requests. Please try again in 15 minutes.'
);

export const uploadLimiter = createLimiter(
  60 * 60 * 1000, // 1 hour
  20,
  'Too many upload requests. Please try again later.'
);
