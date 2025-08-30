// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// Common Types
export type Currency = 'XAF' | 'EUR' | 'USD';
export type Language = 'fr' | 'en' | 'bamileke' | 'ewondo' | 'douala';
export type Region = 'Centre' | 'Littoral' | 'Ouest' | 'Sud-Ouest' | 'Nord-Ouest' | 'Adamaoua' | 'Nord' | 'Extreme-Nord' | 'Est' | 'Sud';

// Payment Types
export type PaymentMethod = 'mobile_money' | 'bank_transfer' | 'cash_on_delivery' | 'cash' | 'crypto' | 'credit_card';
export type PaymentStatus = 'pending' | 'partially_paid' | 'paid' | 'failed' | 'refunded' | 'disputed';
export type PaymentProvider = 'mtn' | 'orange' | 'express_union' | 'camtel' | 'stripe' | 'campay' | 'noupia';

export interface Payment {
  id: string;
  order_id?: string;
  user_id: string;
  amount: number;
  currency: Currency;
  method: PaymentMethod;
  provider: PaymentProvider;
  status: PaymentStatus;
  reference?: string;
  transaction_id?: string;
  payment_phone?: string;
  payment_data?: any;
  metadata?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
  paid_at?: Date;
  refunded_at?: Date;
  refund_amount?: number;
  refund_reason?: string;
}

export interface CreatePaymentRequest {
  order_id?: string;
  amount: number;
  currency?: Currency;
  method: PaymentMethod;
  provider: PaymentProvider;
  payment_phone?: string;
  metadata?: Record<string, any>;
}

// Wallet Types
export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  currency: Currency;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  user_id: string;
  type: 'credit' | 'debit';
  amount: number;
  currency: Currency;
  description?: string;
  reference?: string;
  status: 'pending' | 'completed' | 'failed';
  metadata?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface Withdrawal {
  id: string;
  user_id: string;
  wallet_id: string;
  amount: number;
  currency: Currency;
  method: PaymentMethod;
  provider: PaymentProvider;
  account_number?: string;
  account_name?: string;
  status: 'pending' | 'processing' | 'paid' | 'failed' | 'on_hold';
  reference?: string;
  transaction_id?: string;
  processed_at?: Date;
  failed_reason?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateWithdrawalRequest {
  amount: number;
  method: PaymentMethod;
  provider: PaymentProvider;
  account_number?: string;
  account_name?: string;
  description?: string;
}

// Delivery Types
export interface DeliveryOrder {
  id: string;
  order_id: string;
  delivery_agent_id?: string;
  pickup_address: string;
  delivery_address: string;
  customer_name: string;
  customer_phone: string;
  delivery_fee: number;
  status: 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled' | 'failed';
  assigned_at?: Date;
  picked_up_at?: Date;
  delivered_at?: Date;
  estimated_time?: number;
  actual_time?: number;
  distance?: number;
  special_instructions?: string;
  products: Array<{
    name: string;
    quantity: number;
    fragile: boolean;
    dimensions?: {
      weight?: number;
      length?: number;
      width?: number;
      height?: number;
    };
  }>;
  tracking_number: string;
  qr_code?: string;
  current_location?: {
    latitude: number;
    longitude: number;
    timestamp: Date;
  };
  delivery_attempts: number;
  max_attempts: number;
  created_at: Date;
  updated_at: Date;
}

export interface DeliveryStats {
  total_deliveries: number;
  completed_deliveries: number;
  pending_deliveries: number;
  cancelled_deliveries: number;
  monthly_earnings: number;
  average_rating: number;
  total_distance: number;
  active_hours: number;
  current_shift: boolean;
  pending_orders: DeliveryOrder[];
  completed_today: number;
  weekly_stats: number[];
  performance_rating: string;
  earnings_breakdown: {
    base_fare: number;
    distance_bonus: number;
    time_bonus: number;
    tips: number;
  };
}

export interface ShiftStatus {
  is_active: boolean;
  start_time?: Date;
  end_time?: Date;
  deliveries_today: number;
  hours_worked: number;
  total_earnings: number;
  current_location?: {
    latitude: number;
    longitude: number;
  };
}

// KYC Types
export interface KycDocument {
  id: string;
  user_id: string;
  document_type: 'id_card' | 'passport' | 'drivers_license' | 'proof_of_address';
  document_number: string;
  issuing_country: string;
  issue_date?: Date;
  expiry_date?: Date;
  front_image_url: string;
  back_image_url?: string;
  selfie_image_url?: string;
  status: 'pending' | 'under_review' | 'verified' | 'rejected';
  rejection_reason?: string;
  verified_at?: Date;
  verified_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface KycSubmission {
  document_type: 'id_card' | 'passport' | 'drivers_license' | 'proof_of_address';
  document_number: string;
  issuing_country: string;
  issue_date?: string;
  expiry_date?: string;
  front_image: string; // base64 or file path
  back_image?: string;
  selfie_image?: string;
}

// AI Types
export interface AiRecommendation {
  id: string;
  user_id: string;
  type: 'product' | 'price' | 'category' | 'promotion';
  title: string;
  description: string;
  confidence_score: number;
  data: any;
  is_applied: boolean;
  applied_at?: Date;
  created_at: Date;
}

export interface AiInsight {
  id: string;
  user_id: string;
  insight_type: 'sales_trend' | 'customer_behavior' | 'market_analysis' | 'pricing_strategy';
  title: string;
  description: string;
  data: any;
  priority: 'low' | 'medium' | 'high';
  is_read: boolean;
  created_at: Date;
}

// Analytics Types
export interface AnalyticsData {
  total_users: number;
  active_users: number;
  total_products: number;
  total_orders: number;
  total_revenue: number;
  conversion_rate: number;
  average_order_value: number;
  top_categories: Array<{
    category: string;
    count: number;
    revenue: number;
  }>;
  sales_trends: Array<{
    date: string;
    orders: number;
    revenue: number;
  }>;
  user_growth: Array<{
    date: string;
    new_users: number;
    total_users: number;
  }>;
}

// Notification Types
export interface PushNotification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  data?: any;
  type: 'order' | 'payment' | 'delivery' | 'promotion' | 'system' | 'chat';
  is_read: boolean;
  created_at: Date;
}

// Chat Types
export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: 'user' | 'admin' | 'delivery_agent';
  message: string;
  message_type: 'text' | 'image' | 'file' | 'location';
  metadata?: any;
  is_read: boolean;
  read_at?: Date;
  created_at: Date;
}

export interface ChatConversation {
  id: string;
  participants: Array<{
    id: string;
    type: 'user' | 'admin' | 'delivery_agent';
    name: string;
    avatar?: string;
  }>;
  last_message?: ChatMessage;
  unread_count: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Search Types
export interface SearchFilters {
  query?: string;
  category?: string;
  subcategory?: string;
  min_price?: number;
  max_price?: number;
  condition?: string;
  location?: string;
  radius?: number;
  sort_by?: 'relevance' | 'price_asc' | 'price_desc' | 'date_desc' | 'rating';
  is_negotiable?: boolean;
  has_delivery?: boolean;
  seller_rating?: number;
}

// Location Types
export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  timestamp: Date;
}

export interface Address {
  street: string;
  city: string;
  region: Region;
  postal_code?: string;
  country: string;
  landmark?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

// File Upload Types
export interface UploadResult {
  url: string;
  public_id: string;
  format: string;
  width?: number;
  height?: number;
  bytes: number;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

// Error Types
export interface ApiError {
  message: string;
  code?: string;
  details?: any;
  field?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}
