export type ProductCondition = 'neuf' | 'comme_neuf' | 'tres_bon_etat' | 'bon_etat' | 'etat_correct' | 'pour_pieces';
export type Authenticity = 'authentique' | 'copie' | 'contrefacon' | 'inconnu';
export type ProductStatus = 'draft' | 'pending' | 'active' | 'sold' | 'reserved' | 'expired' | 'banned' | 'archived';
export type VerificationStatus = 'pending' | 'verified' | 'rejected' | 'needs_review';
export type PromotionType = 'none' | 'discount' | 'flash_sale' | 'bundle' | 'clearance';
export type Region = 'Centre' | 'Littoral' | 'Ouest' | 'Sud-Ouest' | 'Nord-Ouest' | 'Adamaoua' | 'Nord' | 'Extreme-Nord' | 'Est' | 'Sud';

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
  currency: string;
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
  short_description?: string;
  price: number;
  category_id: string;
  subcategory_id?: string;
  brand?: string;
  model?: string;
  condition: ProductCondition;
  authenticity?: Authenticity;
  images: string[];
  videos?: string[];
  dimensions?: ProductDimensions;
  color?: string;
  size?: string;
  material?: string;
  year_manufactured?: number;
  location: string;
  city: string;
  region: Region;
  neighborhood?: string;
  delivery_options: DeliveryOptions;
  delivery_fee?: number;
  delivery_time_days?: number;
  quantity?: number;
  is_negotiable?: boolean;
  min_offer_percentage?: number;
  keywords?: string[];
  tags?: string[];
  warranty_info?: string;
  return_policy?: string;
  payment_methods?: string[];
}

export interface ProductSearchFilters {
  query?: string;
  category_id?: string;
  subcategory_id?: string;
  min_price?: number;
  max_price?: number;
  condition?: ProductCondition[];
  region?: Region[];
  city?: string;
  is_negotiable?: boolean;
  delivery_available?: boolean;
  is_featured?: boolean;
  sort_by?: 'created_at' | 'price' | 'views_count' | 'favorites_count';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ProductSearchResponse {
  success: boolean;
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}