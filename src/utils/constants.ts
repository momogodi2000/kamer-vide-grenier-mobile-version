// API Constants
export const API_BASE_URL = __DEV__ ? 'http://localhost:4000/api' : 'https://api.kamervidegrinier.com/api';
export const API_TIMEOUT = 30000;
export const API_RETRIES = 3;

// App Constants
export const APP_NAME = 'Kamer Vidé-Grenier';
export const APP_VERSION = '1.0.0';
export const APP_BUILD = '1';

// User Roles
export const USER_ROLES = {
  VISITOR: 'visitor',
  CLIENT: 'client',
  SELLER: 'seller',
  PARTNER: 'partner',
  DELIVERY: 'delivery',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
} as const;

// Product Constants
export const PRODUCT_CONDITIONS = {
  NEW: 'neuf',
  LIKE_NEW: 'comme_neuf',
  VERY_GOOD: 'tres_bon_etat',
  GOOD: 'bon_etat',
  FAIR: 'etat_correct',
  FOR_PARTS: 'pour_pieces',
} as const;

export const PRODUCT_STATUSES = {
  DRAFT: 'draft',
  PENDING: 'pending',
  ACTIVE: 'active',
  SOLD: 'sold',
  RESERVED: 'reserved',
  EXPIRED: 'expired',
  BANNED: 'banned',
  ARCHIVED: 'archived',
} as const;

export const PRODUCT_CATEGORIES = [
  'Électronique',
  'Mode & Vêtements',
  'Maison & Jardin',
  'Véhicules',
  'Immobilier',
  'Emploi & Services',
  'Loisirs & Sports',
  'Animaux',
  'Pour la maison',
  'Autres',
] as const;

// Order Constants
export const ORDER_STATUSES = {
  DRAFT: 'draft',
  PENDING_PAYMENT: 'pending_payment',
  PAID: 'paid',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY_FOR_PICKUP: 'ready_for_pickup',
  SHIPPED: 'shipped',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
  DISPUTED: 'disputed',
} as const;

export const PAYMENT_STATUSES = {
  PENDING: 'pending',
  PARTIALLY_PAID: 'partially_paid',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  DISPUTED: 'disputed',
} as const;

export const PAYMENT_METHODS = {
  MOBILE_MONEY: 'mobile_money',
  BANK_TRANSFER: 'bank_transfer',
  CASH_ON_DELIVERY: 'cash_on_delivery',
  CASH: 'cash',
  CRYPTO: 'crypto',
  CREDIT_CARD: 'credit_card',
} as const;

export const DELIVERY_METHODS = {
  PICKUP: 'pickup',
  DELIVERY: 'delivery',
  SHIPPING: 'shipping',
  EXPRESS: 'express',
} as const;

// Payment Providers
export const PAYMENT_PROVIDERS = {
  MTN: 'mtn',
  ORANGE: 'orange',
  EXPRESS_UNION: 'express_union',
  CAMTEL: 'camtel',
  STRIPE: 'stripe',
  CAMPAY: 'campay',
  NOUPIA: 'noupia',
} as const;

// Delivery Constants
export const DELIVERY_STATUSES = {
  ASSIGNED: 'assigned',
  PICKED_UP: 'picked_up',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  FAILED: 'failed',
} as const;

// KYC Constants
export const KYC_STATUSES = {
  PENDING: 'pending',
  UNDER_REVIEW: 'under_review',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
} as const;

export const DOCUMENT_TYPES = {
  ID_CARD: 'id_card',
  PASSPORT: 'passport',
  DRIVERS_LICENSE: 'drivers_license',
  PROOF_OF_ADDRESS: 'proof_of_address',
} as const;

// Wallet Constants
export const TRANSACTION_TYPES = {
  CREDIT: 'credit',
  DEBIT: 'debit',
} as const;

export const WITHDRAWAL_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  PAID: 'paid',
  FAILED: 'failed',
  ON_HOLD: 'on_hold',
} as const;

// Location Constants
export const REGIONS = {
  CENTRE: 'Centre',
  LITTORAL: 'Littoral',
  OUEST: 'Ouest',
  SUD_OUEST: 'Sud-Ouest',
  NORD_OUEST: 'Nord-Ouest',
  ADAMOUA: 'Adamaoua',
  NORD: 'Nord',
  EXTREME_NORD: 'Extreme-Nord',
  EST: 'Est',
  SUD: 'Sud',
} as const;

// Currencies
export const CURRENCIES = {
  XAF: 'XAF',
  EUR: 'EUR',
  USD: 'USD',
} as const;

