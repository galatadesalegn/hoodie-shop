import User from '../models/User.js';
import SecurityLog from '../models/SecurityLog.js';
import { logSecurityEvent, getClientInfo } from '../utils/securityLog.js';
import { AppError } from '../utils/response.js';
import { uploadAvatar } from '../config/cloudinary.js';

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
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments({ role: 'customer' });
    const customers = await User.find({ role: 'customer' }).sort('-createdAt').skip(skip).limit(Number(limit));
    res.json({ success: true, data: { customers, total } });
  } catch (error) {
    next(error);
  }
};

// Update admin profile
export const updateProfile = async (req, res, next) => {
  try {
    const { name, username, email } = req.body;
    const user = await User.findById(req.user._id);

    Object.assign(user, { name, username, email });
    await user.save();

    res.json({ success: true, message: 'Profile updated.', data: { user } });
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
    await user.save();

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
