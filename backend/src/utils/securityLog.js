import SecurityLog from '../models/SecurityLog.js';
import logger from './logger.js';

export const logSecurityEvent = async ({
  event,
  userId = null,
  targetId = null,
  ip = '',
  userAgent = '',
  details = {},
  severity = 'low',
}) => {
  try {
    await SecurityLog.create({ event, userId, targetId, ip, userAgent, details, severity });
  } catch (error) {
    logger.error(`Security log error: ${error.message}`);
  }
};

export const getClientInfo = (req) => ({
  ip: req.ip || req.connection.remoteAddress,
  userAgent: req.headers['user-agent'] || '',
});
