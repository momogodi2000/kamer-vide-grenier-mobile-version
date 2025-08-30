// Common Types
export type UserRole = 'visitor' | 'client' | 'seller' | 'partner' | 'delivery' | 'admin' | 'super_admin';
export type Gender = 'male' | 'female' | 'other';
export type Language = 'fr' | 'en' | 'bamileke' | 'ewondo' | 'douala';
export type Region = 'Centre' | 'Littoral' | 'Ouest' | 'Sud-Ouest' | 'Nord-Ouest' | 'Adamaoua' | 'Nord' | 'Extreme-Nord' | 'Est' | 'Sud';
export type KycStatus = 'pending' | 'under_review' | 'verified' | 'rejected';
export type BusinessType = 'individual' | 'small_business' | 'company';
export type PaymentMethod = 'mobile_money' | 'bank_transfer' | 'cash_on_delivery' | 'cash' | 'crypto' | 'credit_card';
export type MobileMoneyProvider = 'mtn' | 'orange' | 'express_union' | 'camtel';
export type Currency = 'XAF' | 'EUR' | 'USD';

// User Model
export interface PrivacySettings {
  show_phone: boolean;
  show_email: boolean;
  show_location: boolean;
}

export interface SocialMedia {
  [key: string]: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar_url?: string;
  is_verified: boolean;
  phone_verified: boolean;
  email_verified: boolean;
  identity_verified: boolean;
  national_id?: string;
  date_of_birth?: string;
  gender?: Gender;
  preferred_language: Language;
  city?: string;
  region?: Region;
  country: string;
  loyalty_points: number;
  seller_rating: number;
  total_sales: number;
  total_purchases: number;
  kyc_status: KycStatus;
  business_type?: BusinessType;
  business_name?: string;
  business_registration?: string;
  tax_id?: string;
  preferred_payment_method: PaymentMethod;
  mobile_money_number?: string;
  mobile_money_provider?: MobileMoneyProvider;
  referral_code: string;
  referred_by?: string;
  last_login?: Date;
  login_count: number;
  is_active: boolean;
  is_banned: boolean;
  ban_reason?: string;
  newsletter_subscribed: boolean;
  push_notifications: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
  privacy_settings: PrivacySettings;
  social_media: SocialMedia;
  bio?: string;
  website?: string;
  emergency_contact?: EmergencyContact;
  two_factor_enabled: boolean;
  terms_accepted: boolean;
  terms_accepted_at?: Date;
  gdpr_consent: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
  preferred_language?: Language;
  city?: string;
  region?: Region;
  referral_code?: string;
  terms_accepted: boolean;
  gdpr_consent: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  refresh_token: string;
  user: User;
  message?: string;
}

export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
  city?: string;
  region?: Region;
  bio?: string;
  website?: string;
  avatar_url?: string;
}

// Product Model
export type ProductCondition = 'neuf' | 'comme_neuf' | 'tres_bon_etat' | 'bon_etat' | 'etat_correct' | 'pour_pieces';
export type Authenticity = 'authentique' | 'copie' | 'contrefacon' | 'inconnu';
export type ProductStatus = 'draft' | 'pending' | 'active' | 'sold' | 'reserved' | 'expired' | 'banned' | 'archived';
export type VerificationStatus = 'pending' | 'verified' | 'rejected' | 'needs_review';
export type PromotionType = 'none' | 'discount' | 'flash_sale' | 'bundle' | 'clearance';

export interface ProductDimensions {
  length?: number;
  width?: number;
  height?: number;
  weight?: number;
}

export interface DeliveryOptions {
  pickup_available: boolean;
  delivery_available: boolean;
  shipping_available: boolean;
  express_delivery: boolean;
}

export interface SellerContactInfo {
  show_phone: boolean;
  show_whatsapp: boolean;
  show_email: boolean;
}

