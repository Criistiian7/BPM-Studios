/**
 * Centralized localStorage utility
 * Provides safe, typed access to localStorage with error handling
 */

/**
 * Saves data to localStorage with automatic JSON serialization
 * @param key - Storage key
 * @param value - Value to store (will be JSON stringified)
 */
export const storage = {
  set: (key: string, value: any): void => {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },

  /**
   * Retrieves data from localStorage with automatic JSON parsing
   * @param key - Storage key
   * @param defaultValue - Default value if key doesn't exist
   * @returns Parsed value or default value
   */
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Failed to read from localStorage:', error);
      return defaultValue;
    }
  },

  /**
   * Removes a key from localStorage
   * @param key - Storage key to remove
   */
  remove: (key: string): void => {
    localStorage.removeItem(key);
  },

  /**
   * Clears all data from localStorage
   */
  clear: (): void => {
    localStorage.clear();
  },

  /**
   * Checks if a key exists in localStorage
   * @param key - Storage key to check
   * @returns true if key exists
   */
  has: (key: string): boolean => {
    return localStorage.getItem(key) !== null;
  }
};

/**
 * Storage keys used throughout the application
 * Prevents typos and centralizes key management
 */
export const STORAGE_KEYS = {
  THEME: "theme",
  LOGIN_EMAIL: "bpm_login_email",
  REGISTER_FORM: "bpm_register_form_data",
  PROFILE_EDIT_FORM: "bpm_profile_edit_form_data",
  USER_PREFERENCES: "bpm_user_preferences",
} as const;

