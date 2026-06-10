import mongoose from 'mongoose';

const securityLogSchema = new mongoose.Schema(
  {
    event: {
      type: String,
      required: true,
      enum: [
        'login_success', 'login_failed', 'login_blocked',
        'logout', 'password_changed', 'password_reset_requested',
        'password_reset_used', 'email_verified',
        'admin_created', 'admin_deleted', 'role_changed',
        'product_created', 'product_updated', 'product_deleted',
        'order_status_changed', 'suspicious_activity',
        'account_locked', 'token_refreshed',
      ],
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    targetId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ip: { type: String },
    userAgent: { type: String },
    details: { type: mongoose.Schema.Types.Mixed },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low',
    },
  },
  { timestamps: true }
);

securityLogSchema.index({ event: 1 });
securityLogSchema.index({ userId: 1 });
securityLogSchema.index({ createdAt: -1 });
securityLogSchema.index({ severity: 1 });

const SecurityLog = mongoose.model('SecurityLog', securityLogSchema);
export default SecurityLog;
