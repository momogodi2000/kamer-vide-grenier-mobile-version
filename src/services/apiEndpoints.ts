// API Endpoints Configuration - Kamer Vidé Grenier Mobile App
// This file maps all backend API endpoints for easy reference and maintenance

import { configService } from './configService';

export const API_ENDPOINTS = {
  // Base URLs
  BASE_URL: configService.getApiBaseUrl(),
  IMAGE_BASE_URL: configService.getImageBaseUrl(),

  // Authentication Endpoints
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
    VERIFY_EMAIL: '/auth/verify-email',
    VERIFY_EMAIL_CONFIRM: '/auth/verify-email/:token',
    VERIFY_PHONE: '/auth/verify-phone',
    VERIFY_PHONE_CONFIRM: '/auth/verify-phone-confirm',
  },

  // User Management
  USERS: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    AVATAR: '/users/avatar',
    ACCOUNT: '/users/account',
    KYC_SUBMIT: '/users/kyc/submit',
    KYC_STATUS: '/users/kyc/status',
    KYC_UPDATE: '/users/kyc/update',
    SETTINGS: '/users/settings',
    UPDATE_SETTINGS: '/users/settings',
    NOTIFICATIONS: '/users/notifications',
    PRIVACY: '/users/privacy',
  },

  // Product Management
  PRODUCTS: {
    LIST: '/products',
    DETAILS: (id: string) => `/products/${id}`,
    CREATE: '/products',
    UPDATE: (id: string) => `/products/${id}`,
    DELETE: (id: string) => `/products/${id}`,
    MY_PRODUCTS: '/products/my-products',
    IMAGES: (id: string) => `/products/${id}/images`,
    IMAGE_DELETE: (id: string, imageId: string) => `/products/${id}/images/${imageId}`,
    STATUS: (id: string) => `/products/${id}/status`,
    FEATURE: (id: string) => `/products/${id}/feature`,
    REPORT: (id: string) => `/products/${id}/report`,
    SEARCH: '/products/search',
    CATEGORY: (categoryId: string) => `/products/category/${categoryId}`,
    FEATURED: '/products/featured',
    TRENDING: '/products/trending',
  },

  // Categories
  CATEGORIES: {
    LIST: '/categories',
    DETAILS: (id: string) => `/categories/${id}`,
    TREE: '/categories/tree',
    CREATE: '/categories',
    UPDATE: (id: string) => `/categories/${id}`,
    DELETE: (id: string) => `/categories/${id}`,
    HIERARCHY: '/categories/hierarchy',
  },

  // Shopping Cart
  CART: {
    GET: '/cart',
    ADD_ITEM: '/cart/items',
    UPDATE_ITEM: (itemId: string) => `/cart/items/${itemId}`,
    REMOVE_ITEM: (itemId: string) => `/cart/items/${itemId}`,
    CLEAR: '/cart/clear',
    GUEST: '/cart/guest',
    GUEST_GET: (sessionId: string) => `/cart/guest/${sessionId}`,
    GUEST_UPDATE: (sessionId: string, itemId: string) => `/cart/guest/${sessionId}/item/${itemId}`,
    GUEST_REMOVE: (sessionId: string, itemId: string) => `/cart/guest/${sessionId}/item/${itemId}`,
    GUEST_CLEAR: (sessionId: string) => `/cart/guest/${sessionId}`,
  },

  // Orders
  ORDERS: {
    CREATE: '/orders',
    GUEST_CHECKOUT: '/orders/guest-checkout',
    LIST: '/orders',
    DETAILS: (id: string) => `/orders/${id}`,
    CANCEL: (id: string) => `/orders/${id}/cancel`,
    GUEST_STATUS: (orderId: string) => `/orders/guest/${orderId}/status`,
  },

  // Payments
  PAYMENTS: {
    METHODS: '/payments/methods',
    PROCESS: '/payments/process',
    GUEST_PROCESS: '/payments/guest/process',
    STATUS: (paymentId: string) => `/payments/status/${paymentId}`,
    HISTORY: '/payments/history',
    RECEIPT: (id: string) => `/payments/${id}/receipt`,
    REFUND: (id: string) => `/payments/${id}/refund`,
    WEBHOOK_NOUPAI: '/payments/webhook/noupai',
    WEBHOOK_CAMPAY: '/payments/webhook/campay',
    WEBHOOK_STRIPE: '/payments/webhook/stripe',
  },

  // Wallet
  WALLET: {
    BALANCE: '/wallet',
    DEPOSIT: '/wallet/deposit',
    WITHDRAW: '/wallet/withdraw',
    TRANSFER: '/wallet/transfer',
    TRANSACTIONS: '/wallet/transactions',
  },

  // Delivery
  DELIVERY: {
    ASSIGNMENTS: '/delivery/assignments',
    ACCEPT: (id: string) => `/delivery/assignments/${id}/accept`,
    REJECT: (id: string) => `/delivery/assignments/${id}/reject`,
    MY_DELIVERIES: '/delivery/my-deliveries',
    STATUS: (id: string) => `/delivery/${id}/status`,
    LOCATION: (id: string) => `/delivery/${id}/location`,
    PHOTO: (id: string) => `/delivery/${id}/photo`,
    TRACK: (id: string) => `/delivery/${id}/track`,
    STATS_DAILY: '/delivery/stats/daily',
    EARNINGS: '/delivery/earnings',
    ROUTE_OPTIMIZATION: '/delivery/route-optimization',
  },

  // Reviews & Ratings
  REVIEWS: {
    CREATE: '/reviews',
    SELLER_REVIEW: '/reviews/seller',
    PRODUCT_REVIEWS: (productId: string) => `/reviews/product/${productId}`,
    SELLER_REVIEWS: (sellerId: string) => `/reviews/seller/${sellerId}`,
    UPDATE: (id: string) => `/reviews/${id}`,
    DELETE: (id: string) => `/reviews/${id}`,
  },

  // Loyalty Program
  LOYALTY: {
    POINTS: '/loyalty/points',
    HISTORY: '/loyalty/history',
    REWARDS: '/loyalty/rewards',
    REDEEM: '/loyalty/redeem',
    TIER: '/loyalty/tier',
  },

  // Referral System
  REFERRALS: {
    STATS: '/referrals/stats',
    INVITE: '/referrals/invite',
    HISTORY: '/referrals/history',
    CODE: '/referrals/code',
  },

  // Communication
  CONVERSATIONS: {
    LIST: '/conversations',
    CREATE: '/conversations',
    MESSAGES: (id: string) => `/conversations/${id}/messages`,
    SEND_MESSAGE: (id: string) => `/conversations/${id}/messages`,
    READ: (id: string) => `/conversations/${id}/read`,
  },

  // Support
  SUPPORT: {
    CONTACT: '/support/contact',
    FAQ: '/support/faq',
    WHATSAPP_LINK: '/support/whatsapp-link',
    TICKET: '/support/ticket',
    TICKETS: '/support/tickets',
  },

  // Newsletter
  NEWSLETTER: {
    SUBSCRIBE: '/newsletter/subscribe',
    PREFERENCES: '/newsletter/preferences',
    UNSUBSCRIBE: '/newsletter/unsubscribe',
  },

  // Advertisements
  ADS: {
    BANNERS: '/ads/banners',
    POPUPS: '/ads/popups',
    CLICK: '/ads/click',
    IMPRESSION: '/ads/impression',
  },

  // Admin Endpoints
  ADMIN: {
    USERS: '/admin/users',
    USER_DETAILS: (id: string) => `/admin/users/${id}`,
    UPDATE_USER: (id: string) => `/admin/users/${id}`,
    SUSPEND_USER: (id: string) => `/admin/users/${id}/suspend`,
    ACTIVATE_USER: (id: string) => `/admin/users/${id}/activate`,
    KYC_APPROVE: (id: string) => `/admin/users/${id}/kyc-approve`,
    PRODUCTS_MODERATION: '/admin/products/moderation',
    MODERATE_PRODUCT: (id: string) => `/admin/products/${id}/moderate`,
    REPORTS: '/admin/content/reports',
    MODERATE_REVIEW: (id: string) => `/admin/reviews/${id}/moderate`,
    PAYMENTS_OVERVIEW: '/admin/payments/overview',
    PAYMENT_TRANSACTIONS: '/admin/payments/transactions',
    COMMISSION_RATES: '/admin/payments/commission-rates',
    REFUND: '/admin/payments/refund',
    ANALYTICS_OVERVIEW: '/admin/analytics/overview',
    ANALYTICS_SALES: '/admin/analytics/sales',
    ANALYTICS_USERS: '/admin/analytics/users',
    CUSTOM_REPORT: '/admin/analytics/custom-report',
    EXPORT: '/admin/analytics/export',
    EMAIL_CAMPAIGN: '/admin/marketing/email-campaign',
    SMS_BLAST: '/admin/marketing/sms-blast',
    CAMPAIGNS: '/admin/marketing/campaigns',
    AD_PLACEMENT: '/admin/ads/placement',
    PLATFORM_CONFIG: '/admin/config/platform',
    UPDATE_CONFIG: '/admin/config/platform',
    SECURITY_CONFIG: '/admin/config/security',
    FEATURES: '/admin/config/features',
    SUPPORT_TICKETS: '/admin/support/tickets',
    UPDATE_TICKET: (id: string) => `/admin/support/tickets/${id}`,
    SECURITY_DASHBOARD: '/admin/security/dashboard',
    FRAUD_ALERTS: '/admin/security/fraud-alerts',
    IP_BLOCK: '/admin/security/ip-block',
  },

  // AI Features
  AI: {
    RECOGNIZE_PRODUCT: '/ai/recognize/product',
    RECOGNIZE_TEXT: '/ai/recognize/text',
    RECOMMEND_PRODUCTS: '/ai/recommend/products',
    SIMILAR_PRODUCTS: (productId: string) => `/ai/recommend/similar/${productId}`,
    COMPARE_PRODUCTS: '/ai/compare/products',
    MARKET_ANALYSIS: '/ai/compare/market-analysis',
  },

  // Chatbot
  CHATBOT: {
    CHAT: '/chatbot/chat',
    QUICK_ACTION: '/chatbot/quick-action',
    FAQ: '/chatbot/faq',
    FEEDBACK: '/chatbot/feedback',
  },

  // Analytics
  ANALYTICS: {
    USER_STATS: '/analytics/user-stats',
    SALES_PERFORMANCE: '/analytics/sales-performance',
    PURCHASE_HISTORY: '/analytics/purchase-history',
  },

  // Gamification
  GAMIFICATION: {
    LEADERBOARD: '/gamification/leaderboard',
    ACHIEVEMENTS: '/gamification/achievements',
    DAILY_CHALLENGE: '/gamification/daily-challenge',
    BADGE_CLAIM: '/gamification/badge-claim',
  },

  // Data Synchronization
  SYNC: {
    USER_DATA: '/sync/user-data',
    PRODUCTS: '/sync/products',
    ORDERS: '/sync/orders',
    RESOLVE_CONFLICT: '/sync/resolve-conflict',
  },

  // Geographic Data
  GEOGRAPHIC: {
    REGIONS: '/regions',
    CITIES: (regionId: string) => `/cities/${regionId}`,
    DELIVERY_ZONES: '/delivery-zones',
  },

  // System
  SYSTEM: {
    HEALTH: '/health',
    VERSION: '/version',
    STATUS: '/status',
  },
};

// Helper function to build full URLs
export const buildUrl = (endpoint: string, params?: Record<string, string>): string => {
  let url = endpoint;

  if (params) {
    Object.keys(params).forEach(key => {
      url = url.replace(`:${key}`, params[key]);
    });
  }

  return url;
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string, params?: Record<string, string>): string => {
  const baseUrl = API_ENDPOINTS.BASE_URL;
  const fullEndpoint = buildUrl(endpoint, params);
  return `${baseUrl}${fullEndpoint}`;
};

export default API_ENDPOINTS;
