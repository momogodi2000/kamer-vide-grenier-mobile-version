import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Simple date utilities to replace date-fns
const isValid = (date: any): boolean => {
  return date instanceof Date && !isNaN(date.getTime());
};

const parseISO = (dateString: string): Date => {
  return new Date(dateString);
};

const format = (date: Date, _formatStr: string): string => {
  // Simple date formatting - you might want to use a more robust solution
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};
import {
  API_BASE_URL,
  API_TIMEOUT,
  API_RETRIES,
  ERROR_MESSAGES,
  VALIDATION_RULES,
  CURRENCIES,
  LANGUAGES,
  REGIONS,
  PRODUCT_CONDITIONS,
  PRODUCT_STATUSES,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  DELIVERY_STATUSES,
  KYC_STATUSES,
  WITHDRAWAL_STATUSES,
  TRANSACTION_TYPES,
  USER_ROLES,
  PAYMENT_METHODS,
  DELIVERY_METHODS,
  PAYMENT_PROVIDERS,
  DOCUMENT_TYPES,
  BUSINESS_TYPES,
  GENDERS,
  NOTIFICATION_TYPES,
  MESSAGE_TYPES,
  CHAT_PARTICIPANT_TYPES,
  ANALYTICS_EVENTS,
} from './constants';

// Storage Keys
export const STORAGE_KEYS = {
  USER_TOKEN: 'user_token',
  USER_DATA: 'user_data',
  USER_ROLE: 'user_role',
  LANGUAGE: 'language',
  CURRENCY: 'currency',
  THEME: 'theme',
  NOTIFICATIONS_ENABLED: 'notifications_enabled',
  LOCATION_PERMISSION: 'location_permission',
  BIOMETRIC_ENABLED: 'biometric_enabled',
  CART_ITEMS: 'cart_items',
  RECENT_SEARCHES: 'recent_searches',
  FAVORITE_PRODUCTS: 'favorite_products',
  OFFLINE_DATA: 'offline_data',
  CACHE_TIMESTAMP: 'cache_timestamp',
} as const;

// Date Utilities
export const formatDate = (date: string | Date, formatStr: string = 'dd/MM/yyyy'): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) {
      return 'Date invalide';
    }
    return format(dateObj, formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Date invalide';
  }
};

export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, 'dd/MM/yyyy HH:mm');
};

export const formatRelativeTime = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const now = new Date();
    const diffInMs = now.getTime() - dateObj.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    if (diffInHours < 24) return `Il y a ${diffInHours} h`;
    if (diffInDays < 7) return `Il y a ${diffInDays} j`;
    return formatDate(dateObj);
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return 'Date invalide';
  }
};

// Currency Utilities
export const formatCurrency = (amount: number, currency: string = CURRENCIES.XAF): string => {
  try {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `${amount} ${currency}`;
  }
};

export const parseCurrency = (value: string): number => {
  try {
    const cleaned = value.replace(/[^\d.,]/g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
  } catch (error) {
    console.error('Error parsing currency:', error);
    return 0;
  }
};

// Validation Utilities
export const validateEmail = (email: string): boolean => {
  return VALIDATION_RULES.EMAIL_REGEX.test(email);
};

export const validatePhone = (phone: string): boolean => {
  return VALIDATION_RULES.PHONE_REGEX.test(phone);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= VALIDATION_RULES.PASSWORD_MIN_LENGTH;
};

export const validateName = (name: string): boolean => {
  return name.length >= VALIDATION_RULES.NAME_MIN_LENGTH &&
         name.length <= VALIDATION_RULES.NAME_MAX_LENGTH;
};

export const validateRequired = (value: any): boolean => {
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return value != null && value !== undefined;
};

// Storage Utilities
export const setStorageItem = async (key: string, value: any): Promise<void> => {
  try {
    const serializedValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, serializedValue);
  } catch (error) {
    console.error(`Error setting storage item ${key}:`, error);
    throw error;
  }
};

export const getStorageItem = async <T>(key: string): Promise<T | null> => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error(`Error getting storage item ${key}:`, error);
    return null;
  }
};

