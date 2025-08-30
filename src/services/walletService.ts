import { apiClient } from './api';
import {
  Wallet,
  WalletTransaction,
  Withdrawal,
  CreateWithdrawalRequest,
  ApiResponse
} from '../models';

export class WalletService {
  async getWallet(): Promise<ApiResponse<Wallet>> {
    try {
      return await apiClient.get<ApiResponse<Wallet>>('/wallet');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getWalletBalance(): Promise<ApiResponse<{ balance: number; currency: string }>> {
    try {
      return await apiClient.get<ApiResponse<{ balance: number; currency: string }>>('/wallet/balance');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getWalletTransactions(filters?: {
    type?: 'credit' | 'debit';
    status?: 'pending' | 'completed' | 'failed';
    page?: number;
    limit?: number;
    start_date?: string;
    end_date?: string;
  }): Promise<ApiResponse<{
    transactions: WalletTransaction[];
    pagination: any;
  }>> {
    try {
      return await apiClient.get<ApiResponse<{
        transactions: WalletTransaction[];
        pagination: any;
      }>>('/wallet/transactions', filters);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getWithdrawals(filters?: {
    status?: 'pending' | 'processing' | 'paid' | 'failed' | 'on_hold';
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{
    withdrawals: Withdrawal[];
    pagination: any;
  }>> {
    try {
      return await apiClient.get<ApiResponse<{
        withdrawals: Withdrawal[];
        pagination: any;
      }>>('/wallet/withdrawals', filters);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async requestWithdrawal(withdrawalData: CreateWithdrawalRequest): Promise<ApiResponse<Withdrawal>> {
    try {
      return await apiClient.post<ApiResponse<Withdrawal>>('/wallet/withdrawals', withdrawalData);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async cancelWithdrawal(withdrawalId: string, reason?: string): Promise<ApiResponse<Withdrawal>> {
    try {
      return await apiClient.post<ApiResponse<Withdrawal>>(`/wallet/withdrawals/${withdrawalId}/cancel`, { reason });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getWithdrawalById(withdrawalId: string): Promise<ApiResponse<Withdrawal>> {
    try {
      return await apiClient.get<ApiResponse<Withdrawal>>(`/wallet/withdrawals/${withdrawalId}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async addFunds(amount: number, paymentMethod: string, description?: string): Promise<ApiResponse<{
    payment_id: string;
    payment_url?: string;
    reference?: string;
  }>> {
    try {
      return await apiClient.post<ApiResponse<{
        payment_id: string;
        payment_url?: string;
        reference?: string;
      }>>('/wallet/add-funds', {
        amount,
        payment_method: paymentMethod,
        description
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async transferFunds(recipientId: string, amount: number, description?: string): Promise<ApiResponse<WalletTransaction>> {
    try {
      return await apiClient.post<ApiResponse<WalletTransaction>>('/wallet/transfer', {
        recipient_id: recipientId,
        amount,
        description
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getTransferHistory(filters?: {
    direction?: 'sent' | 'received';
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{
    transfers: WalletTransaction[];
    pagination: any;
  }>> {
    try {
      return await apiClient.get<ApiResponse<{
        transfers: WalletTransaction[];
        pagination: any;
      }>>('/wallet/transfers', filters);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getWalletStats(): Promise<ApiResponse<{
    total_balance: number;
    total_earned: number;
    total_spent: number;
    total_withdrawn: number;
    pending_withdrawals: number;
    monthly_stats: any[];
  }>> {
    try {
      return await apiClient.get<ApiResponse<{
        total_balance: number;
        total_earned: number;
        total_spent: number;
        total_withdrawn: number;
        pending_withdrawals: number;
        monthly_stats: any[];
      }>>('/wallet/stats');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getLoyaltyPoints(): Promise<ApiResponse<{
    points: number;
    level: string;
    next_level_points: number;
    benefits: string[];
  }>> {
    try {
      return await apiClient.get<ApiResponse<{
        points: number;
        level: string;
        next_level_points: number;
        benefits: string[];
      }>>('/wallet/loyalty');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async redeemLoyaltyPoints(points: number, rewardType: string): Promise<ApiResponse<{
    success: boolean;
    message: string;
    remaining_points: number;
  }>> {
    try {
      return await apiClient.post<ApiResponse<{
        success: boolean;
        message: string;
        remaining_points: number;
      }>>('/wallet/loyalty/redeem', {
        points,
        reward_type: rewardType
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getLoyaltyHistory(page?: number, limit?: number): Promise<ApiResponse<{
    history: any[];
    pagination: any;
  }>> {
    try {
      return await apiClient.get<ApiResponse<{
        history: any[];
        pagination: any;
      }>>('/wallet/loyalty/history', { page, limit });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAvailableRewards(): Promise<ApiResponse<any[]>> {
    try {
      return await apiClient.get<ApiResponse<any[]>>('/wallet/rewards');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async claimReward(rewardId: string): Promise<ApiResponse<{
    success: boolean;
    message: string;
    reward: any;
  }>> {
    try {
      return await apiClient.post<ApiResponse<{
        success: boolean;
        message: string;
        reward: any;
      }>>('/wallet/rewards/claim', { reward_id: rewardId });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (error.message) {
      return new Error(error.message);
    }
    return new Error('Wallet service error occurred');
  }
}

export const walletService = new WalletService();
