import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  isConnected: boolean;
  theme: 'light' | 'dark';
  language: string;
  loading: {
    global: boolean;
    splash: boolean;
    auth: boolean;
    products: boolean;
    orders: boolean;
  };
  modals: {
    isProductFilterVisible: boolean;
    isImageViewerVisible: boolean;
    isLocationPickerVisible: boolean;
    isPaymentMethodVisible: boolean;
  };
  toast: {
    visible: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  } | null;
  selectedLocation: {
    region?: string;
    city?: string;
  };
  searchHistory: string[];
  recentlyViewedProducts: string[];
}

const initialState: UiState = {
  isConnected: true,
  theme: 'light',
  language: 'fr',
  loading: {
    global: false,
    splash: true,
    auth: false,
    products: false,
    orders: false,
  },
  modals: {
    isProductFilterVisible: false,
    isImageViewerVisible: false,
    isLocationPickerVisible: false,
    isPaymentMethodVisible: false,
  },
  toast: null,
  selectedLocation: {},
  searchHistory: [],
  recentlyViewedProducts: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
    
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
    
    setLoading: (state, action: PayloadAction<{ key: keyof UiState['loading']; value: boolean }>) => {
      state.loading[action.payload.key] = action.payload.value;
    },
    
    showModal: (state, action: PayloadAction<keyof UiState['modals']>) => {
      state.modals[action.payload] = true;
    },
    
    hideModal: (state, action: PayloadAction<keyof UiState['modals']>) => {
      state.modals[action.payload] = false;
    },
    
    hideAllModals: (state) => {
      Object.keys(state.modals).forEach(key => {
        state.modals[key as keyof UiState['modals']] = false;
      });
    },
    
    showToast: (state, action: PayloadAction<{
      message: string;
      type: 'success' | 'error' | 'warning' | 'info';
    }>) => {
      state.toast = {
        visible: true,
        message: action.payload.message,
        type: action.payload.type,
      };
    },
    
    hideToast: (state) => {
      state.toast = null;
    },
    
    setSelectedLocation: (state, action: PayloadAction<{
      region?: string;
      city?: string;
    }>) => {
      state.selectedLocation = action.payload;
    },
    
    addToSearchHistory: (state, action: PayloadAction<string>) => {
      const query = action.payload.trim();
      if (query && !state.searchHistory.includes(query)) {
        state.searchHistory.unshift(query);
        if (state.searchHistory.length > 10) {
          state.searchHistory.pop();
        }
      }
    },
    
    clearSearchHistory: (state) => {
      state.searchHistory = [];
    },
    
    addToRecentlyViewed: (state, action: PayloadAction<string>) => {
      const productId = action.payload;
      const existingIndex = state.recentlyViewedProducts.indexOf(productId);
      
      if (existingIndex > -1) {
        // Remove from current position
        state.recentlyViewedProducts.splice(existingIndex, 1);
      }
      
      // Add to beginning
      state.recentlyViewedProducts.unshift(productId);
      
      // Keep only last 20 items
      if (state.recentlyViewedProducts.length > 20) {
        state.recentlyViewedProducts.pop();
      }
    },
    
    clearRecentlyViewed: (state) => {
      state.recentlyViewedProducts = [];
    },
  },
});

export const {
  setConnected,
  setTheme,
  setLanguage,
  setLoading,
  showModal,
  hideModal,
  hideAllModals,
  showToast,
  hideToast,
  setSelectedLocation,
  addToSearchHistory,
  clearSearchHistory,
  addToRecentlyViewed,
  clearRecentlyViewed,
} = uiSlice.actions;

export default uiSlice.reducer;