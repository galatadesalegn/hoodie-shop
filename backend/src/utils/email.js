import nodemailer from 'nodemailer';
import logger from './logger.js';

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const brandColor = '#1a1a2e';
const accentColor = '#e94560';

const baseTemplate = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HoodVault</title>
  <style>
    body { margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background: #f4f4f4; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: ${brandColor}; padding: 32px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 4px; }
    .header span { color: ${accentColor}; }
    .body { padding: 40px 32px; }
    .body h2 { color: ${brandColor}; margin-top: 0; }
    .body p { color: #555; line-height: 1.7; }
    .btn { display: inline-block; background: ${accentColor}; color: #fff !important; text-decoration: none; padding: 14px 32px; border-radius: 4px; font-weight: 600; letter-spacing: 1px; margin: 16px 0; }
    .footer { background: #f9f9f9; padding: 20px 32px; text-align: center; }
    .footer p { color: #999; font-size: 12px; margin: 4px 0; }
    .divider { height: 1px; background: #eee; margin: 24px 0; }
    .code-box { background: #f4f4f4; border-left: 4px solid ${accentColor}; padding: 12px 16px; font-family: monospace; font-size: 18px; letter-spacing: 4px; font-weight: bold; color: ${brandColor}; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>HOOD<span>VAULT</span></h1>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} HoodVault. All rights reserved.</p>
      <p>Premium Hoodies | Addis Ababa, Ethiopia</p>
    </div>
  </div>
</body>
</html>
`;

export const sendVerificationEmail = async (email, name, token) => {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  const html = baseTemplate(`
    <h2>Verify Your Email Address</h2>
    <p>Hi ${name},</p>
    <p>Welcome to HoodVault! Please verify your email address to activate your account.</p>
    <p>This link expires in <strong>15 minutes</strong>.</p>
    <a href="${verifyUrl}" class="btn">Verify Email</a>
    <div class="divider"></div>
    <p style="font-size:13px;color:#999;">If you didn't create an account, you can safely ignore this email.</p>
  `);

  await sendEmail({ to: email, subject: 'Verify your HoodVault account', html });
};

export const sendPasswordResetEmail = async (email, name, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  const html = baseTemplate(`
    <h2>Reset Your Password</h2>
    <p>Hi ${name},</p>
    <p>We received a request to reset your password. Click the button below to set a new password.</p>
    <p>This link expires in <strong>15 minutes</strong> and can only be used once.</p>
    <a href="${resetUrl}" class="btn">Reset Password</a>
    <div class="divider"></div>
    <p style="font-size:13px;color:#999;">If you didn't request this, please ignore this email. Your password remains unchanged.</p>
  `);

  await sendEmail({ to: email, subject: 'Reset your HoodVault password', html });
};

export const sendEmailChangeVerification = async (email, name, token) => {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email-change?token=${token}`;
  const html = baseTemplate(`
    <h2>Verify Email Change</h2>
    <p>Hi ${name},</p>
    <p>You requested to change your email to <strong>${email}</strong>. Please click the button below to verify this change.</p>
    <p>This link expires in <strong>1 hour</strong>.</p>
    <a href="${verifyUrl}" class="btn">Verify Change</a>
    <div class="divider"></div>
    <p style="font-size:13px;color:#999;">If you didn't request this change, you can safely ignore this email.</p>
  `);

  await sendEmail({ to: email, subject: 'Verify your new email address', html });
};

export const sendOrderConfirmationEmail = async (email, name, order) => {
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #eee;">${item.hoodieName}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;">${item.size} / ${item.color}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;">${item.quantity}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;">ETB ${item.subtotal}</td>
    </tr>
  `).join('');

  const html = baseTemplate(`
    <h2>Order Confirmed! 🎉</h2>
    <p>Hi ${name},</p>
    <p>Your order <strong>#${order.orderNumber}</strong> has been received. Our team will contact you via Telegram to confirm delivery details.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:16px 0;">
      <thead>
        <tr style="background:#f4f4f4;">
          <th style="padding:8px;text-align:left;">Product</th>
          <th style="padding:8px;text-align:left;">Variant</th>
          <th style="padding:8px;text-align:left;">Qty</th>
          <th style="padding:8px;text-align:left;">Price</th>
        </tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
    </table>
    <p><strong>Total: ETB ${order.totalAmount}</strong></p>
    <p style="font-size:13px;color:#999;">Thank you for shopping with HoodVault!</p>
  `);

  await sendEmail({ to: email, subject: `Order Confirmed - #${order.orderNumber}`, html });
};

const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
      to,
      subject,
      html,
    });
    logger.info(`Email sent to ${to}: ${subject}`);
  } catch (error) {
    logger.error(`Email send error: ${error.message}`);
    throw new Error('Email could not be sent');
  }
};

export default sendEmail;
