import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from './api';
import {
  User,
  LoginRequest,
  LoginResponse,
  CreateUserRequest,
  UpdateProfileRequest,
  ApiResponse,
} from '../models';

export class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<any>('/auth/login', {
        identifier: credentials.email,
        password: credentials.password,
      });
      
      if (response.success && response.data?.tokens && response.data?.user) {
        const loginResponse: LoginResponse = {
          success: true,
          token: response.data.tokens.accessToken,
          refresh_token: response.data.tokens.refreshToken,
          user: response.data.user
        };
        await this.storeAuthData(loginResponse);
        this.currentUser = response.data.user;
        return loginResponse;
      }
      
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async register(userData: CreateUserRequest): Promise<LoginResponse> {
    try {
      const registerData = {
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        phone: userData.phone,
        password: userData.password,
        city: userData.city,
        region: userData.region,
        terms_accepted: userData.terms_accepted,
        preferred_language: userData.preferred_language || 'fr',
      };
      
      const response = await apiClient.post<any>('/auth/register', registerData);
      
      if (response.success && response.data?.tokens) {
        const loginResponse = {
          success: true,
          token: response.data.tokens.accessToken,
          refresh_token: response.data.tokens.refreshToken,
          user: response.data.user,
        };
        await this.storeAuthData(loginResponse);
        this.currentUser = response.data.user;
        return loginResponse;
      }
      
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn('Logout API call failed:', error);
    } finally {
      await this.clearAuthData();
    }
  }

  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      if (!refreshToken) {
        return false;
      }

      const response = await apiClient.post<any>('/auth/refresh', {
        refreshToken: refreshToken,
      });

      if (response.success && response.data?.tokens) {
        const loginResponse = {
          success: true,
          token: response.data.tokens.accessToken,
          refresh_token: response.data.tokens.refreshToken,
          user: this.currentUser!,
        };
        await this.storeAuthData(loginResponse);
        return true;
      }

      return false;
    } catch (error) {
      await this.clearAuthData();
      return false;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    if (this.currentUser) {
      return this.currentUser;
    }

    try {
      const userData = await AsyncStorage.getItem('user_data');
      if (userData) {
        this.currentUser = JSON.parse(userData);
        return this.currentUser;
      }

      // Try to fetch from API
      const response = await apiClient.get<ApiResponse<User>>('/auth/me');
      if (response.success && response.data) {
        this.currentUser = response.data;
        await AsyncStorage.setItem('user_data', JSON.stringify(this.currentUser));
        return this.currentUser;
      }
    } catch (error) {
      console.warn('Failed to get current user:', error);
    }

    return null;
  }

  async updateProfile(updates: UpdateProfileRequest): Promise<ApiResponse<User>> {
    try {
      const response = await apiClient.put<ApiResponse<User>>('/users/profile', updates);
      
      if (response.success && response.data) {
        this.currentUser = response.data;
        await AsyncStorage.setItem('user_data', JSON.stringify(this.currentUser));
      }
      
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse> {
    try {
      return await apiClient.post<ApiResponse>('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async forgotPassword(email: string): Promise<ApiResponse> {
    try {
      return await apiClient.post<ApiResponse>('/auth/forgot-password', { email });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async resetPassword(token: string, password: string): Promise<ApiResponse> {
    try {
      return await apiClient.post<ApiResponse>('/auth/reset-password', {
        token,
        password,
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async verifyEmail(token: string): Promise<ApiResponse> {
    try {
      return await apiClient.post<ApiResponse>('/auth/verify-email', { token });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async verifyPhone(code: string): Promise<ApiResponse> {
    try {
      return await apiClient.post<ApiResponse>('/auth/verify-phone', { code });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async resendVerificationEmail(): Promise<ApiResponse> {
    try {
      return await apiClient.post<ApiResponse>('/auth/resend-verification');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async submitKyc(kycData: any): Promise<ApiResponse> {
    try {
      return await apiClient.post<ApiResponse>('/users/kyc/submit', kycData);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getKycStatus(): Promise<ApiResponse> {
    try {
      return await apiClient.get<ApiResponse>('/users/kyc/status');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) {
      return false;
    }

    try {
      // Verify token is still valid
      const response = await apiClient.get('/auth/verify-token');
      return response.success;
    } catch (error) {
      // Token is invalid, clear it
      await this.clearAuthData();
      return false;
    }
  }

  private async storeAuthData(data: LoginResponse): Promise<void> {
    await Promise.all([
      apiClient.setAuthToken(data.token),
      AsyncStorage.setItem('refresh_token', data.refresh_token),
      AsyncStorage.setItem('user_data', JSON.stringify(data.user)),
    ]);
  }

  private async clearAuthData(): Promise<void> {
    this.currentUser = null;
    await apiClient.clearTokens();
  }

  private handleError(error: any): Error {
    if (error.message) {
      return new Error(error.message);
    }
    if (error.errors) {
      const firstError = Object.values(error.errors)[0];
      return new Error(Array.isArray(firstError) ? firstError[0] : String(firstError));
    }
    return new Error('An unknown authentication error occurred');
  }
}

export const authService = AuthService.getInstance(); 
 