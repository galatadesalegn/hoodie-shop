/**
 * Environment Variable Validation
 * Validates all required environment variables at startup
 * Application will fail fast if critical variables are missing
 */

const requiredEnvVars = {
  // Database
  MONGODB_URI: {
    required: true,
    description: 'MongoDB connection string',
  },
  
  // JWT
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
  
  // Cloudinary
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
  
  // Email
  SMTP_HOST: {
    required: true,
    description: 'Email server host',
  },
  SMTP_PORT: {
    required: true,
    description: 'Email server port',
  },
  SMTP_USER: {
    required: true,
    description: 'Email server username',
  },
  SMTP_PASS: {
    required: true,
    description: 'Email server password',
  },
  SMTP_FROM_EMAIL: {
    required: true,
    description: 'Sender email address',
  },
  
  // Server
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
  
  // Frontend
  FRONTEND_URL: {
    required: true,
    description: 'Frontend URL for CORS',
  },
};

const optionalEnvVars = {
  // Additional optional variables can be added here
};

/**
 * Validate environment variables
 * @throws {Error} If required environment variables are missing or invalid
 */
export const validateEnv = () => {
  const errors = [];
  const warnings = [];

  // Validate required environment variables
  for (const [key, config] of Object.entries(requiredEnvVars)) {
    const value = process.env[key];

    if (config.required && !value) {
      errors.push(`Missing required environment variable: ${key} (${config.description})`);
      continue;
    }

    if (value) {
      // Check minimum length if specified
      if (config.minLength && value.length < config.minLength) {
        errors.push(`${key} must be at least ${config.minLength} characters long`);
      }

      // Validate specific formats
      if (key === 'MONGODB_URI' && !value.startsWith('mongodb')) {
        errors.push(`${key} must be a valid MongoDB connection string`);
      }

      if (key === 'FRONTEND_URL' && !value.startsWith('http')) {
        errors.push(`${key} must be a valid URL starting with http:// or https://`);
      }

      if (key === 'SMTP_FROM_EMAIL' && !value.includes('@')) {
        errors.push(`${key} must be a valid email address`);
      }
    } else if (!config.required && config.defaultValue) {
      // Use default value for optional variables
      process.env[key] = config.defaultValue;
      warnings.push(`Using default value for ${key}: ${config.defaultValue}`);
    }
  }

  // Check for optional variables
  for (const [key, config] of Object.entries(optionalEnvVars)) {
    if (!process.env[key]) {
      warnings.push(`Optional environment variable not set: ${key} (${config.description})`);
    }
  }

  // Log warnings
  if (warnings.length > 0) {
    console.warn('\n⚠️  Environment Variable Warnings:');
    warnings.forEach(warning => console.warn(`  - ${warning}`));
  }

  // Fail fast if there are errors
  if (errors.length > 0) {
    console.error('\n❌ Environment Variable Validation Failed:');
    errors.forEach(error => console.error(`  - ${error}`));
    console.error('\nPlease set all required environment variables before starting the application.');
    process.exit(1);
  }

  console.log('\n✅ Environment variables validated successfully');
  
  // Log configuration (without sensitive values)
  console.log('\n📋 Configuration:');
  console.log(`  Environment: ${process.env.NODE_ENV}`);
  console.log(`  Port: ${process.env.PORT}`);
  console.log(`  Database: ${process.env.MONGODB_URI ? '✓ Configured' : '✗ Missing'}`);
  console.log(`  Cloudinary: ${process.env.CLOUDINARY_CLOUD_NAME ? '✓ Configured' : '✗ Missing'}`);
  console.log(`  Email: ${process.env.EMAIL_HOST ? '✓ Configured' : '✗ Missing'}`);
  console.log(`  Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log('');
};

export default validateEnv;
