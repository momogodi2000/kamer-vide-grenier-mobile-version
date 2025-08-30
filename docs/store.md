# Kamer Vide Grenier Mobile App - Store Documentation

## 🗂️ Store Directory (`src/store/`)

The store directory contains the Redux store configuration and state slices for the Kamer Vide Grenier mobile app. The app uses Redux Toolkit for modern Redux patterns with TypeScript support.

---

## 📋 Store Structure

```
store/
├── index.ts              # Store configuration and setup
├── slices/               # Redux slices
│   ├── authSlice.ts      # Authentication state management
│   ├── cartSlice.ts      # Shopping cart state
│   ├── deliverySlice.ts  # Delivery tracking state
│   ├── notificationSlice.ts # Notification state
│   ├── orderSlice.ts     # Order management state
│   ├── paymentSlice.ts   # Payment processing state
│   ├── productSlice.ts   # Product management state
│   ├── uiSlice.ts        # UI state management
│   └── walletSlice.ts    # Wallet and earnings state
└── types.ts             # Store type definitions
```

---

## ⚙️ Store Configuration (`index.ts`)

**Purpose**: Main store configuration with middleware and enhancers
**Features**:
- Redux Toolkit store setup
- Middleware configuration
- Redux DevTools integration
- TypeScript support

### Store Setup
```typescript
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import slices
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
// ... other imports

// Persistence configuration
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'cart', 'user'], // Only persist these slices
};

// Root reducer
const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  delivery: deliveryReducer,
  // ... other reducers
});

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Store configuration
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(logger, sagaMiddleware),
  devTools: __DEV__,
});

// Persistor for redux-persist
export const persistor = persistStore(store);

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

---

## 🔐 Authentication Slice (`authSlice.ts`)

**Purpose**: Manage user authentication state and session data
**State Structure**:
```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  biometricEnabled: boolean;
  lastLogin: Date | null;
}
```

### Actions
- `loginStart` - Initiate login process
- `loginSuccess` - Login successful
- `loginFailure` - Login failed
- `logout` - User logout
- `refreshToken` - Refresh authentication token
- `updateProfile` - Update user profile
- `setBiometricEnabled` - Enable/disable biometric auth

### Thunks
- `loginUser` - Async login with API call
- `registerUser` - Async user registration
- `refreshAuthToken` - Refresh expired tokens
- `updateUserProfile` - Update user information

### Selectors
- `selectUser` - Get current user
- `selectIsAuthenticated` - Check authentication status
- `selectAuthLoading` - Get loading state
- `selectAuthError` - Get authentication errors

---

## 🛒 Cart Slice (`cartSlice.ts`)

**Purpose**: Manage shopping cart state and operations
**State Structure**:
```typescript
interface CartState {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  selectedOptions: ProductOption[];
  addedAt: Date;
}
```

### Actions
- `addToCart` - Add item to cart
- `removeFromCart` - Remove item from cart
- `updateQuantity` - Update item quantity
- `clearCart` - Empty cart
- `setCartItems` - Set cart items (from storage/API)
- `setCartLoading` - Set loading state
- `setCartError` - Set error state

### Thunks
- `addItemToCart` - Add item with validation
- `removeItemFromCart` - Remove item with confirmation
- `syncCartWithServer` - Sync local cart with server
- `loadCartFromStorage` - Load cart from local storage

### Selectors
- `selectCartItems` - Get all cart items
- `selectCartTotal` - Get cart total amount
- `selectCartItemCount` - Get total item count
- `selectCartItemById` - Get specific cart item

---

## 🚚 Delivery Slice (`deliverySlice.ts`)

**Purpose**: Manage delivery tracking and status
**State Structure**:
```typescript
interface DeliveryState {
  activeDeliveries: Delivery[];
  deliveryHistory: Delivery[];
  currentLocation: Location | null;
  trackingEnabled: boolean;
  isLoading: boolean;
  error: string | null;
}

interface Delivery {
  id: string;
  orderId: string;
  agentId: string;
  status: DeliveryStatus;
  currentLocation: Location;
  estimatedArrival: Date;
  customerLocation: Location;
  route: Location[];
  startedAt: Date;
  completedAt?: Date;
}
```

### Actions
- `setActiveDeliveries` - Set active deliveries
- `updateDeliveryStatus` - Update delivery status
- `updateDeliveryLocation` - Update delivery location
- `addDeliveryToHistory` - Move to history
- `setTrackingEnabled` - Enable/disable tracking
- `setDeliveryLoading` - Set loading state

### Thunks
- `loadActiveDeliveries` - Load agent's deliveries
- `updateDeliveryProgress` - Update delivery progress
- `completeDelivery` - Mark delivery complete
- `startLocationTracking` - Start GPS tracking

### Selectors
- `selectActiveDeliveries` - Get active deliveries
- `selectDeliveryById` - Get specific delivery
- `selectDeliveryHistory` - Get delivery history
- `selectCurrentLocation` - Get current location

---

## 🔔 Notification Slice (`notificationSlice.ts`)

**Purpose**: Manage push notifications and in-app notifications
**State Structure**:
```typescript
interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  preferences: NotificationPreferences;
}

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: Date;
}

