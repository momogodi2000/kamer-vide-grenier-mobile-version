import { apiClient } from './api';
import { 
  Order, 
  CreateOrderRequest, 
  UpdateOrderStatusRequest,
  OrderSearchFilters,
  OrderSearchResponse,
  ApiResponse 
} from '../models';

export class OrderService {
  async createOrder(orderData: CreateOrderRequest): Promise<ApiResponse<Order>> {
    try {
      return await apiClient.post<ApiResponse<Order>>('/orders', orderData);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getMyOrders(filters: OrderSearchFilters = {}): Promise<OrderSearchResponse> {
    try {
      return await apiClient.get<OrderSearchResponse>('/orders/my-orders', filters);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getMySales(filters: OrderSearchFilters = {}): Promise<OrderSearchResponse> {
    try {
      return await apiClient.get<OrderSearchResponse>('/orders/my-sales', filters);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getOrderById(id: string): Promise<ApiResponse<Order>> {
    try {
      return await apiClient.get<ApiResponse<Order>>(`/orders/${id}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateOrderStatus(orderId: string, statusData: UpdateOrderStatusRequest): Promise<ApiResponse<Order>> {
    try {
      return await apiClient.patch<ApiResponse<Order>>(`/orders/${orderId}/status`, statusData);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async cancelOrder(orderId: string, reason: string): Promise<ApiResponse<Order>> {
    try {
      return await apiClient.patch<ApiResponse<Order>>(`/orders/${orderId}/cancel`, { reason });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async confirmDelivery(orderId: string): Promise<ApiResponse<Order>> {
    try {
      return await apiClient.patch<ApiResponse<Order>>(`/orders/${orderId}/confirm-delivery`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async requestRefund(orderId: string, reason: string, amount?: number): Promise<ApiResponse> {
    try {
      return await apiClient.post<ApiResponse>(`/orders/${orderId}/refund`, {
        reason,
        amount
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async rateOrder(orderId: string, rating: number, comment?: string, rateType: 'buyer' | 'seller' = 'buyer'): Promise<ApiResponse> {
    try {
      return await apiClient.post<ApiResponse>(`/orders/${orderId}/rate`, {
        rating,
        comment,
        rate_type: rateType
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async trackOrder(orderId: string): Promise<ApiResponse<{ tracking_info: any }>> {
    try {
      return await apiClient.get<ApiResponse<{ tracking_info: any }>>(`/orders/${orderId}/tracking`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getOrderMessages(orderId: string): Promise<ApiResponse<any[]>> {
    try {
      return await apiClient.get<ApiResponse<any[]>>(`/orders/${orderId}/messages`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async sendOrderMessage(orderId: string, message: string): Promise<ApiResponse> {
    try {
      return await apiClient.post<ApiResponse>(`/orders/${orderId}/messages`, { message });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async initiatePayment(orderId: string, paymentData: {
    payment_method: string;
    mobile_money_provider?: string;
    payment_phone?: string;
  }): Promise<ApiResponse<{ payment_url?: string; payment_reference: string }>> {
    try {
      return await apiClient.post<ApiResponse<{ payment_url?: string; payment_reference: string }>>(`/orders/${orderId}/payment`, paymentData);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async confirmPayment(orderId: string, paymentReference: string): Promise<ApiResponse<Order>> {
    try {
      return await apiClient.patch<ApiResponse<Order>>(`/orders/${orderId}/payment/confirm`, {
        payment_reference: paymentReference
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getPaymentMethods(): Promise<ApiResponse<any[]>> {
    try {
      return await apiClient.get<ApiResponse<any[]>>('/payments/methods');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async calculateShippingFee(orderData: {
    seller_id: string;
    delivery_address: any;
    items: { product_id: string; quantity: number }[];
  }): Promise<ApiResponse<{ delivery_fee: number; estimated_delivery: string }>> {
    try {
      return await apiClient.post<ApiResponse<{ delivery_fee: number; estimated_delivery: string }>>('/orders/calculate-shipping', orderData);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getOrderStatistics(): Promise<ApiResponse<{
    total_orders: number;
    total_sales: number;
    pending_orders: number;
    completed_orders: number;
    total_revenue: number;
    total_spent: number;
  }>> {
    try {
      return await apiClient.get<ApiResponse<{
        total_orders: number;
        total_sales: number;
        pending_orders: number;
        completed_orders: number;
        total_revenue: number;
        total_spent: number;
      }>>('/orders/statistics');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async raiseDispute(orderId: string, reason: string, details: string): Promise<ApiResponse> {
    try {
      return await apiClient.post<ApiResponse>(`/orders/${orderId}/dispute`, {
        reason,
        details
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (error.message) {
      return new Error(error.message);
    }
    if (error.errors) {
      const firstError = Object.values(error.errors)[0];
      return new Error(Array.isArray(firstError) ? firstError[0] : String(firstError));
    }
    return new Error('An unknown order service error occurred');
  }
}

export const orderService = new OrderService();