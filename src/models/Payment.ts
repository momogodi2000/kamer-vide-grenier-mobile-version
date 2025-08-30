export type PaymentProvider = 'noupia' | 'campay' | 'stripe' | 'cash_on_delivery' | 'mtn' | 'orange' | 'bank_transfer';

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
  paid_at?: string;
  failed_at?: string;
  cancelled_at?: string;
  refunded_at?: string;
  refund_amount?: number;
  refund_reason?: string;
  created_at: string;
  updated_at: string;
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
  received_at: string;
}
