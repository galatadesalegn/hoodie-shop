import emailjs, { EmailJSResponseStatus } from '@emailjs/nodejs';
import logger from './logger.js';

const getEmailJsConfig = () => ({
  publicKey: process.env.EMAILJS_PUBLIC_KEY,
  privateKey: process.env.EMAILJS_PRIVATE_KEY,
});

const getTemplateId = (specificTemplate) =>
  specificTemplate || process.env.EMAILJS_TEMPLATE_ID;

/** EmailJS templates use different variable names for the recipient — send all common ones */
const withRecipient = (email, name, params) => ({
  email,
  to_email: email,
  user_email: email,
  recipient: email,
  to_name: name,
  name,
  from_name: process.env.EMAILJS_FROM_NAME || 'HoodVault',
  ...params,
});

const sendViaEmailJs = async (templateId, templateParams) => {
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const config = getEmailJsConfig();

  if (!serviceId || !config.publicKey || !templateId) {
    throw new Error('EmailJS is not configured. Set EMAILJS_SERVICE_ID, EMAILJS_PUBLIC_KEY, and template IDs.');
  }

  try {
    const response = await emailjs.send(
      serviceId,
      templateId,
      templateParams,
      config,
    );
    logger.info(`Email sent via EmailJS (${response.status}): ${templateParams.subject || templateParams.to_email}`);
    return response;
  } catch (error) {
    if (error instanceof EmailJSResponseStatus) {
      logger.error(`EmailJS error ${error.status}: ${error.text}`);
      throw new Error(error.text || 'Email could not be sent');
    }
    logger.error(`Email send error: ${error.message}`);
    throw error;
  }
};

export const sendVerificationOtpEmail = async (email, name, otp) => {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?email=${encodeURIComponent(email)}`;
  const time = new Date(Date.now() + 15 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  await sendViaEmailJs(getTemplateId(process.env.EMAILJS_TEMPLATE_OTP), withRecipient(email, name, {
    subject: `${otp} — Verify your HoodVault account`,
    otp,
    verification_code: otp,
    code: otp,
    passcode: otp, // Matches ASTU-GEBEYA template
    time, // Matches ASTU-GEBEYA template
    verify_url: verifyUrl,
    message: `Your HoodVault verification code is ${otp}. It expires in 15 minutes.`,
  }));
};

export const sendVerificationEmail = async (email, name, token) => {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  await sendViaEmailJs(getTemplateId(process.env.EMAILJS_TEMPLATE_OTP), withRecipient(email, name, {
    subject: 'Verify your HoodVault account',
    verify_url: verifyUrl,
    message: `Hi ${name}, verify your email: ${verifyUrl}`,
  }));
};

export const sendPasswordResetEmail = async (email, name, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  await sendViaEmailJs(getTemplateId(process.env.EMAILJS_TEMPLATE_RESET), withRecipient(email, name, {
    subject: 'Reset your HoodVault password',
    reset_url: resetUrl,
    message: `Hi ${name}, reset your password: ${resetUrl}. Link expires in 15 minutes.`,
  }));
};

export const sendEmailChangeVerification = async (email, name, token) => {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email-change?token=${token}`;

  await sendViaEmailJs(getTemplateId(process.env.EMAILJS_TEMPLATE_EMAIL_CHANGE), withRecipient(email, name, {
    subject: 'Verify your new email address',
    verify_url: verifyUrl,
    message: `Hi ${name}, confirm your new email: ${verifyUrl}`,
  }));
};

export const sendOrderConfirmationEmail = async (email, name, order) => {
  const itemsSummary = order.items
    .map((item) => `${item.hoodieName} (${item.size}/${item.color}) x${item.quantity} — ETB ${item.subtotal}`)
    .join('\n');

  await sendViaEmailJs(getTemplateId(process.env.EMAILJS_TEMPLATE_ORDER), withRecipient(email, name, {
    subject: `Order Confirmed - #${order.orderNumber}`,
    order_number: order.orderNumber,
    order_total: String(order.totalAmount),
    order_items: itemsSummary,
    message: `Hi ${name}, your order #${order.orderNumber} is confirmed. Total: ETB ${order.totalAmount}`,
  }));
};

export default sendViaEmailJs;
