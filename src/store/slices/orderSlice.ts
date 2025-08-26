import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Order, CreateOrderRequest, OrderSearchFilters } from '../../models';
import { orderService } from '../../services';

interface OrderState {
  orders: Order[];
  sales: Order[];
  selectedOrder: Order | null;
  isLoading: boolean;
  error: string | null;
  statistics: {
    total_orders: number;
    total_sales: number;
    pending_orders: number;
    completed_orders: number;
    total_revenue: number;
    total_spent: number;
  } | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

const initialState: OrderState = {
  orders: [],
  sales: [],
  selectedOrder: null,
  isLoading: false,
  error: null,
  statistics: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 0,
  },
};

// Async thunks
export const createOrder = createAsyncThunk(
  'orders/create',
  async (orderData: CreateOrderRequest, { rejectWithValue }) => {
    try {
      const response = await orderService.createOrder(orderData);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Failed to create order');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getMyOrders = createAsyncThunk(
  'orders/getMyOrders',
  async (filters: OrderSearchFilters = {}, { rejectWithValue }) => {
    try {
      const response = await orderService.getMyOrders(filters);
      if (response.success) {
        return response;
      }
      throw new Error('Failed to fetch orders');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getMySales = createAsyncThunk(
  'orders/getMySales',
  async (filters: OrderSearchFilters = {}, { rejectWithValue }) => {
    try {
      const response = await orderService.getMySales(filters);
      if (response.success) {
        return response;
      }
      throw new Error('Failed to fetch sales');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getOrderById = createAsyncThunk(
  'orders/getById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await orderService.getOrderById(id);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Order not found');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'orders/updateStatus',
  async ({ orderId, status, notes }: { orderId: string; status: any; notes?: string }, { rejectWithValue }) => {
    try {
      const response = await orderService.updateOrderStatus(orderId, { status, notes });
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Failed to update order status');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const cancelOrder = createAsyncThunk(
  'orders/cancel',
  async ({ orderId, reason }: { orderId: string; reason: string }, { rejectWithValue }) => {
    try {
      const response = await orderService.cancelOrder(orderId, reason);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Failed to cancel order');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const confirmDelivery = createAsyncThunk(
  'orders/confirmDelivery',
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await orderService.confirmDelivery(orderId);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Failed to confirm delivery');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const rateOrder = createAsyncThunk(
  'orders/rate',
  async ({ orderId, rating, comment, rateType }: { 
    orderId: string; 
    rating: number; 
    comment?: string; 
    rateType?: 'buyer' | 'seller' 
  }, { rejectWithValue }) => {
    try {
      const response = await orderService.rateOrder(orderId, rating, comment, rateType);
      if (response.success) {
        return { orderId, rating, comment, rateType };
      }
      throw new Error('Failed to rate order');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getOrderStatistics = createAsyncThunk(
  'orders/getStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await orderService.getOrderStatistics();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Failed to fetch order statistics');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedOrder: (state, action: PayloadAction<Order | null>) => {
      state.selectedOrder = action.payload;
    },
    updateOrderInList: (state, action: PayloadAction<Order>) => {
      const updatedOrder = action.payload;
      
      // Update in orders array
      const orderIndex = state.orders.findIndex(o => o.id === updatedOrder.id);
      if (orderIndex !== -1) {
        state.orders[orderIndex] = updatedOrder;
      }
      
      // Update in sales array
      const saleIndex = state.sales.findIndex(o => o.id === updatedOrder.id);
      if (saleIndex !== -1) {
        state.sales[saleIndex] = updatedOrder;
      }
      
      // Update selected order if it matches
      if (state.selectedOrder?.id === updatedOrder.id) {
        state.selectedOrder = updatedOrder;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Create order
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders.unshift(action.payload); // Add to beginning
        state.selectedOrder = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Get my orders
      .addCase(getMyOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMyOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(getMyOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Get my sales
      .addCase(getMySales.fulfilled, (state, action) => {
        state.sales = action.payload.data;
      })
      
      // Get order by ID
      .addCase(getOrderById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getOrderById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedOrder = action.payload;
      })
      .addCase(getOrderById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update order status
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const updatedOrder = action.payload;
        
        // Update in orders array
        const orderIndex = state.orders.findIndex(o => o.id === updatedOrder.id);
        if (orderIndex !== -1) {
          state.orders[orderIndex] = updatedOrder;
        }
        
        // Update in sales array
        const saleIndex = state.sales.findIndex(o => o.id === updatedOrder.id);
        if (saleIndex !== -1) {
          state.sales[saleIndex] = updatedOrder;
        }
        
        // Update selected order
        if (state.selectedOrder?.id === updatedOrder.id) {
          state.selectedOrder = updatedOrder;
        }
      })
      
      // Cancel order
      .addCase(cancelOrder.fulfilled, (state, action) => {
        const updatedOrder = action.payload;
        
        // Update order in arrays
        state.orders = state.orders.map(order => 
          order.id === updatedOrder.id ? updatedOrder : order
        );
        state.sales = state.sales.map(order => 
          order.id === updatedOrder.id ? updatedOrder : order
        );
        
        if (state.selectedOrder?.id === updatedOrder.id) {
          state.selectedOrder = updatedOrder;
        }
      })
      
      // Confirm delivery
      .addCase(confirmDelivery.fulfilled, (state, action) => {
        const updatedOrder = action.payload;
        
        // Update order in arrays
        state.orders = state.orders.map(order => 
          order.id === updatedOrder.id ? updatedOrder : order
        );
        
        if (state.selectedOrder?.id === updatedOrder.id) {
          state.selectedOrder = updatedOrder;
        }
      })
      
      // Get statistics
      .addCase(getOrderStatistics.fulfilled, (state, action) => {
        state.statistics = action.payload;
      });
  },
});

export const { clearError, setSelectedOrder, updateOrderInList } = orderSlice.actions;
export default orderSlice.reducer;