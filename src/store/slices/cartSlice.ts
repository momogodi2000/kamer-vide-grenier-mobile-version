import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Cart, CartItem } from '../../models';
import { cartService } from '../../services';

interface CartState {
  cart: Cart | null;
  itemCount: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: CartState = {
  cart: null,
  itemCount: 0,
  isLoading: false,
  error: null,
};

// Async thunks
export const getCart = createAsyncThunk(
  'cart/getCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartService.getCart();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Failed to fetch cart');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addItem',
  async ({ productId, quantity }: { productId: string; quantity: number }, { rejectWithValue }) => {
    try {
      const response = await cartService.addToCart(productId, quantity);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Failed to add item to cart');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateItem',
  async ({ itemId, quantity }: { itemId: string; quantity: number }, { rejectWithValue }) => {
    try {
      const response = await cartService.updateCartItem(itemId, quantity);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Failed to update cart item');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeItem',
  async (itemId: string, { rejectWithValue }) => {
    try {
      const response = await cartService.removeFromCart(itemId);
      if (response.success) {
        return itemId;
      }
      throw new Error('Failed to remove item from cart');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const clearCart = createAsyncThunk(
  'cart/clear',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartService.clearCart();
      if (response.success) {
        return true;
      }
      throw new Error('Failed to clear cart');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getCartItemCount = createAsyncThunk(
  'cart/getItemCount',
  async (_, { rejectWithValue }) => {
    try {
      const count = await cartService.getCartItemCount();
      return count;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateItemCount: (state, action: PayloadAction<number>) => {
      state.itemCount = action.payload;
    },
    resetCart: (state) => {
      state.cart = null;
      state.itemCount = 0;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get cart
      .addCase(getCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cart = action.payload;
        state.itemCount = action.payload.items?.length || 0;
      })
      .addCase(getCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Add to cart
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        
        if (state.cart) {
          // Check if item already exists
          const existingItemIndex = state.cart.items.findIndex(
            item => item.product_id === action.payload.product_id
          );
          
          if (existingItemIndex !== -1) {
            // Update existing item
            state.cart.items[existingItemIndex] = action.payload;
          } else {
            // Add new item
            state.cart.items.push(action.payload);
          }
          
          // Update totals
          state.cart.subtotal = state.cart.items.reduce((sum, item) => sum + item.total_price, 0);
          state.cart.total = state.cart.subtotal; // Add taxes, fees later
          state.itemCount = state.cart.items.length;
        }
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update cart item
      .addCase(updateCartItem.fulfilled, (state, action) => {
        if (state.cart) {
          const itemIndex = state.cart.items.findIndex(item => item.id === action.payload.id);
          if (itemIndex !== -1) {
            state.cart.items[itemIndex] = action.payload;
            state.cart.subtotal = state.cart.items.reduce((sum, item) => sum + item.total_price, 0);
            state.cart.total = state.cart.subtotal;
          }
        }
      })
      
      // Remove from cart
      .addCase(removeFromCart.fulfilled, (state, action) => {
        if (state.cart) {
          state.cart.items = state.cart.items.filter(item => item.id !== action.payload);
          state.cart.subtotal = state.cart.items.reduce((sum, item) => sum + item.total_price, 0);
          state.cart.total = state.cart.subtotal;
          state.itemCount = state.cart.items.length;
        }
      })
      
      // Clear cart
      .addCase(clearCart.fulfilled, (state) => {
        if (state.cart) {
          state.cart.items = [];
          state.cart.subtotal = 0;
          state.cart.total = 0;
          state.itemCount = 0;
        }
      })
      
      // Get item count
      .addCase(getCartItemCount.fulfilled, (state, action) => {
        state.itemCount = action.payload;
      });
  },
});

export const { clearError, updateItemCount, resetCart } = cartSlice.actions;
export default cartSlice.reducer;