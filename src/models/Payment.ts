export type PaymentProvider = 'noupia' | 'campay' | 'stripe' | 'cash_on_delivery';

export interface Payment {
  id: string;
  user_id: string;
  order_id: string;
  amount: number;
  currency: string;
  provider: PaymentProvider;
  method: 'mobile_money' | 'bank_transfer' | 'cash_on_delivery' | 'cash' | 'crypto' | 'credit_card';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  payment_method: 'mobile_money' | 'bank_transfer' | 'cash_on_delivery' | 'cash' | 'crypto' | 'credit_card';
  mobile_money_provider?: 'mtn' | 'orange' | 'express_union' | 'camtel';
  payment_phone?: string;
  payment_reference?: string;
  transaction_id?: string;
  external_reference?: string;
  description?: string;
  metadata?: Record<string, any>;
  paid_at?: Date;
  failed_at?: Date;
  cancelled_at?: Date;
  refunded_at?: Date;
  refund_amount?: number;
  refund_reason?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreatePaymentRequest {
  order_id: string;
  amount: number;
  currency: string;
  provider: PaymentProvider;
  payment_method: 'mobile_money' | 'bank_transfer' | 'cash_on_delivery' | 'cash' | 'crypto' | 'credit_card';
  mobile_money_provider?: 'mtn' | 'orange' | 'express_union' | 'camtel';
  payment_phone?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface PaymentWebhookData {
  provider: PaymentProvider;
  transaction_id: string;
  external_reference: string;
  amount: number;
  currency: string;
  status: 'success' | 'failed' | 'cancelled';
  payment_data: Record<string, any>;
  received_at: Date;
}
