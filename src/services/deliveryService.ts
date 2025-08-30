import api from './api';

export interface DeliveryOrder {
  id: string;
  orderId: string;
  pickupAddress: string;
  deliveryAddress: string;
  customerName: string;
  customerPhone: string;
  deliveryFee: number;
  status: 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
  assignedAt: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  distance: number;
  estimatedTime: number;
  specialInstructions?: string;
  products: Array<{
    name: string;
    quantity: number;
    fragile: boolean;
  }>;
  trackingNumber: string;
}

export interface DeliveryStats {
  totalDeliveries: number;
  completedDeliveries: number;
  pendingDeliveries: number;
  monthlyEarnings: number;
  averageRating: number;
  totalDistance: number;
  activeHours: number;
  currentShift: boolean;
  pendingOrders: any[];
  completedToday: number;
  weeklyStats: number[];
  performanceRating: string;
}

export interface ShiftStatus {
  isActive: boolean;
  startTime?: string;
  endTime?: string;
  deliveriesToday: number;
  hoursWorked: number;
  totalEarnings: number;
}

class DeliveryService {
  async getDeliveryStats(): Promise<DeliveryStats> {
    try {
      const response = await api.get('/delivery/stats');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch delivery stats:', error);
      throw error;
    }
  }

  async getAssignedOrders(page: number = 1, limit: number = 20): Promise<{
    orders: DeliveryOrder[];
    total: number;
    pages: number;
  }> {
    try {
      const response = await api.get('/delivery/orders', {
        params: { page, limit, status: 'assigned' }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch assigned orders:', error);
      throw error;
    }
  }

  async getOrderHistory(page: number = 1, limit: number = 20): Promise<{
    orders: DeliveryOrder[];
    total: number;
    pages: number;
  }> {
    try {
      const response = await api.get('/delivery/orders/history', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch order history:', error);
      throw error;
    }
  }

  async acceptOrder(orderId: string) {
    try {
      const response = await api.post(`/delivery/orders/${orderId}/accept`);
      return response.data;
    } catch (error) {
      console.error('Failed to accept order:', error);
      throw error;
    }
  }

  async rejectOrder(orderId: string, reason?: string) {
    try {
      const response = await api.post(`/delivery/orders/${orderId}/reject`, { reason });
      return response.data;
    } catch (error) {
      console.error('Failed to reject order:', error);
      throw error;
    }
  }

  async markOrderPickedUp(orderId: string, pickupProof?: any) {
    try {
      const response = await api.post(`/delivery/orders/${orderId}/pickup`, {
        pickupProof,
        timestamp: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Failed to mark order as picked up:', error);
      throw error;
    }
  }

  async markOrderDelivered(orderId: string, deliveryProof: any, recipientName?: string) {
    try {
      const response = await api.post(`/delivery/orders/${orderId}/deliver`, {
        deliveryProof,
        recipientName,
        timestamp: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Failed to mark order as delivered:', error);
      throw error;
    }
  }

  async updateLocation(latitude: number, longitude: number) {
    try {
      const response = await api.post('/delivery/location', {
        latitude,
        longitude,
        timestamp: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Failed to update location:', error);
      throw error;
    }
  }

  async startShift() {
    try {
      const response = await api.post('/delivery/shift/start');
      return response.data;
    } catch (error) {
      console.error('Failed to start shift:', error);
      throw error;
    }
  }

  async endShift() {
    try {
      const response = await api.post('/delivery/shift/end');
      return response.data;
    } catch (error) {
      console.error('Failed to end shift:', error);
      throw error;
    }
  }

  async getShiftStatus(): Promise<ShiftStatus> {
    try {
      const response = await api.get('/delivery/shift/status');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch shift status:', error);
      throw error;
    }
  }

  async getEarningsHistory(startDate?: string, endDate?: string) {
    try {
      const response = await api.get('/delivery/earnings', {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch earnings history:', error);
      throw error;
    }
  }

  async reportIssue(orderId: string, issueType: string, description: string, attachments?: any[]) {
    try {
      const response = await api.post(`/delivery/orders/${orderId}/report`, {
        issueType,
        description,
        attachments,
        timestamp: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Failed to report issue:', error);
      throw error;
    }
  }

  async getOrderDetails(orderId: string): Promise<DeliveryOrder> {
    try {
      const response = await api.get(`/delivery/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch order details:', error);
      throw error;
    }
  }

  async getOptimalRoute(orders: string[]) {
    try {
      const response = await api.post('/delivery/route/optimize', { orders });
      return response.data;
    } catch (error) {
      console.error('Failed to get optimal route:', error);
      throw error;
    }
  }

  async updateDeliveryStatus(orderId: string, status: string, notes?: string, location?: { lat: number; lng: number }) {
    try {
      const response = await api.put(`/delivery/orders/${orderId}/status`, {
        status,
        notes,
        location,
        timestamp: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Failed to update delivery status:', error);
      throw error;
    }
  }

  async getPerformanceMetrics(period: '7d' | '30d' | '90d' = '30d') {
    try {
      const response = await api.get('/delivery/metrics', {
        params: { period }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch performance metrics:', error);
      throw error;
    }
  }

  async submitFeedback(rating: number, comment: string, category?: string) {
    try {
      const response = await api.post('/delivery/feedback', {
        rating,
        comment,
        category,
        timestamp: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      throw error;
    }
  }
}

export const deliveryService = new DeliveryService();