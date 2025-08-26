export type UserRole = 'visitor' | 'client' | 'seller' | 'partner' | 'delivery' | 'admin' | 'super_admin';
export type Gender = 'male' | 'female' | 'other';
export type Language = 'fr' | 'en' | 'bamileke' | 'ewondo' | 'douala';
export type Region = 'Centre' | 'Littoral' | 'Ouest' | 'Sud-Ouest' | 'Nord-Ouest' | 'Adamaoua' | 'Nord' | 'Extreme-Nord' | 'Est' | 'Sud';
export type KycStatus = 'pending' | 'under_review' | 'verified' | 'rejected';
export type BusinessType = 'individual' | 'small_business' | 'company';
export type PaymentMethod = 'mobile_money' | 'bank_transfer' | 'cash' | 'crypto';
export type MobileMoneyProvider = 'mtn' | 'orange' | 'express_union' | 'camtel';

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
}

export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
  city?: string;
  region?: Region;
  bio?: string;
  avatar_url?: string;
  preferred_language?: Language;
  privacy_settings?: PrivacySettings;
  push_notifications?: boolean;
  email_notifications?: boolean;
  sms_notifications?: boolean;
}