import crypto from 'crypto';
import User from '../models/User.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, setTokenCookies, clearTokenCookies } from '../utils/jwt.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email.js';
import { logSecurityEvent, getClientInfo } from '../utils/securityLog.js';
import { AppError } from '../utils/response.js';

// Register
export const register = async (req, res, next) => {
  try {
    const { name, username, email, password } = req.body;
    const info = getClientInfo(req);

    const user = await User.create({ name, username, email, password, role: 'customer' });
    const token = user.generateEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    try {
      await sendVerificationEmail(user.email, user.name, token);
    } catch (_) {}

    await logSecurityEvent({ event: 'login_success', userId: user._id, ...info, details: { action: 'register' }, severity: 'low' });

    res.status(201).json({
      success: true,
      message: 'Account created! Please check your email to verify your account.',
    });
  } catch (error) {
    next(error);
  }
};

// Verify Email
export const verifyEmail = async (req, res, next) => {
  try {
    const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      emailVerificationToken: hashed,
      emailVerificationExpires: { $gt: Date.now() },
    }).select('+emailVerificationToken +emailVerificationExpires');

    if (!user) return next(new AppError('Invalid or expired verification link.', 400));

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    await logSecurityEvent({ event: 'email_verified', userId: user._id, ...getClientInfo(req) });

    res.json({ success: true, message: 'Email verified successfully! You can now log in.' });
  } catch (error) {
    next(error);
  }
};

// Login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const info = getClientInfo(req);

    const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil +refreshTokens');

    // Generic error for security
    const invalidError = new AppError('Invalid email or password.', 401);

    if (!user) {
      await logSecurityEvent({ event: 'login_failed', ...info, details: { email }, severity: 'medium' });
      return next(invalidError);
    }

    if (user.isLocked()) {
      await logSecurityEvent({ event: 'login_blocked', userId: user._id, ...info, severity: 'high' });
      return next(new AppError('Account temporarily locked due to multiple failed attempts. Try again in 30 minutes.', 423));
    }

    if (!user.isActive) return next(new AppError('Account has been deactivated.', 401));

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.incrementLoginAttempts();
      await logSecurityEvent({ event: 'login_failed', userId: user._id, ...info, severity: 'medium' });
      return next(invalidError);
    }

    // Reset login attempts
    await user.updateOne({ $set: { loginAttempts: 0, lastLogin: Date.now() }, $unset: { lockUntil: 1 } });

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    // Store refresh token
    user.refreshTokens.push(refreshToken);
    if (user.refreshTokens.length > 5) user.refreshTokens.shift();
    await user.save({ validateBeforeSave: false });

    setTokenCookies(res, accessToken, refreshToken);

    await logSecurityEvent({ event: 'login_success', userId: user._id, ...info });

    res.json({
      success: true,
      message: 'Logged in successfully.',
      data: {
        user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, isEmailVerified: user.isEmailVerified },
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Refresh Token
export const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!token) return next(new AppError('No refresh token provided.', 401));

    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.id).select('+refreshTokens');

    if (!user || !user.refreshTokens.includes(token)) {
      return next(new AppError('Invalid refresh token.', 401));
    }

    // Rotate refresh token
    user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
    const newRefreshToken = generateRefreshToken(user._id);
    user.refreshTokens.push(newRefreshToken);
    await user.save({ validateBeforeSave: false });

    const accessToken = generateAccessToken(user._id, user.role);
    setTokenCookies(res, accessToken, newRefreshToken);

    await logSecurityEvent({ event: 'token_refreshed', userId: user._id, ...getClientInfo(req) });

    res.json({ success: true, data: { accessToken } });
  } catch (error) {
    next(new AppError('Invalid or expired refresh token.', 401));
  }
};

// Logout
export const logout = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token && req.user) {
      await User.findByIdAndUpdate(req.user._id, { $pull: { refreshTokens: token } });
    }
    clearTokenCookies(res);
    await logSecurityEvent({ event: 'logout', userId: req.user?._id, ...getClientInfo(req) });
    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    next(error);
  }
};

// Forgot Password
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // Always return same message for security
    const message = 'If an account with that email exists, a reset link has been sent.';

    if (!user) return res.json({ success: true, message });

    const token = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });

    try {
      await sendPasswordResetEmail(user.email, user.name, token);
    } catch (_) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return next(new AppError('Error sending email. Try again later.', 500));
    }

    await logSecurityEvent({ event: 'password_reset_requested', userId: user._id, ...getClientInfo(req) });

    res.json({ success: true, message });
  } catch (error) {
    next(error);
  }
};

// Reset Password
export const resetPassword = async (req, res, next) => {
  try {
    const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashed,
      passwordResetExpires: { $gt: Date.now() },
      passwordResetUsed: false,
    }).select('+passwordResetToken +passwordResetExpires +passwordResetUsed +refreshTokens');

    if (!user) return next(new AppError('Invalid or expired reset link.', 400));

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetUsed = true;
    user.refreshTokens = []; // Invalidate all sessions
    await user.save();

    await logSecurityEvent({ event: 'password_changed', userId: user._id, ...getClientInfo(req), details: { method: 'reset' } });

    res.json({ success: true, message: 'Password reset successful. Please log in.' });
  } catch (error) {
    next(error);
  }
};

// Get current user
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};

// Resend verification
export const resendVerification = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+emailVerificationToken +emailVerificationExpires');
    if (user.isEmailVerified) return next(new AppError('Email already verified.', 400));

    const token = user.generateEmailVerificationToken();
    await user.save({ validateBeforeSave: false });
    await sendVerificationEmail(user.email, user.name, token);

    res.json({ success: true, message: 'Verification email sent.' });
  } catch (error) {
    next(error);
  }
};

// Update profile (name only as requested)
export const updateProfile = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) return next(new AppError('Name is required.', 400));

    const user = await User.findById(req.user._id);
    user.name = name;
    await user.save({ validateBeforeSave: false });

    res.json({ success: true, message: 'Profile updated successfully.', data: { user } });
  } catch (error) {
    next(error);
  }
};