export interface PromotionDetails {
  [key: string]: any;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  short_description?: string;
  price: number;
  original_price?: number;
  discount_percentage: number;
  currency: Currency;
  seller_id: string;
  category_id: string;
  subcategory_id?: string;
  brand?: string;
  model?: string;
  condition: ProductCondition;
  authenticity: Authenticity;
  origin_country: string;
  is_artisanal: boolean;
  cultural_significance?: string;
  images: string[];
  videos: string[];
  dimensions?: ProductDimensions;
  color?: string;
  size?: string;
  material?: string;
  year_manufactured?: number;
  location: string;
  city: string;
  region: Region;
  country: string;
  neighborhood?: string;
  latitude?: number;
  longitude?: number;
  delivery_options: DeliveryOptions;
  delivery_fee: number;
  delivery_time_days: number;
  quantity: number;
  is_unique: boolean;
  is_negotiable: boolean;
  min_offer_percentage: number;
  status: ProductStatus;
  verification_status: VerificationStatus;
  views_count: number;
  favorites_count: number;
  shares_count: number;
  inquiries_count: number;
  average_rating: number;
  reviews_count: number;
  is_featured: boolean;
  featured_until?: Date;
  is_urgent: boolean;
  boost_level: number;
  keywords: string[];
  tags: string[];
  safety_tips: string[];
  seller_contact_info: SellerContactInfo;
  available_from: Date;
  expires_at?: Date;
  promotion_type: PromotionType;
  promotion_details?: PromotionDetails;
  warranty_info?: string;
  return_policy?: string;
  payment_methods: string[];
  languages: string[];
  seo_slug?: string;
  sold_at?: Date;
  sold_to?: string;
  sold_price?: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateProductRequest {
  title: string;
  description: string;
  price: number;
  currency?: Currency;
  category_id: string;
  subcategory_id?: string;
  condition: ProductCondition;
  authenticity: Authenticity;
  images: string[];
  location: string;
  city: string;
  region: Region;
  delivery_options?: DeliveryOptions;
  delivery_fee?: number;
  quantity?: number;
  is_negotiable?: boolean;
  tags?: string[];
  keywords?: string[];
}

export interface ProductSearchFilters {
  query?: string;
  category_id?: string;
  subcategory_id?: string;
  min_price?: number;
  max_price?: number;
  condition?: ProductCondition;
  authenticity?: Authenticity;
  location?: string;
  city?: string;
  region?: Region;
  latitude?: number;
  longitude?: number;
  radius?: number;
  is_negotiable?: boolean;
  has_delivery?: boolean;
  seller_rating?: number;
  sort_by?: 'relevance' | 'price_asc' | 'price_desc' | 'date_desc' | 'rating' | 'distance';
  page?: number;
  limit?: number;
}

export interface ProductSearchResponse {
  products: Product[];
  total: number;
  page: number;
  total_pages: number;
  filters: ProductSearchFilters;
}

// Order Model
export type OrderStatus = 'draft' | 'pending_payment' | 'paid' | 'confirmed' | 'preparing' | 'ready_for_pickup' | 'shipped' | 'in_transit' | 'delivered' | 'completed' | 'cancelled' | 'refunded' | 'disputed';
export type PaymentStatus = 'pending' | 'partially_paid' | 'paid' | 'failed' | 'refunded' | 'disputed';
export type DeliveryMethod = 'pickup' | 'delivery' | 'shipping' | 'express';
export type PayoutStatus = 'pending' | 'processing' | 'paid' | 'failed' | 'on_hold';
export type DisputeStatus = 'none' | 'raised' | 'under_review' | 'resolved';
export type Priority = 'normal' | 'high' | 'urgent';

export interface DeliveryAddress {
  street: string;
  city: string;
  region: Region;
  postal_code?: string;
  country: string;
  landmark?: string;
  instructions?: string;
}

export interface PickupLocation {
  name: string;
  address: string;
  city: string;
  region: Region;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_title: string;
  product_image?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_status: string;
}

export interface Order {
  id: string;
  order_number: string;
  buyer_id: string;
  seller_id: string;
  subtotal: number;
  delivery_fee: number;
  service_fee: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: Currency;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  mobile_money_provider?: MobileMoneyProvider;
  payment_phone?: string;
  payment_reference?: string;
  delivery_method: DeliveryMethod;
  delivery_address?: DeliveryAddress;
  pickup_location?: PickupLocation;
  delivery_instructions?: string;
  estimated_delivery?: Date;
  actual_delivery?: Date;
  tracking_number?: string;
  delivery_partner?: string;
  pickup_code?: string;
  buyer_notes?: string;
  seller_notes?: string;
  cancellation_reason?: string;
  cancelled_by?: string;
  cancelled_at?: Date;
  refund_amount: number;
  refund_reason?: string;
  refunded_at?: Date;
  commission_rate: number;
  commission_amount: number;
  seller_payout?: number;
  payout_status: PayoutStatus;
  dispute_status: DisputeStatus;
  dispute_reason?: string;
  buyer_rating?: number;
  seller_rating?: number;
  preferred_language: Language;
  region?: Region;
  priority: Priority;
  is_gift: boolean;
  gift_message?: string;
  special_instructions?: string;
  expires_at?: Date;
  confirmed_at?: Date;
  shipped_at?: Date;
  delivered_at?: Date;
  completed_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateOrderRequest {
  items: Array<{
    product_id: string;
    quantity: number;
    unit_price: number;
  }>;
  delivery_method: DeliveryMethod;
  delivery_address?: DeliveryAddress;
  pickup_location?: PickupLocation;
  payment_method: PaymentMethod;
  mobile_money_provider?: MobileMoneyProvider;
  payment_phone?: string;
  buyer_notes?: string;
  is_gift?: boolean;
  gift_message?: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  notes?: string;
  tracking_number?: string;
  delivery_partner?: string;
}

export interface OrderSearchFilters {
  status?: OrderStatus;
  payment_status?: PaymentStatus;
  delivery_method?: DeliveryMethod;
  date_from?: string;
  date_to?: string;
  min_amount?: number;
  max_amount?: number;
  page?: number;
  limit?: number;
}

export interface OrderSearchResponse {
  orders: Order[];
  total: number;
  page: number;
  total_pages: number;
  statistics?: {
    total_orders: number;
    total_amount: number;
    pending_orders: number;
    completed_orders: number;
  };
}

// Category Model
export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  image_url?: string;
  parent_id?: string;
  subcategories?: Category[];
  product_count: number;
  is_active: boolean;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}

// Notification Model
export interface Notification {
  id: string;
  user_id: string;
  type: 'order' | 'payment' | 'delivery' | 'product' | 'system' | 'promotion' | 'chat' | 'review';
  title: string;
  message: string;
  data?: any;
  is_read: boolean;
  read_at?: Date;
  action_url?: string;
  expires_at?: Date;
  created_at: Date;
  updated_at: Date;
}

// Cart Model
export interface Cart {
  id: string;
  user_id: string;
  items: CartItem[];
  subtotal: number;
  delivery_fee: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  currency: Currency;
  created_at: Date;
  updated_at: Date;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  product: {
    id: string;
    title: string;
    price: number;
    images: string[];
    seller_id: string;
  };
  quantity: number;
  unit_price: number;
  total_price: number;
  selected_options?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

// Review Model
export interface Review {
  id: string;
  product_id: string;
  order_id: string;
  reviewer_id: string;
  reviewer_name: string;
  reviewer_avatar?: string;
  rating: number;
  title?: string;
  comment?: string;
  images?: string[];
  is_verified_purchase: boolean;
  helpful_count: number;
  response?: {
    seller_response: string;
    responded_at: Date;
  };
  created_at: Date;
  updated_at: Date;
}

// Additional Models
export interface Favorite {
  id: string;
  user_id: string;
  product_id: string;
  product: {
    id: string;
    title: string;
    price: number;
    images: string[];
    seller_id: string;
  };
  created_at: Date;
}

export interface SearchHistory {
  id: string;
  user_id: string;
  query: string;
  filters?: Record<string, any>;
  result_count: number;
  created_at: Date;
}

export interface RecentlyViewed {
  id: string;
  user_id: string;
  product_id: string;
  product: {
    id: string;
    title: string;
    price: number;
    images: string[];
    seller_id: string;
  };
  viewed_at: Date;
}
