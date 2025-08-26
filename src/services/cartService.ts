import { apiClient } from './api';
import { Cart, CartItem, ApiResponse } from '../models';

export class CartService {
  async getCart(): Promise<ApiResponse<Cart>> {
    try {
      return await apiClient.get<ApiResponse<Cart>>('/cart');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async addToCart(productId: string, quantity: number = 1): Promise<ApiResponse<CartItem>> {
    try {
      return await apiClient.post<ApiResponse<CartItem>>('/cart/items', {
        product_id: productId,
        quantity
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateCartItem(itemId: string, quantity: number): Promise<ApiResponse<CartItem>> {
    try {
      return await apiClient.put<ApiResponse<CartItem>>(`/cart/items/${itemId}`, {
        quantity
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async removeFromCart(itemId: string): Promise<ApiResponse> {
    try {
      return await apiClient.delete<ApiResponse>(`/cart/items/${itemId}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async clearCart(): Promise<ApiResponse> {
    try {
      return await apiClient.delete<ApiResponse>('/cart/clear');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getCartItemCount(): Promise<number> {
    try {
      const response = await apiClient.get<ApiResponse<{ count: number }>>('/cart/count');
      return response.data?.count || 0;
    } catch (error) {
      return 0;
    }
  }

  private handleError(error: any): Error {
    if (error.message) {
      return new Error(error.message);
    }
    return new Error('Cart service error occurred');
  }
}

export const cartService = new CartService();