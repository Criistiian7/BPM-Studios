/**
 * Logger utility for development and production environments
 * In production, console logs are disabled to improve performance and security
 */

const isDev = import.meta.env.DEV;

export const logger = {
  /**
   * Log general information (only in development)
   */
  log: (...args: unknown[]) => {
    if (isDev) {
      console.log(...args);
    }
  },

  /**
   * Log errors (enabled in both dev and prod)
   */
  error: (...args: unknown[]) => {
    if (isDev) {
      console.error(...args);
    } else {
      // In production, you might want to send errors to a service like Sentry
      // For now, we still log errors in production for debugging
      console.error(...args);
    }
  },

  /**
   * Log warnings (only in development)
   */
  warn: (...args: unknown[]) => {
    if (isDev) {
      console.warn(...args);
    }
  },

  /**
   * Log debug information (only in development)
   */
  debug: (...args: unknown[]) => {
    if (isDev) {
      console.debug(...args);
    }
  },
};
