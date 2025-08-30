// User types and interfaces
export type {
  User,
  CreateUserRequest,
  LoginRequest,
  LoginResponse,
  UpdateProfileRequest,
  UserRole,
  Gender,
  Language,
  Region,
  KycStatus,
  BusinessType,
  PaymentMethod,
  MobileMoneyProvider,
  PrivacySettings,
  SocialMedia,
  EmergencyContact
} from './User';

// Product types and interfaces
export type { 
  Product, 
  ProductStatus, 
  ProductCondition,
  CreateProductRequest,
  ProductSearchFilters,
  ProductSearchResponse,
  DeliveryOptions
} from './Product';

// Order types and interfaces  
export type { Order, OrderStatus, PaymentStatus, DeliveryMethod } from './Order';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationResponse {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  parent_id?: string;
  subcategories?: Category[];
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Cart {
  id: string;
  user_id: string;
  items: CartItem[];
  subtotal: number;
  total: number;
  created_at: Date;
  updated_at: Date;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product?: {
    id: string;
    title: string;
    images: string[];
    seller_id: string;
  };
  created_at: Date;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'order' | 'product' | 'system';
  is_read: boolean;
  action_url?: string;
  metadata?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface Review {
  id: string;
  user_id: string;
  product_id?: string;
  order_id?: string;
  rating: number;
  comment?: string;
  is_verified: boolean;
  helpful_count: number;
  created_at: Date;
  updated_at: Date;
  user?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
}