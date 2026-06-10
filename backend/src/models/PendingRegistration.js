import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const pendingRegistrationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    otpToken: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 900, // TTL index: automatically delete after 15 minutes (900 seconds)
    },
  }
);

// Hash password before saving
pendingRegistrationSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Generate OTP
pendingRegistrationSchema.methods.generateOtp = function () {
  const otp = String(crypto.randomInt(100000, 1000000));
  this.otpToken = crypto.createHash('sha256').update(otp).digest('hex');
  return otp;
};

const PendingRegistration = mongoose.model('PendingRegistration', pendingRegistrationSchema);
export default PendingRegistration;
