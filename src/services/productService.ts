import { apiClient } from './api';
import { 
  Product, 
  CreateProductRequest, 
  ProductSearchFilters, 
  ProductSearchResponse,
  Category,
  ApiResponse 
} from '../models';

export class ProductService {
  async searchProducts(filters: ProductSearchFilters = {}): Promise<ProductSearchResponse> {
    try {
      return await apiClient.get<ProductSearchResponse>('/products/search', filters);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getFeaturedProducts(): Promise<ApiResponse<Product[]>> {
    try {
      return await apiClient.get<ApiResponse<Product[]>>('/products/featured');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getRecentProducts(limit: number = 20): Promise<ApiResponse<Product[]>> {
    try {
      return await apiClient.get<ApiResponse<Product[]>>('/products/recent', { limit });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getProductById(id: string): Promise<ApiResponse<Product>> {
    try {
      return await apiClient.get<ApiResponse<Product>>(`/products/${id}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createProduct(productData: CreateProductRequest): Promise<ApiResponse<Product>> {
    try {
      return await apiClient.post<ApiResponse<Product>>('/products', productData);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateProduct(id: string, updates: Partial<CreateProductRequest>): Promise<ApiResponse<Product>> {
    try {
      return await apiClient.put<ApiResponse<Product>>(`/products/${id}`, updates);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteProduct(id: string): Promise<ApiResponse> {
    try {
      return await apiClient.delete<ApiResponse>(`/products/${id}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getMyProducts(page: number = 1, limit: number = 20): Promise<ProductSearchResponse> {
    try {
      return await apiClient.get<ProductSearchResponse>('/products/my-products', { page, limit });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async uploadProductImages(productId: string, images: FormData): Promise<ApiResponse<{ urls: string[] }>> {
    try {
      return await apiClient.upload<ApiResponse<{ urls: string[] }>>(`/products/${productId}/upload`, images);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async addToWishlist(productId: string): Promise<ApiResponse> {
    try {
      return await apiClient.post<ApiResponse>(`/products/${productId}/wishlist`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async removeFromWishlist(productId: string): Promise<ApiResponse> {
    try {
      return await apiClient.delete<ApiResponse>(`/products/${productId}/wishlist`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getWishlist(page: number = 1, limit: number = 20): Promise<ProductSearchResponse> {
    try {
      return await apiClient.get<ProductSearchResponse>('/products/wishlist', { page, limit });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async reportProduct(productId: string, reason: string, details?: string): Promise<ApiResponse> {
    try {
      return await apiClient.post<ApiResponse>(`/products/${productId}/report`, {
        reason,
        details
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async shareProduct(productId: string): Promise<ApiResponse<{ share_url: string }>> {
    try {
      return await apiClient.post<ApiResponse<{ share_url: string }>>(`/products/${productId}/share`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async viewProduct(productId: string): Promise<void> {
    try {
      await apiClient.post(`/products/${productId}/view`);
    } catch (error) {
      // Silent fail for analytics
      console.warn('Failed to record product view:', error);
    }
  }

  async getCategories(): Promise<ApiResponse<Category[]>> {
    try {
      return await apiClient.get<ApiResponse<Category[]>>('/products/categories');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getCategoryById(id: string): Promise<ApiResponse<Category>> {
    try {
      return await apiClient.get<ApiResponse<Category>>(`/products/categories/${id}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getProductsByCategory(categoryId: string, filters: ProductSearchFilters = {}): Promise<ProductSearchResponse> {
    try {
      return await apiClient.get<ProductSearchResponse>(`/products/categories/${categoryId}/products`, filters);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getSimilarProducts(productId: string, limit: number = 10): Promise<ApiResponse<Product[]>> {
    try {
      return await apiClient.get<ApiResponse<Product[]>>(`/products/${productId}/similar`, { limit });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getSellerProducts(sellerId: string, filters: ProductSearchFilters = {}): Promise<ProductSearchResponse> {
    try {
      return await apiClient.get<ProductSearchResponse>(`/products/seller/${sellerId}`, filters);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async recognizeProduct(imageFormData: FormData): Promise<ApiResponse<{ ai: string; image_url: string }>> {
    try {
      return await apiClient.upload<ApiResponse<{ ai: string; image_url: string }>>('/ai/recognize-image', imageFormData);
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
    return new Error('An unknown product service error occurred');
  }
}

export const productService = new ProductService();