import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param dirty - The dirty HTML string to sanitize
 * @returns Sanitized HTML string
 */
export const sanitizeHTML = (dirty: string): string => {
  if (typeof dirty !== 'string') return '';
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'span'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
    ALLOW_DATA_ATTR: false,
  });
};

/**
 * Sanitize text content (strip all HTML)
 * @param dirty - The dirty string to sanitize
 * @returns Sanitized plain text string
 */
export const sanitizeText = (dirty: string): string => {
  if (typeof dirty !== 'string') return '';
  return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [] });
};

/**
 * Sanitize user input for display in attributes
 * @param dirty - The dirty string to sanitize
 * @returns Sanitized string safe for attributes
 */
export const sanitizeAttribute = (dirty: string): string => {
  if (typeof dirty !== 'string') return '';
  return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
};