interface NotificationPreferences {
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  orderUpdates: boolean;
  deliveryUpdates: boolean;
  promotional: boolean;
}
```

### Actions
- `addNotification` - Add new notification
- `markAsRead` - Mark notification as read
- `markAllAsRead` - Mark all notifications as read
- `deleteNotification` - Delete notification
- `clearNotifications` - Clear all notifications
- `updatePreferences` - Update notification preferences

### Thunks
- `loadNotifications` - Load notifications from server
- `sendNotification` - Send notification to user
- `updateNotificationPreferences` - Update user preferences

### Selectors
- `selectNotifications` - Get all notifications
- `selectUnreadCount` - Get unread count
- `selectNotificationPreferences` - Get user preferences

---

## 📋 Order Slice (`orderSlice.ts`)

**Purpose**: Manage order state and lifecycle
**State Structure**:
```typescript
interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  orderHistory: Order[];
  isLoading: boolean;
  error: string | null;
  filters: OrderFilters;
}

interface Order {
  id: string;
  buyerId: string;
  sellerId: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  deliveryAddress: Address;
  paymentMethod: PaymentMethod;
  createdAt: Date;
  updatedAt: Date;
}
```

### Actions
- `setOrders` - Set orders list
- `addOrder` - Add new order
- `updateOrder` - Update order details
- `setCurrentOrder` - Set active order
- `setOrderFilters` - Set order filters
- `setOrderLoading` - Set loading state

### Thunks
- `createOrder` - Create new order
- `loadOrders` - Load user orders
- `updateOrderStatus` - Update order status
- `cancelOrder` - Cancel order

### Selectors
- `selectOrders` - Get all orders
- `selectCurrentOrder` - Get current order
- `selectOrderById` - Get specific order
- `selectOrderHistory` - Get order history

---

## 💳 Payment Slice (`paymentSlice.ts`)

**Purpose**: Manage payment processing and transactions
**State Structure**:
```typescript
interface PaymentState {
  paymentMethods: PaymentMethod[];
  transactions: Transaction[];
  currentTransaction: Transaction | null;
  isProcessing: boolean;
  error: string | null;
  preferences: PaymentPreferences;
}

interface Transaction {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: TransactionStatus;
  createdAt: Date;
  completedAt?: Date;
}
```

### Actions
- `setPaymentMethods` - Set available payment methods
- `addTransaction` - Add new transaction
- `updateTransaction` - Update transaction status
- `setCurrentTransaction` - Set active transaction
- `setPaymentProcessing` - Set processing state

### Thunks
- `processPayment` - Process payment
- `loadPaymentMethods` - Load available methods
- `loadTransactions` - Load transaction history
- `refundPayment` - Process refund

### Selectors
- `selectPaymentMethods` - Get payment methods
- `selectTransactions` - Get transactions
- `selectCurrentTransaction` - Get current transaction

---

## 📦 Product Slice (`productSlice.ts`)

**Purpose**: Manage product data and search functionality
**State Structure**:
```typescript
interface ProductState {
  products: Product[];
  featuredProducts: Product[];
  searchResults: Product[];
  currentProduct: Product | null;
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  filters: ProductFilters;
  searchQuery: string;
}
```

### Actions
- `setProducts` - Set products list
- `setFeaturedProducts` - Set featured products
- `setSearchResults` - Set search results
- `setCurrentProduct` - Set active product
- `setCategories` - Set product categories
- `setProductFilters` - Set product filters
- `setSearchQuery` - Set search query

### Thunks
- `loadProducts` - Load products from server
- `searchProducts` - Search products
- `loadProductDetails` - Load product details
- `loadCategories` - Load product categories

### Selectors
- `selectProducts` - Get all products
- `selectFeaturedProducts` - Get featured products
- `selectSearchResults` - Get search results
- `selectCurrentProduct` - Get current product
- `selectCategories` - Get categories

---

## 🎨 UI Slice (`uiSlice.ts`)

**Purpose**: Manage global UI state and user preferences
**State Structure**:
```typescript
interface UiState {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  isOnline: boolean;
  modalStack: Modal[];
  loadingStack: string[];
  toast: Toast | null;
  navigation: NavigationState;
}

interface Modal {
  id: string;
  type: ModalType;
  props?: any;
}

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}
```

### Actions
- `setTheme` - Set app theme
- `setLanguage` - Set app language
- `setOnlineStatus` - Set online/offline status
- `showModal` - Show modal dialog
- `hideModal` - Hide modal dialog
- `showToast` - Show toast notification
- `hideToast` - Hide toast notification
- `setLoading` - Set loading state
- `clearLoading` - Clear loading state

### Thunks
- `initializeUI` - Initialize UI state
- `changeTheme` - Change app theme
- `changeLanguage` - Change app language

### Selectors
- `selectTheme` - Get current theme
- `selectLanguage` - Get current language
- `selectIsOnline` - Get online status
- `selectModalStack` - Get modal stack
- `selectIsLoading` - Get loading state

---

## 💰 Wallet Slice (`walletSlice.ts`)

**Purpose**: Manage user wallet and earnings
**State Structure**:
```typescript
interface WalletState {
  balance: number;
  transactions: WalletTransaction[];
  earnings: Earnings;
  paymentMethods: PaymentMethod[];
  isLoading: boolean;
  error: string | null;
}

interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  createdAt: Date;
  orderId?: string;
}

interface Earnings {
  total: number;
  thisMonth: number;
  thisWeek: number;
  pending: number;
}
```

### Actions
- `setBalance` - Set wallet balance
- `addTransaction` - Add wallet transaction
- `setEarnings` - Set earnings data
- `setWalletLoading` - Set loading state

### Thunks
- `loadWalletData` - Load wallet information
- `loadTransactions` - Load transaction history
- `withdrawFunds` - Withdraw from wallet
- `loadEarnings` - Load earnings data

### Selectors
- `selectBalance` - Get wallet balance
- `selectTransactions` - Get wallet transactions
- `selectEarnings` - Get earnings data

---

## 📝 Store Types (`types.ts`)

**Purpose**: TypeScript type definitions for the store
**Contents**:
```typescript
// Action types
export type AuthAction = ReturnType<typeof authSlice.actions>;
export type CartAction = ReturnType<typeof cartSlice.actions>;
// ... other action types

// Thunk types
export type AppThunk = ThunkAction<void, RootState, unknown, Action<string>>;

// Selector types
export type AuthSelector = (state: RootState) => AuthState;
export type CartSelector = (state: RootState) => CartState;
// ... other selector types

// Store types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

---

## 🔧 Store Best Practices

### 1. Slice Structure
```typescript
// Standard slice structure
const sliceNameSlice = createSlice({
  name: 'sliceName',
  initialState,
  reducers: {
    // Synchronous actions
    actionName: (state, action) => {
      // Update state
    },
  },
  extraReducers: (builder) => {
    // Asynchronous actions
    builder
      .addCase(thunkName.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(thunkName.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update state with result
      })
      .addCase(thunkName.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  },
});
```

### 2. Thunk Creation
```typescript
// Async thunk pattern
export const asyncAction = createAsyncThunk(
  'sliceName/asyncAction',
  async (params, { dispatch, getState, rejectWithValue }) => {
    try {
      const response = await apiCall(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
```

### 3. Selector Usage
```typescript
// Memoized selectors
export const selectData = createSelector(
  [(state: RootState) => state.sliceName.data],
  (data) => {
    // Transform data
    return transformedData;
  }
);
```

### 4. State Persistence
```typescript
// Redux-persist configuration
const persistConfig = {
  key: 'sliceName',
  storage: AsyncStorage,
  whitelist: ['importantData'], // Only persist these fields
  blacklist: ['loading', 'error'], // Don't persist these fields
};
```

---

## 🔄 State Management Flow

### 1. Action Dispatch
```
Component → Action Creator → Middleware → Reducer → State Update
```

### 2. Async Flow
```
Component → Thunk → API Call → Success/Error → State Update
```

### 3. Side Effects
```
Action → Middleware → Side Effect → Dispatch → State Update
```

### 4. Persistence Flow
```
State Change → Persist Middleware → AsyncStorage → Hydration
```

---

## 📊 Performance Optimization

### 1. Memoization
- Use `createSelector` for complex selectors
- Memoize expensive computations
- Avoid unnecessary re-renders

### 2. Normalization
- Normalize nested data structures
- Use entity adapters for collections
- Maintain referential equality

### 3. Lazy Loading
- Load state on demand
- Implement pagination
- Use code splitting for reducers

### 4. State Cleanup
- Clear unused state
- Reset state on logout
- Implement state expiration

---

## 🧪 Testing Store Logic

### 1. Slice Testing
```typescript
describe('authSlice', () => {
  it('should handle login success', () => {
    const action = { type: loginSuccess.type, payload: mockUser };
    const result = authReducer(initialState, action);
    expect(result.user).toEqual(mockUser);
  });
});
```

### 2. Thunk Testing
```typescript
describe('loginUser thunk', () => {
  it('should dispatch success action on successful login', async () => {
    const dispatch = jest.fn();
    const thunk = loginUser(credentials);
    await thunk(dispatch, () => ({}), undefined);
    expect(dispatch).toHaveBeenCalledWith(loginSuccess(mockUser));
  });
});
```

### 3. Selector Testing
```typescript
describe('selectUser', () => {
  it('should return user from state', () => {
    const state = { auth: { user: mockUser } };
    expect(selectUser(state)).toEqual(mockUser);
  });
});
```

---

## 🔍 Debugging Store

### 1. Redux DevTools
- Install Redux DevTools extension
- Enable in store configuration
- Use time travel debugging

### 2. Logging Middleware
```typescript
const logger = (store) => (next) => (action) => {
  console.log('Action:', action);
  const result = next(action);
  console.log('New State:', store.getState());
  return result;
};
```

### 3. Error Boundaries
- Wrap components with error boundaries
- Log Redux errors
- Provide fallback UI

This comprehensive store documentation covers all Redux slices and state management patterns in the Kamer Vide Grenier mobile app, providing detailed information about state structure, actions, thunks, selectors, and best practices.