export const removeStorageItem = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing storage item ${key}:`, error);
    throw error;
  }
};

export const clearStorage = async (): Promise<void> => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Error clearing storage:', error);
    throw error;
  }
};

// Network Utilities
export const isNetworkError = (error: any): boolean => {
  return !error.response || error.code === 'NETWORK_ERROR';
};

export const getErrorMessage = (error: any): string => {
  if (isNetworkError(error)) return ERROR_MESSAGES.NETWORK_ERROR;
  if (error.response) {
    const status = error.response.status;
    switch (status) {
      case 401: return ERROR_MESSAGES.UNAUTHORIZED;
      case 403: return ERROR_MESSAGES.FORBIDDEN;
      case 404: return ERROR_MESSAGES.NOT_FOUND;
      case 500: return ERROR_MESSAGES.SERVER_ERROR;
      default: return error.response.data?.message || ERROR_MESSAGES.UNKNOWN_ERROR;
    }
  }
  return error.message || ERROR_MESSAGES.UNKNOWN_ERROR;
};

// Device Utilities
export const isIOS = (): boolean => Platform.OS === 'ios';
export const isAndroid = (): boolean => Platform.OS === 'android';

export const getDeviceInfo = () => {
  return {
    platform: Platform.OS,
    version: Platform.Version,
    isIOS: isIOS(),
    isAndroid: isAndroid(),
  };
};

// Array Utilities
export const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

export const unique = <T>(array: T[]): T[] => {
  return [...new Set(array)];
};

export const shuffle = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// String Utilities
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const truncate = (str: string, length: number): string => {
  return str.length > length ? str.substring(0, length) + '...' : str;
};

export const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

// Object Utilities
export const isEmpty = (obj: any): boolean => {
  if (obj == null) return true;
  if (Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === 'string') return obj.trim().length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return false;
};

export const pick = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
};

export const omit = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach(key => {
    delete result[key];
  });
  return result;
};

// Debounce Utility
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle Utility
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => { inThrottle = false; }, limit);
    }
  };
};

// Location Utilities
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export const formatDistance = (distance: number): string => {
  if (distance < 1) return `${Math.round(distance * 1000)} m`;
  return `${distance.toFixed(1)} km`;
};

// File Utilities
export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

export const getFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const isImageFile = (filename: string): boolean => {
  const ext = getFileExtension(filename);
  return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
};

export const isVideoFile = (filename: string): boolean => {
  const ext = getFileExtension(filename);
  return ['mp4', 'avi', 'mov', 'wmv'].includes(ext);
};

// Permission Utilities
export const checkPermissions = async (_permissions: string[]): Promise<boolean> => {
  // This would be implemented with react-native-permissions
  // For now, return true as a placeholder
  return true;
};

// Analytics Utilities
export const trackEvent = (event: string, properties?: Record<string, any>): void => {
  // This would be implemented with analytics service
  console.log('Track event:', event, properties);
};

export const trackScreen = (screenName: string): void => {
  trackEvent(ANALYTICS_EVENTS.USER_LOGIN, { screen: screenName });
};

// Deep Clone Utility
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (Array.isArray(obj)) return obj.map(item => deepClone(item)) as unknown as T;
  const clonedObj = {} as T;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      clonedObj[key] = deepClone(obj[key]);
    }
  }
  return clonedObj;
};

// Sleep Utility
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Retry Utility
export const retry = async <T>(
  fn: () => Promise<T>,
  retries: number = API_RETRIES,
  delay: number = 1000
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await sleep(delay);
      return retry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

// Export all constants for convenience
export {
  API_BASE_URL,
  API_TIMEOUT,
  API_RETRIES,
  ERROR_MESSAGES,
  VALIDATION_RULES,
  CURRENCIES,
  LANGUAGES,
  REGIONS,
  PRODUCT_CONDITIONS,
  PRODUCT_STATUSES,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  DELIVERY_STATUSES,
  KYC_STATUSES,
  WITHDRAWAL_STATUSES,
  TRANSACTION_TYPES,
  USER_ROLES,
  PAYMENT_METHODS,
  DELIVERY_METHODS,
  PAYMENT_PROVIDERS,
  DOCUMENT_TYPES,
  BUSINESS_TYPES,
  GENDERS,
  NOTIFICATION_TYPES,
  MESSAGE_TYPES,
  CHAT_PARTICIPANT_TYPES,
  ANALYTICS_EVENTS,
};