// Languages
export const LANGUAGES = {
  FR: 'fr',
  EN: 'en',
  BAMILEKE: 'bamileke',
  EWONDO: 'ewondo',
  DOUALA: 'douala',
} as const;

// Genders
export const GENDERS = {
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other',
} as const;

// Business Types
export const BUSINESS_TYPES = {
  INDIVIDUAL: 'individual',
  SMALL_BUSINESS: 'small_business',
  COMPANY: 'company',
} as const;

// File Upload Constants
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/avi', 'video/mov'];
export const MAX_IMAGES_PER_PRODUCT = 10;
export const MAX_VIDEOS_PER_PRODUCT = 3;

// Search Constants
export const SEARCH_DEBOUNCE_MS = 300;
export const MAX_SEARCH_RESULTS = 50;
export const SEARCH_RADIUS_KM = 50;

// Pagination Constants
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Time Constants
export const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes
export const SESSION_TIMEOUT_MS = 24 * 60 * 60 * 1000; // 24 hours
export const TOKEN_REFRESH_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

// Notification Constants
export const NOTIFICATION_TYPES = {
  ORDER: 'order',
  PAYMENT: 'payment',
  DELIVERY: 'delivery',
  PRODUCT: 'product',
  SYSTEM: 'system',
  PROMOTION: 'promotion',
  CHAT: 'chat',
  REVIEW: 'review',
} as const;

// Chat Constants
export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  FILE: 'file',
  LOCATION: 'location',
} as const;

export const CHAT_PARTICIPANT_TYPES = {
  USER: 'user',
  ADMIN: 'admin',
  DELIVERY_AGENT: 'delivery_agent',
} as const;

// Analytics Constants
export const ANALYTICS_EVENTS = {
  PRODUCT_VIEW: 'product_view',
  PRODUCT_LIKE: 'product_like',
  PRODUCT_SHARE: 'product_share',
  SEARCH_PERFORMED: 'search_performed',
  ORDER_CREATED: 'order_created',
  PAYMENT_COMPLETED: 'payment_completed',
  USER_REGISTERED: 'user_registered',
  USER_LOGIN: 'user_login',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erreur de connexion réseau',
  SERVER_ERROR: 'Erreur du serveur',
  UNAUTHORIZED: 'Non autorisé',
  FORBIDDEN: 'Accès refusé',
  NOT_FOUND: 'Ressource non trouvée',
  VALIDATION_ERROR: 'Erreur de validation',
  UNKNOWN_ERROR: 'Erreur inconnue',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Connexion réussie',
  REGISTER_SUCCESS: 'Inscription réussie',
  LOGOUT_SUCCESS: 'Déconnexion réussie',
  PRODUCT_CREATED: 'Produit créé avec succès',
  ORDER_CREATED: 'Commande créée avec succès',
  PAYMENT_SUCCESS: 'Paiement effectué avec succès',
  WITHDRAWAL_REQUESTED: 'Demande de retrait effectuée',
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  PHONE_REGEX: /^\+?[\d\s\-\(\)]+$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  DESCRIPTION_MAX_LENGTH: 2000,
  TITLE_MAX_LENGTH: 100,
} as const;

// UI Constants
export const COLORS = {
  PRIMARY: '#2E7D32',
  SECONDARY: '#4CAF50',
  ACCENT: '#81C784',
  ERROR: '#F44336',
  WARNING: '#FF9800',
  INFO: '#2196F3',
  SUCCESS: '#4CAF50',
  BACKGROUND: '#F5F5F5',
  SURFACE: '#FFFFFF',
  TEXT_PRIMARY: '#212121',
  TEXT_SECONDARY: '#757575',
} as const;

export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 16,
  LG: 24,
  XL: 32,
  XXL: 48,
} as const;

export const FONT_SIZES = {
  XS: 12,
  SM: 14,
  MD: 16,
  LG: 18,
  XL: 20,
  XXL: 24,
  XXXL: 32,
} as const;

export const BORDER_RADIUS = {
  SM: 4,
  MD: 8,
  LG: 12,
  XL: 16,
  ROUND: 50,
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_AI_RECOMMENDATIONS: true,
  ENABLE_REAL_TIME_CHAT: true,
  ENABLE_PUSH_NOTIFICATIONS: true,
  ENABLE_OFFLINE_MODE: true,
  ENABLE_BIOMETRIC_AUTH: true,
  ENABLE_VOICE_SEARCH: false,
  ENABLE_AR_PREVIEW: false,
} as const;
