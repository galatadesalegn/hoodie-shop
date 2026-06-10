import User from '../models/User.js';
import SecurityLog from '../models/SecurityLog.js';
import crypto from 'crypto';
import { logSecurityEvent, getClientInfo } from '../utils/securityLog.js';
import { AppError } from '../utils/response.js';
import { uploadAvatar } from '../config/cloudinary.js';
import { sendEmailChangeVerification } from '../utils/email.js';
import { clearTokenCookies } from '../utils/jwt.js';

// Super Admin: Get all admins
export const getAdmins = async (req, res, next) => {
  try {
    const admins = await User.find({ role: { $in: ['admin', 'superadmin'] } }).select('-__v').sort('-createdAt');
    res.json({ success: true, data: { admins } });
  } catch (error) {
    next(error);
  }
};

// Super Admin: Create admin
export const createAdmin = async (req, res, next) => {
  try {
    const { name, username, email, password, role = 'admin' } = req.body;

    if (role === 'superadmin' && req.user.role !== 'superadmin') {
      return next(new AppError('Only super admins can create super admin accounts.', 403));
    }

    const admin = await User.create({ name, username, email, password, role, isEmailVerified: true });

    await logSecurityEvent({ event: 'admin_created', userId: req.user._id, targetId: admin._id, ...getClientInfo(req), details: { email, role }, severity: 'high' });

    res.status(201).json({ success: true, message: 'Admin created successfully.', data: { admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role } } });
  } catch (error) {
    next(error);
  }
};

// Super Admin: Update admin
export const updateAdmin = async (req, res, next) => {
  try {
    const { name, username, email, role } = req.body;
    const admin = await User.findById(req.params.id);
    if (!admin) return next(new AppError('Admin not found.', 404));
    if (!['admin', 'superadmin'].includes(admin.role)) return next(new AppError('User is not an admin.', 400));

    const oldRole = admin.role;
    Object.assign(admin, { name, username, email, role });
    await admin.save();

    if (oldRole !== role) {
      await logSecurityEvent({ event: 'role_changed', userId: req.user._id, targetId: admin._id, ...getClientInfo(req), details: { from: oldRole, to: role }, severity: 'high' });
    }

    res.json({ success: true, message: 'Admin updated.', data: { admin } });
  } catch (error) {
    next(error);
  }
};

// Super Admin: Delete admin
export const deleteAdmin = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) return next(new AppError('Cannot delete your own account.', 400));

    const admin = await User.findById(req.params.id);
    if (!admin) return next(new AppError('Admin not found.', 404));
    if (!['admin', 'superadmin'].includes(admin.role)) return next(new AppError('User is not an admin.', 400));

    await admin.deleteOne();

    await logSecurityEvent({ event: 'admin_deleted', userId: req.user._id, targetId: admin._id, ...getClientInfo(req), details: { email: admin.email }, severity: 'critical' });

    res.json({ success: true, message: 'Admin deleted.' });
  } catch (error) {
    next(error);
  }
};

// Get all customers
export const getCustomers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    const filter = { role: 'customer' };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }
    if (status === 'active') filter.isEmailVerified = true;
    else if (status === 'pending') filter.isEmailVerified = false;

    const total = await User.countDocuments(filter);
    const customersRaw = await User.find(filter).sort('-createdAt').skip(skip).limit(Number(limit)).lean();

    const Order = (await import('../models/Order.js')).default;
    const customerIds = customersRaw.map(c => c._id);
    const spendings = await Order.aggregate([
      { $match: { 'customer.userId': { $in: customerIds }, status: { $ne: 'cancelled' } } },
      { $group: { _id: '$customer.userId', totalSpent: { $sum: '$totalAmount' } } }
    ]);

    const spendingMap = spendings.reduce((acc, curr) => {
      acc[curr._id.toString()] = curr.totalSpent;
      return acc;
    }, {});

    const customers = customersRaw.map(c => ({
      ...c,
      id: c._id,
      totalSpent: spendingMap[c._id.toString()] || 0
    }));

    res.json({ success: true, data: { customers, total } });
  } catch (error) {
    next(error);
  }
};

