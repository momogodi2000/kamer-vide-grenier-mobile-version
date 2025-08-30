import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { paymentService } from '../../services/paymentService';

interface Payment {
  id: string;
  order_id?: string;
  user_id: string;
  amount: number;
  currency: string;
  method: string;
  provider: string;
  status: string;
  reference?: string;
  transaction_id?: string;
  payment_phone?: string;
  payment_data?: any;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  paid_at?: string;
  refunded_at?: string;
  refund_amount?: number;
  refund_reason?: string;
}

interface PaymentState {
  payments: Payment[];
  selectedPayment: Payment | null;
  paymentMethods: any[];
  isLoading: boolean;
  isProcessing: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  statistics: {
    total_payments: number;
    successful_payments: number;
    failed_payments: number;
    total_amount: number;
  } | null;
}

const initialState: PaymentState = {
  payments: [],
  selectedPayment: null,
  paymentMethods: [],
  isLoading: false,
  isProcessing: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 0,
  },
  statistics: null,
};

// Async thunks
export const createPayment = createAsyncThunk(
  'payments/create',
  async (paymentData: any, { rejectWithValue }) => {
    try {
      const response = await paymentService.createPayment(paymentData);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to create payment');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getMyPayments = createAsyncThunk(
  'payments/getMyPayments',
  async (filters: any = {}, { rejectWithValue }) => {
    try {
      const response = await paymentService.getMyPayments(filters);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Failed to fetch payments');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getPaymentById = createAsyncThunk(
  'payments/getById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await paymentService.getPaymentById(id);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Payment not found');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const processPayment = createAsyncThunk(
  'payments/process',
  async ({ paymentId, providerData }: {
    paymentId: string;
    providerData?: any;
  }, { rejectWithValue }) => {
    try {
      const response = await paymentService.processPayment(paymentId, providerData);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to process payment');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const confirmPayment = createAsyncThunk(
  'payments/confirm',
  async ({ paymentId, confirmationData }: {
    paymentId: string;
    confirmationData: {
      reference: string;
      provider_response?: any;
    };
  }, { rejectWithValue }) => {
    try {
      const response = await paymentService.confirmPayment(paymentId, confirmationData);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to confirm payment');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const cancelPayment = createAsyncThunk(
  'payments/cancel',
  async ({ paymentId, reason }: {
    paymentId: string;
    reason?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await paymentService.cancelPayment(paymentId, reason);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to cancel payment');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const refundPayment = createAsyncThunk(
  'payments/refund',
  async ({ paymentId, amount, reason }: {
    paymentId: string;
    amount?: number;
    reason?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await paymentService.refundPayment(paymentId, amount, reason);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to refund payment');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getPaymentMethods = createAsyncThunk(
  'payments/getMethods',
  async (_, { rejectWithValue }) => {
    try {
      const response = await paymentService.getPaymentMethods();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Failed to fetch payment methods');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const savePaymentMethod = createAsyncThunk(
  'payments/saveMethod',
  async (methodData: {
    type: string;
    provider: string;
    account_number?: string;
    account_name?: string;
    is_default?: boolean;
  }, { rejectWithValue }) => {
    try {
      const response = await paymentService.savePaymentMethod(methodData as any);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to save payment method');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deletePaymentMethod = createAsyncThunk(
  'payments/deleteMethod',
  async (methodId: string, { rejectWithValue }) => {
    try {
      const response = await paymentService.deletePaymentMethod(methodId);
      if (response.success) {
        return methodId;
      }
      throw new Error('Failed to delete payment method');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const initiateMobileMoneyPayment = createAsyncThunk(
  'payments/initiateMobileMoney',
  async (paymentData: {
    amount: number;
    phone: string;
    provider: 'mtn' | 'orange' | 'express_union' | 'camtel';
    description?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await paymentService.initiateMobileMoneyPayment(paymentData);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to initiate mobile money payment');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const checkMobileMoneyStatus = createAsyncThunk(
  'payments/checkMobileMoneyStatus',
  async (reference: string, { rejectWithValue }) => {
    try {
      const response = await paymentService.checkMobileMoneyStatus(reference);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Failed to check payment status');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const initiateStripePayment = createAsyncThunk(
  'payments/initiateStripe',
  async (paymentData: {
    amount: number;
    currency: string;
    description?: string;
    metadata?: Record<string, any>;
  }, { rejectWithValue }) => {
    try {
      const response = await paymentService.initiateStripePayment(paymentData);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to initiate Stripe payment');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const confirmStripePayment = createAsyncThunk(
  'payments/confirmStripe',
  async ({ paymentIntentId, paymentMethodId }: {
    paymentIntentId: string;
    paymentMethodId?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await paymentService.confirmStripePayment(paymentIntentId, paymentMethodId);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to confirm Stripe payment');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getPaymentStats = createAsyncThunk(
  'payments/getStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await paymentService.getPaymentStats();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Failed to fetch payment statistics');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const paymentSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    clearPaymentError: (state) => {
      state.error = null;
    },
    clearSelectedPayment: (state) => {
      state.selectedPayment = null;
    },
    setPaymentLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setPaymentProcessing: (state, action: PayloadAction<boolean>) => {
      state.isProcessing = action.payload;
    },
    updatePaymentInList: (state, action: PayloadAction<Payment>) => {
      const index = state.payments.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.payments[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Create payment
      .addCase(createPayment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPayment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.payments.unshift(action.payload);
      })
      .addCase(createPayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Get my payments
      .addCase(getMyPayments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMyPayments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.payments = action.payload.payments;
        state.pagination = action.payload.pagination;
      })
      .addCase(getMyPayments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Get payment by ID
      .addCase(getPaymentById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPaymentById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedPayment = action.payload;
      })
      .addCase(getPaymentById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Process payment
      .addCase(processPayment.pending, (state) => {
        state.isProcessing = true;
        state.error = null;
      })
      .addCase(processPayment.fulfilled, (state, action) => {
        state.isProcessing = false;
        const index = state.payments.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.payments[index] = action.payload;
        }
        if (state.selectedPayment?.id === action.payload.id) {
          state.selectedPayment = action.payload;
        }
      })
      .addCase(processPayment.rejected, (state, action) => {
        state.isProcessing = false;
        state.error = action.payload as string;
      })

      // Confirm payment
      .addCase(confirmPayment.fulfilled, (state, action) => {
        const index = state.payments.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.payments[index] = action.payload;
        }
        if (state.selectedPayment?.id === action.payload.id) {
          state.selectedPayment = action.payload;
        }
      })

      // Cancel payment
      .addCase(cancelPayment.fulfilled, (state, action) => {
        const index = state.payments.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.payments[index] = action.payload;
        }
        if (state.selectedPayment?.id === action.payload.id) {
          state.selectedPayment = action.payload;
        }
      })

      // Refund payment
      .addCase(refundPayment.fulfilled, (state, action) => {
        const index = state.payments.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.payments[index] = action.payload;
        }
        if (state.selectedPayment?.id === action.payload.id) {
          state.selectedPayment = action.payload;
        }
      })

      // Get payment methods
      .addCase(getPaymentMethods.fulfilled, (state, action) => {
        state.paymentMethods = action.payload;
      })

      // Delete payment method
      .addCase(deletePaymentMethod.fulfilled, (state, action) => {
        state.paymentMethods = state.paymentMethods.filter(m => m.id !== action.payload);
      })

      // Get payment stats
      .addCase(getPaymentStats.fulfilled, (state, action) => {
        state.statistics = action.payload;
      });
  },
});

export const {
  clearPaymentError,
  clearSelectedPayment,
  setPaymentLoading,
  setPaymentProcessing,
  updatePaymentInList,
} = paymentSlice.actions;

export default paymentSlice.reducer;
