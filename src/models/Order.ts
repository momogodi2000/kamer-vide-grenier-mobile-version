export type OrderStatus = 'draft' | 'pending_payment' | 'paid' | 'confirmed' | 'preparing' | 'ready_for_pickup' | 'shipped' | 'in_transit' | 'delivered' | 'completed' | 'cancelled' | 'refunded' | 'disputed';
export type PaymentStatus = 'pending' | 'partially_paid' | 'paid' | 'failed' | 'refunded' | 'disputed';
export type PaymentMethod = 'mobile_money' | 'bank_transfer' | 'cash_on_delivery' | 'cash' | 'crypto' | 'credit_card';
export type MobileMoneyProvider = 'mtn' | 'orange' | 'express_union' | 'camtel';
export type DeliveryMethod = 'pickup' | 'delivery' | 'shipping' | 'express';
export type PayoutStatus = 'pending' | 'processing' | 'paid' | 'failed' | 'on_hold';
export type DisputeStatus = 'none' | 'raised' | 'under_review' | 'resolved';
export type Priority = 'normal' | 'high' | 'urgent';
export type Language = 'fr' | 'en' | 'bamileke' | 'ewondo' | 'douala';
export type Region = 'Centre' | 'Littoral' | 'Ouest' | 'Sud-Ouest' | 'Nord-Ouest' | 'Adamaoua' | 'Nord' | 'Extreme-Nord' | 'Est' | 'Sud';

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
  currency: string;
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
  items?: OrderItem[];
}

export interface CreateOrderRequest {
  seller_id: string;
  items: {
    product_id: string;
    quantity: number;
  }[];
  payment_method: PaymentMethod;
  mobile_money_provider?: MobileMoneyProvider;
  payment_phone?: string;
  delivery_method: DeliveryMethod;
  delivery_address?: DeliveryAddress;
  pickup_location?: PickupLocation;
  delivery_instructions?: string;
  buyer_notes?: string;
  is_gift?: boolean;
  gift_message?: string;
  special_instructions?: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  notes?: string;
  tracking_number?: string;
  estimated_delivery?: Date;
}

export interface OrderSearchFilters {
  status?: OrderStatus[];
  payment_status?: PaymentStatus[];
  seller_id?: string;
  buyer_id?: string;
  date_from?: Date;
  date_to?: Date;
  sort_by?: 'created_at' | 'updated_at' | 'total_amount';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface OrderSearchResponse {
  success: boolean;
  data: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}