// Update admin profile
export const updateProfile = async (req, res, next) => {
  try {
    const { name, username, email } = req.body;
    const user = await User.findById(req.user._id).select('+emailChangeToken +emailChangeExpires +pendingEmail +refreshTokens');
    // Name update
    if (name) user.name = name;

    // Username update: ensure uniqueness and invalidate sessions
    if (username && username !== user.username) {
      const existing = await User.findOne({ username });
      if (existing) return next(new AppError('Username is already taken.', 400));
      user.username = username;
      // Invalidate refresh tokens to force re-authentication
      user.refreshTokens = [];
      await logSecurityEvent({ event: 'username_changed', userId: req.user._id, targetId: user._id, ...getClientInfo(req), details: { username }, severity: 'medium' });
    }

    // Email change: use OTP verification (set pending email and send OTP)
    if (email && email !== user.email) {
      // Check if email already used
      const emailTaken = await User.findOne({ email });
      if (emailTaken) return next(new AppError('Email is already in use by another account.', 400));

      // Create OTP and set pending email
      const otp = String(crypto.randomInt(100000, 1000000));
      const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
      user.pendingEmail = email;
      user.emailChangeToken = hashedOtp;
      user.emailChangeExpires = Date.now() + 15 * 60 * 1000; // 15 min

      // Send OTP email
      try {
        const { sendVerificationOtpEmail } = await import('../utils/email.js');
        await sendVerificationOtpEmail(email, user.name, otp);
      } catch (err) {
        // cleanup pending fields on failure
        user.pendingEmail = undefined;
        user.emailChangeToken = undefined;
        user.emailChangeExpires = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new AppError('Could not send verification code. Try again later.', 500));
      }

      await user.save({ validateBeforeSave: false });

      await logSecurityEvent({ event: 'email_change_requested', userId: req.user._id, targetId: user._id, ...getClientInfo(req), details: { to: email }, severity: 'medium' });

      return res.json({ success: true, message: 'Verification code sent to your new email. Please verify to complete the change.' });
    }

    await user.save({ validateBeforeSave: false });

    res.json({ success: true, message: 'Profile updated successfully.', data: { user } });
  } catch (error) {
    next(error);
  }
};

// Verify email change
export const verifyEmailChange = async (req, res, next) => {
  try {
    const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      emailChangeToken: hashed,
      emailChangeExpires: { $gt: Date.now() },
    }).select('+emailChangeToken +emailChangeExpires +pendingEmail');

    if (!user) return next(new AppError('Invalid or expired verification link.', 400));

    const oldEmail = user.email;
    user.email = user.pendingEmail;
    user.pendingEmail = undefined;
    user.emailChangeToken = undefined;
    user.emailChangeExpires = undefined;
    await user.save({ validateBeforeSave: false });

    await logSecurityEvent({ 
      event: 'email_changed', 
      userId: user._id, 
      ...getClientInfo(req), 
      details: { from: oldEmail, to: user.email },
      severity: 'medium'
    });

    res.json({ success: true, message: 'Email updated successfully!' });
  } catch (error) {
    next(error);
  }
};

// Change password
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.comparePassword(currentPassword))) {
      return next(new AppError('Current password is incorrect.', 400));
    }

    user.password = newPassword;
    user.passwordChangedAt = Date.now();
    // Invalidate all refresh tokens so existing sessions are logged out
    user.refreshTokens = [];
    await user.save({ validateBeforeSave: false });

    clearTokenCookies(res);

    await logSecurityEvent({ event: 'password_changed', userId: user._id, ...getClientInfo(req), details: { method: 'settings' }, severity: 'medium' });

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    next(error);
  }
};

// Upload avatar
export const uploadProfileAvatar = (req, res, next) => {
  uploadAvatar(req, res, async (err) => {
    if (err) return next(new AppError(err.message, 400));
    try {
      const user = await User.findById(req.user._id);
      user.avatar = { url: req.file.path, publicId: req.file.filename };
      await user.save({ validateBeforeSave: false });
      res.json({ success: true, message: 'Avatar updated.', data: { avatar: user.avatar } });
    } catch (error) {
      next(error);
    }
  });
};

// Verify admin email OTP
export const verifyAdminEmailOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const hashed = crypto.createHash('sha256').update(String(otp).trim()).digest('hex');

    const user = await User.findById(req.user._id).select('+emailChangeToken +emailChangeExpires +pendingEmail +refreshTokens');
    
    if (!user.pendingEmail || user.pendingEmail !== email) {
      return next(new AppError('No pending email change found.', 400));
    }

    if (user.emailChangeToken !== hashed || !user.emailChangeExpires || user.emailChangeExpires < Date.now()) {
      return next(new AppError('Invalid or expired verification code.', 400));
    }

    // Update email (preserve refreshTokens and other sensitive fields)
    const oldEmail = user.email;
    user.email = email;
    user.pendingEmail = undefined;
    user.emailChangeToken = undefined;
    user.emailChangeExpires = undefined;
    // Ensure refreshTokens is initialized as empty array if it doesn't exist
    if (!user.refreshTokens) user.refreshTokens = [];
    await user.save({ validateBeforeSave: false });

    await logSecurityEvent({
      event: 'email_changed',
      userId: user._id,
      ...getClientInfo(req),
      details: { from: oldEmail, to: email },
      severity: 'medium',
    });

    res.json({ success: true, message: 'Email verified and updated successfully.', data: { user } });
  } catch (error) {
    next(error);
  }
};

// Security logs (super admin)
export const getSecurityLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, event, severity } = req.query;
    const filter = {};
    if (event) filter.event = event;
    if (severity) filter.severity = severity;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await SecurityLog.countDocuments(filter);
    const logs = await SecurityLog.find(filter)
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit))
      .populate('userId', 'name email')
      .populate('targetId', 'name email');

    res.json({ success: true, data: { logs, total } });
  } catch (error) {
    next(error);
  }
};
