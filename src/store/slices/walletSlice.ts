import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { walletService } from '../../services/walletService';

interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface WalletTransaction {
  id: string;
  wallet_id: string;
  user_id: string;
  type: 'credit' | 'debit';
  amount: number;
  currency: string;
  description?: string;
  reference?: string;
  status: 'pending' | 'completed' | 'failed';
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface Withdrawal {
  id: string;
  user_id: string;
  wallet_id: string;
  amount: number;
  currency: string;
  method: string;
  provider: string;
  account_number?: string;
  account_name?: string;
  status: 'pending' | 'processing' | 'paid' | 'failed' | 'on_hold';
  reference?: string;
  transaction_id?: string;
  processed_at?: string;
  failed_reason?: string;
  created_at: string;
  updated_at: string;
}

interface WalletState {
  wallet: Wallet | null;
  transactions: WalletTransaction[];
  withdrawals: Withdrawal[];
  selectedTransaction: WalletTransaction | null;
  selectedWithdrawal: Withdrawal | null;
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
    total_balance: number;
    total_earned: number;
    total_spent: number;
    total_withdrawn: number;
    pending_withdrawals: number;
    monthly_stats: any[];
  } | null;
  loyalty: {
    points: number;
    level: string;
    next_level_points: number;
    benefits: string[];
  } | null;
}

