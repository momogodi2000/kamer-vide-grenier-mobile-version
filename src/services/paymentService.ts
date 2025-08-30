import { apiClient } from './api';
import {
  Payment,
  PaymentMethod,
  PaymentStatus,
  CreatePaymentRequest,
  PaymentProvider,
  ApiResponse
} from '../models';

export class PaymentService {
  async createPayment(paymentData: CreatePaymentRequest): Promise<ApiResponse<Payment>> {
    try {
      return await apiClient.post<ApiResponse<Payment>>('/payments', paymentData);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getPaymentById(id: string): Promise<ApiResponse<Payment>> {
    try {
      return await apiClient.get<ApiResponse<Payment>>(`/payments/${id}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getMyPayments(filters?: {
    status?: PaymentStatus;
    method?: PaymentMethod;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{
    payments: Payment[];
    pagination: any;
  }>> {
    try {
      return await apiClient.get<ApiResponse<{
        payments: Payment[];
        pagination: any;
      }>>('/payments/my-payments', filters);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async processPayment(paymentId: string, providerData?: any): Promise<ApiResponse<Payment>> {
    try {
      return await apiClient.post<ApiResponse<Payment>>(`/payments/${paymentId}/process`, providerData);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async confirmPayment(paymentId: string, confirmationData: {
    reference: string;
    provider_response?: any;
  }): Promise<ApiResponse<Payment>> {
    try {
      return await apiClient.post<ApiResponse<Payment>>(`/payments/${paymentId}/confirm`, confirmationData);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async cancelPayment(paymentId: string, reason?: string): Promise<ApiResponse<Payment>> {
    try {
      return await apiClient.post<ApiResponse<Payment>>(`/payments/${paymentId}/cancel`, { reason });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async refundPayment(paymentId: string, amount?: number, reason?: string): Promise<ApiResponse<Payment>> {
    try {
      return await apiClient.post<ApiResponse<Payment>>(`/payments/${paymentId}/refund`, {
        amount,
        reason
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getPaymentMethods(): Promise<ApiResponse<PaymentMethod[]>> {
    try {
      return await apiClient.get<ApiResponse<PaymentMethod[]>>('/payments/methods');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async savePaymentMethod(methodData: {
    type: PaymentMethod;
    provider: PaymentProvider;
    account_number?: string;
    account_name?: string;
    is_default?: boolean;
  }): Promise<ApiResponse<PaymentMethod>> {
    try {
      return await apiClient.post<ApiResponse<PaymentMethod>>('/payments/methods', methodData);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deletePaymentMethod(methodId: string): Promise<ApiResponse> {
    try {
      return await apiClient.delete<ApiResponse>(`/payments/methods/${methodId}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getPaymentProviders(): Promise<ApiResponse<PaymentProvider[]>> {
    try {
      return await apiClient.get<ApiResponse<PaymentProvider[]>>('/payments/providers');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async initiateMobileMoneyPayment(paymentData: {
    amount: number;
    phone: string;
    provider: 'mtn' | 'orange' | 'express_union' | 'camtel';
    description?: string;
  }): Promise<ApiResponse<{
    payment_id: string;
    reference: string;
    status_url: string;
  }>> {
    try {
      return await apiClient.post<ApiResponse<{
        payment_id: string;
        reference: string;
        status_url: string;
      }>>('/payments/mobile-money/initiate', paymentData);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async checkMobileMoneyStatus(reference: string): Promise<ApiResponse<{
    status: PaymentStatus;
    payment_id: string;
    transaction_id?: string;
  }>> {
    try {
      return await apiClient.get<ApiResponse<{
        status: PaymentStatus;
        payment_id: string;
        transaction_id?: string;
      }>>(`/payments/mobile-money/status/${reference}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async initiateStripePayment(paymentData: {
    amount: number;
    currency: string;
    description?: string;
    metadata?: Record<string, any>;
  }): Promise<ApiResponse<{
    payment_id: string;
    client_secret: string;
    payment_intent_id: string;
  }>> {
    try {
      return await apiClient.post<ApiResponse<{
        payment_id: string;
        client_secret: string;
        payment_intent_id: string;
      }>>('/payments/stripe/initiate', paymentData);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async confirmStripePayment(paymentIntentId: string, paymentMethodId?: string): Promise<ApiResponse<Payment>> {
    try {
      return await apiClient.post<ApiResponse<Payment>>(`/payments/stripe/confirm/${paymentIntentId}`, {
        payment_method_id: paymentMethodId
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async initiateCampayPayment(paymentData: {
    amount: number;
    phone: string;
    description?: string;
    external_reference?: string;
  }): Promise<ApiResponse<{
    payment_id: string;
    reference: string;
    status_url: string;
  }>> {
    try {
      return await apiClient.post<ApiResponse<{
        payment_id: string;
        reference: string;
        status_url: string;
      }>>('/payments/campay/initiate', paymentData);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async checkCampayStatus(reference: string): Promise<ApiResponse<{
    status: PaymentStatus;
    payment_id: string;
    transaction_id?: string;
  }>> {
    try {
      return await apiClient.get<ApiResponse<{
        status: PaymentStatus;
        payment_id: string;
        transaction_id?: string;
      }>>(`/payments/campay/status/${reference}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async initiateNoupiaPayment(paymentData: {
    amount: number;
    phone: string;
    description?: string;
  }): Promise<ApiResponse<{
    payment_id: string;
    reference: string;
    status_url: string;
  }>> {
    try {
      return await apiClient.post<ApiResponse<{
        payment_id: string;
        reference: string;
        status_url: string;
      }>>('/payments/noupia/initiate', paymentData);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async checkNoupiaStatus(reference: string): Promise<ApiResponse<{
    status: PaymentStatus;
    payment_id: string;
    transaction_id?: string;
  }>> {
    try {
      return await apiClient.get<ApiResponse<{
        status: PaymentStatus;
        payment_id: string;
        transaction_id?: string;
      }>>(`/payments/noupia/status/${reference}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getPaymentStats(): Promise<ApiResponse<{
    total_payments: number;
    successful_payments: number;
    failed_payments: number;
    total_amount: number;
    monthly_stats: any[];
  }>> {
    try {
      return await apiClient.get<ApiResponse<{
        total_payments: number;
        successful_payments: number;
        failed_payments: number;
        total_amount: number;
        monthly_stats: any[];
      }>>('/payments/stats');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (error.message) {
      return new Error(error.message);
    }
    return new Error('Payment service error occurred');
  }
}

export const paymentService = new PaymentService();
