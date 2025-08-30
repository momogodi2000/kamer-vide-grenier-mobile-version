import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { deliveryService } from '../../services/deliveryService';

interface DeliveryOrder {
  id: string;
  order_id: string;
  delivery_agent_id?: string;
  pickup_address: string;
  delivery_address: string;
  customer_name: string;
  customer_phone: string;
  delivery_fee: number;
  status: 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled' | 'failed';
  assigned_at?: string;
  picked_up_at?: string;
  delivered_at?: string;
  estimated_time?: number;
  actual_time?: number;
  distance?: number;
  special_instructions?: string;
  products: Array<{
    name: string;
    quantity: number;
    fragile: boolean;
    dimensions?: {
      weight?: number;
      length?: number;
      width?: number;
      height?: number;
    };
  }>;
  tracking_number: string;
  qr_code?: string;
  current_location?: {
    latitude: number;
    longitude: number;
    timestamp: string;
  };
  delivery_attempts: number;
  max_attempts: number;
  created_at: string;
  updated_at: string;
}

interface DeliveryStats {
  total_deliveries: number;
  completed_deliveries: number;
  pending_deliveries: number;
  cancelled_deliveries: number;
  monthly_earnings: number;
  average_rating: number;
  total_distance: number;
  active_hours: number;
  current_shift: boolean;
  pending_orders: DeliveryOrder[];
  completed_today: number;
  weekly_stats: number[];
  performance_rating: string;
  earnings_breakdown: {
    base_fare: number;
    distance_bonus: number;
    time_bonus: number;
    tips: number;
  };
}

interface ShiftStatus {
  is_active: boolean;
  start_time?: string;
  end_time?: string;
  deliveries_today: number;
  hours_worked: number;
  total_earnings: number;
  current_location?: {
    latitude: number;
    longitude: number;
  };
}

interface DeliveryState {
  deliveryOrders: DeliveryOrder[];
  assignedOrders: DeliveryOrder[];
  completedOrders: DeliveryOrder[];
  selectedOrder: DeliveryOrder | null;
  stats: DeliveryStats | null;
  shiftStatus: ShiftStatus | null;
  isLoading: boolean;
  isProcessing: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// Async thunks
export const getDeliveryStats = createAsyncThunk(
  'delivery/getStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await deliveryService.getDeliveryStats();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getAssignedOrders = createAsyncThunk(
  'delivery/getAssignedOrders',
  async (params: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await deliveryService.getAssignedOrders(params.page, params.limit);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getOrderHistory = createAsyncThunk(
  'delivery/getOrderHistory',
  async (params: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await deliveryService.getOrderHistory(params.page, params.limit);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const acceptOrder = createAsyncThunk(
  'delivery/acceptOrder',
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await deliveryService.acceptOrder(orderId);
      return { orderId, data: response };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'delivery/updateOrderStatus',
  async ({ orderId, status }: {
    orderId: string;
    status: string;
    location?: { latitude: number; longitude: number };
  }, { rejectWithValue }) => {
    try {
      // For now, just return success - implement actual service call later
      return { orderId, status, data: { success: true } };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const startShift = createAsyncThunk(
  'delivery/startShift',
  async (_, { rejectWithValue }) => {
    try {
      // For now, just return success - implement actual service call later
      return { is_active: true, start_time: new Date().toISOString() };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const endShift = createAsyncThunk(
  'delivery/endShift',
  async (_, { rejectWithValue }) => {
    try {
      // For now, just return success - implement actual service call later
      return { success: true };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateLocation = createAsyncThunk(
  'delivery/updateLocation',
  async (location: { latitude: number; longitude: number }, { rejectWithValue }) => {
    try {
      // For now, just return success - implement actual service call later
      return { success: true, location };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getShiftStatus = createAsyncThunk(
  'delivery/getShiftStatus',
  async (_, { rejectWithValue }) => {
    try {
      // For now, just return mock data - implement actual service call later
      return { is_active: false, deliveries_today: 0, hours_worked: 0, total_earnings: 0 };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const deliverySlice = createSlice({
  name: 'delivery',
  initialState: {
    deliveryOrders: [],
    assignedOrders: [],
    completedOrders: [],
    selectedOrder: null,
    stats: null,
    shiftStatus: null,
    isLoading: false,
    isProcessing: false,
    error: null,
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      total_pages: 0,
    },
  } as DeliveryState,
  reducers: {
    clearDeliveryError: (state) => {
      state.error = null;
    },
    clearSelectedOrder: (state) => {
      state.selectedOrder = null;
    },
    setDeliveryLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setDeliveryProcessing: (state, action: PayloadAction<boolean>) => {
      state.isProcessing = action.payload;
    },
    updateOrderInList: (state, action: PayloadAction<DeliveryOrder>) => {
      const assignedIndex = state.assignedOrders.findIndex(o => o.id === action.payload.id);
      if (assignedIndex !== -1) {
        state.assignedOrders[assignedIndex] = action.payload;
      }
      const completedIndex = state.completedOrders.findIndex(o => o.id === action.payload.id);
      if (completedIndex !== -1) {
        state.completedOrders[completedIndex] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Get delivery stats
      .addCase(getDeliveryStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getDeliveryStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload as any;
      })
      .addCase(getDeliveryStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Get assigned orders
      .addCase(getAssignedOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAssignedOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.assignedOrders = action.payload.orders as any;
        state.pagination = {
          page: 1,
          limit: 20,
          total: action.payload.total,
          total_pages: action.payload.pages,
        };
      })
      .addCase(getAssignedOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Get order history
      .addCase(getOrderHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getOrderHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.completedOrders = action.payload.orders as any;
        state.pagination = {
          page: 1,
          limit: 20,
          total: action.payload.total,
          total_pages: action.payload.pages,
        };
      })
      .addCase(getOrderHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Accept order
      .addCase(acceptOrder.pending, (state) => {
        state.isProcessing = true;
        state.error = null;
      })
      .addCase(acceptOrder.fulfilled, (state, action) => {
        state.isProcessing = false;
        const orderIndex = state.assignedOrders.findIndex(o => o.id === action.payload.orderId);
        if (orderIndex !== -1) {
          state.assignedOrders[orderIndex].status = 'picked_up';
        }
      })
      .addCase(acceptOrder.rejected, (state, action) => {
        state.isProcessing = false;
        state.error = action.payload as string;
      })

      // Update order status
      .addCase(updateOrderStatus.pending, (state) => {
        state.isProcessing = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.isProcessing = false;
        const orderIndex = state.assignedOrders.findIndex(o => o.id === action.payload.orderId);
        if (orderIndex !== -1) {
          state.assignedOrders[orderIndex].status = action.payload.status as any;
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.isProcessing = false;
        state.error = action.payload as string;
      })

      // Start shift
      .addCase(startShift.fulfilled, (state, action) => {
        state.shiftStatus = action.payload as any;
      })

      // End shift
      .addCase(endShift.fulfilled, (state) => {
        state.shiftStatus = null;
      })

      // Get shift status
      .addCase(getShiftStatus.fulfilled, (state, action) => {
        state.shiftStatus = action.payload as any;
      });
  },
});

export const {
  clearDeliveryError,
  clearSelectedOrder,
  setDeliveryLoading,
  setDeliveryProcessing,
  updateOrderInList,
} = deliverySlice.actions;

export default deliverySlice.reducer;
