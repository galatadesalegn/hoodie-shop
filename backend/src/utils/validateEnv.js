/**
 * Environment Variable Validation
 * Validates all required environment variables at startup
 * Application will fail fast if critical variables are missing
 */

const requiredEnvVars = {
  MONGODB_URI: {
    required: true,
    description: 'MongoDB connection string',
  },
  JWT_SECRET: {
    required: true,
    description: 'JWT secret key for access tokens',
    minLength: 32,
  },
  JWT_REFRESH_SECRET: {
    required: true,
    description: 'JWT secret key for refresh tokens',
    minLength: 32,
  },
  JWT_EXPIRE: {
    required: false,
    defaultValue: '15m',
    description: 'JWT access token expiration time',
  },
  JWT_REFRESH_EXPIRE: {
    required: false,
    defaultValue: '7d',
    description: 'JWT refresh token expiration time',
  },
  CLOUDINARY_CLOUD_NAME: {
    required: true,
    description: 'Cloudinary cloud name',
  },
  CLOUDINARY_API_KEY: {
    required: true,
    description: 'Cloudinary API key',
  },
  CLOUDINARY_API_SECRET: {
    required: true,
    description: 'Cloudinary API secret',
  },
  EMAILJS_SERVICE_ID: {
    required: true,
    description: 'EmailJS service ID',
  },
  EMAILJS_PUBLIC_KEY: {
    required: true,
    description: 'EmailJS public key',
  },
  EMAILJS_PRIVATE_KEY: {
    required: true,
    description: 'EmailJS private key (server-side)',
  },
  EMAILJS_TEMPLATE_OTP: {
    required: false,
    description: 'EmailJS template for OTP verification',
  },
  EMAILJS_TEMPLATE_ID: {
    required: false,
    description: 'Default EmailJS template (fallback if specific templates not set)',
  },
  PORT: {
    required: false,
    defaultValue: '5000',
    description: 'Server port',
  },
  NODE_ENV: {
    required: false,
    defaultValue: 'development',
    description: 'Environment (development/production)',
  },
  FRONTEND_URL: {
    required: true,
    description: 'Storefront URL for CORS and email links',
  },
  ADMIN_URL: {
    required: true,
    description: 'Admin panel URL for CORS',
  },
};

const optionalEnvVars = {
  EMAILJS_TEMPLATE_RESET: { description: 'EmailJS template for password reset' },
  EMAILJS_TEMPLATE_ORDER: { description: 'EmailJS template for order confirmation' },
  EMAILJS_TEMPLATE_EMAIL_CHANGE: { description: 'EmailJS template for email change' },
  TELEGRAM_USERNAME: { description: 'Telegram handle for order messages' },
};

const PLACEHOLDER_PATTERNS = ['placeholder', 'your_', 'changeme', 'example.com', 'your@'];

const normalizeAliases = () => {
  const aliases = {
    JWT_EXPIRES_IN: 'JWT_EXPIRE',
    JWT_REFRESH_EXPIRES_IN: 'JWT_REFRESH_EXPIRE',
  };
  for (const [alias, target] of Object.entries(aliases)) {
    if (process.env[alias] && !process.env[target]) {
      process.env[target] = process.env[alias];
    }
  }
};

const isPlaceholder = (value) => {
  const lower = (value || '').toLowerCase();
  return PLACEHOLDER_PATTERNS.some((pattern) => lower.includes(pattern));
};

export const validateEnv = () => {
  normalizeAliases();

  const errors = [];
  const warnings = [];

  for (const [key, config] of Object.entries(requiredEnvVars)) {
    const value = process.env[key];

    if (config.required && !value) {
      errors.push(`Missing required environment variable: ${key} (${config.description})`);
      continue;
    }

    if (value) {
      if (config.minLength && value.length < config.minLength) {
        errors.push(`${key} must be at least ${config.minLength} characters long`);
      }

      if (key === 'MONGODB_URI' && !value.startsWith('mongodb')) {
        errors.push(`${key} must be a valid MongoDB connection string`);
      }

      if ((key === 'FRONTEND_URL' || key === 'ADMIN_URL') && !value.startsWith('http')) {
        errors.push(`${key} must be a valid URL starting with http:// or https://`);
      }
    } else if (!config.required && config.defaultValue) {
      process.env[key] = config.defaultValue;
      warnings.push(`Using default value for ${key}: ${config.defaultValue}`);
    }
  }

  if (!process.env.EMAILJS_TEMPLATE_OTP && !process.env.EMAILJS_TEMPLATE_ID) {
    errors.push('Set EMAILJS_TEMPLATE_OTP or EMAILJS_TEMPLATE_ID for email verification');
  }

  for (const [key, config] of Object.entries(optionalEnvVars)) {
    if (!process.env[key]) {
      warnings.push(`Optional environment variable not set: ${key} (${config.description})`);
    }
  }

  for (const key of ['EMAILJS_SERVICE_ID', 'EMAILJS_PUBLIC_KEY', 'EMAILJS_PRIVATE_KEY']) {
    if (isPlaceholder(process.env[key])) {
      const msg = `${key} appears to be a placeholder — EmailJS will not work`;
      if (process.env.NODE_ENV === 'production') {
        errors.push(msg);
      } else {
        warnings.push(msg);
      }
    }
  }

  if (process.env.NODE_ENV === 'production') {
    if (!process.env.FRONTEND_URL?.startsWith('https://')) {
      errors.push('FRONTEND_URL must use https:// in production');
    }
    if (!process.env.ADMIN_URL?.startsWith('https://')) {
      errors.push('ADMIN_URL must use https:// in production');
    }
  }

  if (warnings.length > 0) {
    console.warn('\n⚠️  Environment Variable Warnings:');
    warnings.forEach((warning) => console.warn(`  - ${warning}`));
  }

  if (errors.length > 0) {
    console.error('\n❌ Environment Variable Validation Failed:');
    errors.forEach((error) => console.error(`  - ${error}`));
    console.error('\nPlease set all required environment variables before starting the application.');
    process.exit(1);
  }

  console.log('\n✅ Environment variables validated successfully');
  console.log('\n📋 Configuration:');
  console.log(`  Environment: ${process.env.NODE_ENV}`);
  console.log(`  Port: ${process.env.PORT}`);
  console.log(`  Database: ${process.env.MONGODB_URI ? '✓ Configured' : '✗ Missing'}`);
  console.log(`  Cloudinary: ${process.env.CLOUDINARY_CLOUD_NAME ? '✓ Configured' : '✗ Missing'}`);
  console.log(`  Email (EmailJS): ${process.env.EMAILJS_SERVICE_ID ? '✓ Configured' : '✗ Missing'}`);
  console.log(`  Storefront URL: ${process.env.FRONTEND_URL}`);
  console.log(`  Admin URL: ${process.env.ADMIN_URL}`);
  console.log('');
};

export default validateEnv;
