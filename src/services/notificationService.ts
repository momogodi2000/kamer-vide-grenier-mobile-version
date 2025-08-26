import { apiClient } from './api';
import { Notification, ApiResponse, PaginationParams } from '../models';

export class NotificationService {
  async getNotifications(params: PaginationParams = {}): Promise<ApiResponse<{
    notifications: Notification[];
    pagination: any;
  }>> {
    try {
      return await apiClient.get<ApiResponse<{
        notifications: Notification[];
        pagination: any;
      }>>('/notifications', params);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async markAsRead(notificationId: string): Promise<ApiResponse> {
    try {
      return await apiClient.patch<ApiResponse>(`/notifications/${notificationId}/read`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async markAllAsRead(): Promise<ApiResponse> {
    try {
      return await apiClient.patch<ApiResponse>('/notifications/read-all');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteNotification(notificationId: string): Promise<ApiResponse> {
    try {
      return await apiClient.delete<ApiResponse>(`/notifications/${notificationId}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getUnreadCount(): Promise<number> {
    try {
      const response = await apiClient.get<ApiResponse<{ count: number }>>('/notifications/unread-count');
      return response.data?.count || 0;
    } catch (error) {
      return 0;
    }
  }

  async updatePushToken(token: string): Promise<ApiResponse> {
    try {
      return await apiClient.post<ApiResponse>('/notifications/push-token', {
        token
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateNotificationSettings(settings: {
    push_notifications?: boolean;
    email_notifications?: boolean;
    sms_notifications?: boolean;
  }): Promise<ApiResponse> {
    try {
      return await apiClient.put<ApiResponse>('/notifications/settings', settings);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (error.message) {
      return new Error(error.message);
    }
    return new Error('Notification service error occurred');
  }
}

export const notificationService = new NotificationService();