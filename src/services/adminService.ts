import api from './api';

export interface AdminStats {
  totalUsers: number;
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  userGrowth: number;
  revenueGrowth: number;
  activeUsers: number;
  pendingWithdrawals: number;
  monthlyRevenue: number[];
  usersByRole: Array<{ name: string; count: number; color: string }>;
  recentOrders: any[];
  topSellers: any[];
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  amount: number;
  fee: number;
  netAmount: number;
  paymentMethod: string;
  paymentDetails: any;
  status: 'pending' | 'approved' | 'processing' | 'completed' | 'rejected';
  requestedAt: string;
  processedAt?: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
}

class AdminService {
  async getDashboardStats(): Promise<AdminStats> {
    try {
      const response = await api.get('/admin/stats/dashboard');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch admin dashboard stats:', error);
      throw error;
    }
  }

  async getUsers(page: number = 1, limit: number = 20, filters?: any) {
    try {
      const response = await api.get('/admin/users', {
        params: { page, limit, ...filters }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch users:', error);
      throw error;
    }
  }

  async updateUser(userId: string, data: any) {
    try {
      const response = await api.put(`/admin/users/${userId}`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  }

  async banUser(userId: string, reason: string) {
    try {
      const response = await api.post(`/admin/users/${userId}/ban`, { reason });
      return response.data;
    } catch (error) {
      console.error('Failed to ban user:', error);
      throw error;
    }
  }

  async unbanUser(userId: string) {
    try {
      const response = await api.post(`/admin/users/${userId}/unban`);
      return response.data;
    } catch (error) {
      console.error('Failed to unban user:', error);
      throw error;
    }
  }

  async getWithdrawalRequests(page: number = 1, limit: number = 20, status?: string): Promise<{
    requests: WithdrawalRequest[];
    total: number;
    pages: number;
  }> {
    try {
      const response = await api.get('/admin/withdrawals', {
        params: { page, limit, status }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch withdrawal requests:', error);
      throw error;
    }
  }

  async approveWithdrawal(requestId: string, notes?: string) {
    try {
      const response = await api.post(`/admin/withdrawals/${requestId}/approve`, { notes });
      return response.data;
    } catch (error) {
      console.error('Failed to approve withdrawal:', error);
      throw error;
    }
  }

  async rejectWithdrawal(requestId: string, reason: string) {
    try {
      const response = await api.post(`/admin/withdrawals/${requestId}/reject`, { reason });
      return response.data;
    } catch (error) {
      console.error('Failed to reject withdrawal:', error);
      throw error;
    }
  }

  async getAnalytics(period: '7d' | '30d' | '90d' | '1y' = '30d') {
    try {
      const response = await api.get('/admin/analytics', {
        params: { period }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      throw error;
    }
  }

  async getRevenueAnalytics(startDate?: string, endDate?: string) {
    try {
      const response = await api.get('/admin/analytics/revenue', {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch revenue analytics:', error);
      throw error;
    }
  }

  async getUserAnalytics() {
    try {
      const response = await api.get('/admin/analytics/users');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user analytics:', error);
      throw error;
    }
  }

  async getOrderAnalytics() {
    try {
      const response = await api.get('/admin/analytics/orders');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch order analytics:', error);
      throw error;
    }
  }

  async exportData(type: 'users' | 'orders' | 'transactions' | 'analytics', format: 'csv' | 'xlsx' = 'csv') {
    try {
      const response = await api.get(`/admin/export/${type}`, {
        params: { format },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Failed to export data:', error);
      throw error;
    }
  }

  async getSystemHealth() {
    try {
      const response = await api.get('/admin/system/health');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch system health:', error);
      throw error;
    }
  }

  async getSystemLogs(level?: 'error' | 'warn' | 'info', limit: number = 100) {
    try {
      const response = await api.get('/admin/system/logs', {
        params: { level, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch system logs:', error);
      throw error;
    }
  }

  async updateCommissionConfig(configId: string, config: any) {
    try {
      const response = await api.put(`/admin/commission/${configId}`, config);
      return response.data;
    } catch (error) {
      console.error('Failed to update commission config:', error);
      throw error;
    }
  }

  async getCommissionConfigs() {
    try {
      const response = await api.get('/admin/commission');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch commission configs:', error);
      throw error;
    }
  }

  async createCommissionConfig(config: any) {
    try {
      const response = await api.post('/admin/commission', config);
      return response.data;
    } catch (error) {
      console.error('Failed to create commission config:', error);
      throw error;
    }
  }
}

export const adminService = new AdminService();