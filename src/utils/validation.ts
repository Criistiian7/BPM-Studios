/**
 * Utility functions for validation
 */

/**
 * Validate email format
 * @param email - Email address to validate
 * @returns True if email is valid
 */
export const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/**
 * Validate file size
 * @param file - File to validate
 * @param maxSize - Maximum size in bytes
 * @returns True if file size is within limit
 */
export const validateFileSize = (file: File, maxSize: number): boolean => {
  return file.size <= maxSize;
};

/**
 * Validate file type
 * @param file - File to validate
 * @param allowedTypes - Array of allowed MIME type prefixes
 * @returns True if file type is allowed
 */
export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.some((type) => file.type.startsWith(type));
};