// Async thunks
export const getWallet = createAsyncThunk(
  'wallet/getWallet',
  async (_, { rejectWithValue }) => {
    try {
      const response = await walletService.getWallet();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Failed to fetch wallet');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getWalletBalance = createAsyncThunk(
  'wallet/getBalance',
  async (_, { rejectWithValue }) => {
    try {
      const response = await walletService.getWalletBalance();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Failed to fetch balance');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getWalletTransactions = createAsyncThunk(
  'wallet/getTransactions',
  async (filters: any = {}, { rejectWithValue }) => {
    try {
      const response = await walletService.getWalletTransactions(filters);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Failed to fetch transactions');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getWithdrawals = createAsyncThunk(
  'wallet/getWithdrawals',
  async (filters: any = {}, { rejectWithValue }) => {
    try {
      const response = await walletService.getWithdrawals(filters);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Failed to fetch withdrawals');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const requestWithdrawal = createAsyncThunk(
  'wallet/requestWithdrawal',
  async (withdrawalData: any, { rejectWithValue }) => {
    try {
      const response = await walletService.requestWithdrawal(withdrawalData);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to request withdrawal');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const cancelWithdrawal = createAsyncThunk(
  'wallet/cancelWithdrawal',
  async (withdrawalId: string, { rejectWithValue }) => {
    try {
      const response = await walletService.cancelWithdrawal(withdrawalId);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to cancel withdrawal');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const addFunds = createAsyncThunk(
  'wallet/addFunds',
  async ({ amount, paymentMethod, description }: {
    amount: number;
    paymentMethod: string;
    description?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await walletService.addFunds(amount, paymentMethod, description);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to add funds');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const transferFunds = createAsyncThunk(
  'wallet/transferFunds',
  async ({ recipientId, amount, description }: {
    recipientId: string;
    amount: number;
    description?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await walletService.transferFunds(recipientId, amount, description);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to transfer funds');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getWalletStats = createAsyncThunk(
  'wallet/getStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await walletService.getWalletStats();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Failed to fetch wallet statistics');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getLoyaltyPoints = createAsyncThunk(
  'wallet/getLoyalty',
  async (_, { rejectWithValue }) => {
    try {
      const response = await walletService.getLoyaltyPoints();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Failed to fetch loyalty points');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const redeemLoyaltyPoints = createAsyncThunk(
  'wallet/redeemLoyalty',
  async ({ points, rewardType }: {
    points: number;
    rewardType: string;
  }, { rejectWithValue }) => {
    try {
      const response = await walletService.redeemLoyaltyPoints(points, rewardType);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to redeem points');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const walletSlice = createSlice({
  name: 'wallet',
  initialState: {
    wallet: null,
    transactions: [],
    withdrawals: [],
    selectedTransaction: null,
    selectedWithdrawal: null,
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
    loyalty: null,
  } as WalletState,
  reducers: {
    clearWalletError: (state) => {
      state.error = null;
    },
    clearSelectedTransaction: (state) => {
      state.selectedTransaction = null;
    },
    clearSelectedWithdrawal: (state) => {
      state.selectedWithdrawal = null;
    },
    setWalletLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setWalletProcessing: (state, action: PayloadAction<boolean>) => {
      state.isProcessing = action.payload;
    },
    updateWalletBalance: (state, action: PayloadAction<number>) => {
      if (state.wallet) {
        state.wallet.balance = action.payload;
      }
    },
    updateTransactionInList: (state, action: PayloadAction<WalletTransaction>) => {
      const index = state.transactions.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.transactions[index] = action.payload;
      }
    },
    updateWithdrawalInList: (state, action: PayloadAction<Withdrawal>) => {
      const index = state.withdrawals.findIndex(w => w.id === action.payload.id);
      if (index !== -1) {
        state.withdrawals[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Get wallet
      .addCase(getWallet.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getWallet.fulfilled, (state, action) => {
        state.isLoading = false;
        state.wallet = action.payload as any;
      })
      .addCase(getWallet.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Get wallet balance
      .addCase(getWalletBalance.fulfilled, (state, action) => {
        if (state.wallet) {
          state.wallet.balance = action.payload.balance;
        }
      })

      // Get wallet transactions
      .addCase(getWalletTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getWalletTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = action.payload.transactions as any;
        state.pagination = action.payload.pagination as any;
      })
      .addCase(getWalletTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Get withdrawals
      .addCase(getWithdrawals.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getWithdrawals.fulfilled, (state, action) => {
        state.isLoading = false;
        state.withdrawals = action.payload.withdrawals as any;
        state.pagination = action.payload.pagination as any;
      })
      .addCase(getWithdrawals.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Request withdrawal
      .addCase(requestWithdrawal.pending, (state) => {
        state.isProcessing = true;
        state.error = null;
      })
      .addCase(requestWithdrawal.fulfilled, (state, action) => {
        state.isProcessing = false;
        state.withdrawals.unshift(action.payload as any);
      })
      .addCase(requestWithdrawal.rejected, (state, action) => {
        state.isProcessing = false;
        state.error = action.payload as string;
      })

      // Cancel withdrawal
      .addCase(cancelWithdrawal.fulfilled, (state, action) => {
        const index = state.withdrawals.findIndex(w => w.id === action.payload.id);
        if (index !== -1) {
          state.withdrawals[index] = action.payload as any;
        }
      })

      // Add funds
      .addCase(addFunds.pending, (state) => {
        state.isProcessing = true;
        state.error = null;
      })
      .addCase(addFunds.fulfilled, (state, action) => {
        state.isProcessing = false;
        // Add transaction to list
        if (action.payload.payment_id) {
          // Transaction will be added when payment is confirmed
        }
      })
      .addCase(addFunds.rejected, (state, action) => {
        state.isProcessing = false;
        state.error = action.payload as string;
      })

      // Transfer funds
      .addCase(transferFunds.fulfilled, (state, action) => {
        state.transactions.unshift(action.payload as any);
        if (state.wallet) {
          state.wallet.balance -= action.payload.amount;
        }
      })

      // Get wallet stats
      .addCase(getWalletStats.fulfilled, (state, action) => {
        state.statistics = action.payload as any;
      })

      // Get loyalty points
      .addCase(getLoyaltyPoints.fulfilled, (state, action) => {
        state.loyalty = action.payload as any;
      })

      // Redeem loyalty points
      .addCase(redeemLoyaltyPoints.fulfilled, (state, action) => {
        if (state.loyalty) {
          state.loyalty.points = action.payload.remaining_points;
        }
      });
  },
});

export const {
  clearWalletError,
  clearSelectedTransaction,
  clearSelectedWithdrawal,
  setWalletLoading,
  setWalletProcessing,
  updateWalletBalance,
  updateTransactionInList,
  updateWithdrawalInList,
} = walletSlice.actions;

export default walletSlice.reducer;
