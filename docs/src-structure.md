# Kamer Vide Grenier Mobile App - Source Code Documentation

## 📁 Source Directory Structure (`src/`)

The `src/` directory contains the entire application source code, organized following clean architecture principles with clear separation of concerns.

### Directory Overview

```
src/
├── assets/                # Static assets and resources
├── components/            # Reusable UI components
├── hooks/                # Custom React hooks
├── models/               # TypeScript interfaces and data models
├── navigation/           # Navigation configuration and types
├── screens/              # Screen components organized by user role
├── services/             # Business logic and API integration
├── store/                # Redux store configuration and slices
├── theme/                # Theme configuration and styling
├── types/                # Additional TypeScript type definitions
├── utils/                # Utility functions and helpers
└── viewmodels/           # View models following MVVM pattern
```

---

## 📂 Assets Directory (`src/assets/`)

Contains static assets used throughout the application.

### Structure
```
assets/
├── fonts/                # Custom fonts
├── icons/                # Icon assets
├── images/               # Static images
│   ├── logos/           # App logos and branding
│   ├── placeholders/    # Placeholder images
│   └── illustrations/   # UI illustrations
└── animations/           # Lottie animations
```

### Key Files
- **fonts/**: Custom typography fonts (e.g., Roboto, Montserrat)
- **icons/**: SVG and PNG icons for UI elements
- **images/**: Product images, banners, and static graphics
- **animations/**: JSON files for Lottie animations

---

## 🧩 Components Directory (`src/components/`)

Reusable UI components organized by feature and functionality.

### Structure
```
components/
├── analytics/            # Analytics and dashboard components
├── auth/                # Authentication-related components
├── chat/                # Chat and messaging components
├── common/              # Shared/common components
├── delivery/            # Delivery tracking components
├── products/            # Product-related components
├── ui/                  # Base UI components
└── specific/            # Role-specific components
```

### Component Categories

#### 🔍 Analytics Components (`analytics/`)
- `SalesChart.tsx` - Sales performance visualization
- `UserStatsCard.tsx` - User statistics display
- `RevenueChart.tsx` - Revenue analytics
- `ProductPerformance.tsx` - Product analytics

#### 🔐 Authentication Components (`auth/`)
- `LoginForm.tsx` - User login interface
- `RegisterForm.tsx` - User registration
- `BiometricPrompt.tsx` - Biometric authentication
- `ForgotPassword.tsx` - Password recovery

#### 💬 Chat Components (`chat/`)
- `ChatList.tsx` - Conversation list
- `ChatBubble.tsx` - Individual message display
- `MessageInput.tsx` - Message composition
- `TypingIndicator.tsx` - Typing status

#### 🔧 Common Components (`common/`)
- `Header.tsx` - App header with navigation
- `Footer.tsx` - App footer
- `LoadingSpinner.tsx` - Loading indicators
- `ErrorBoundary.tsx` - Error handling
- `Modal.tsx` - Modal dialogs

#### 🚚 Delivery Components (`delivery/`)
- `TrackingMap.tsx` - GPS tracking visualization
- `DeliveryStatus.tsx` - Delivery status indicators
- `DeliveryCard.tsx` - Delivery information cards
- `ProofOfDelivery.tsx` - Delivery confirmation

#### 📦 Product Components (`products/`)
- `ProductCard.tsx` - Product display cards
- `ProductGrid.tsx` - Product listing grid
- `ProductDetails.tsx` - Detailed product view
- `ProductFilters.tsx` - Search and filter options
- `AddProductForm.tsx` - Product creation form

#### 🎨 UI Components (`ui/`)
- `Button.tsx` - Custom buttons
- `Input.tsx` - Text input fields
- `Card.tsx` - Card containers
- `Badge.tsx` - Status badges
- `Avatar.tsx` - User avatars

#### 👥 Role-Specific Components (`specific/`)
- `AdminPanel.tsx` - Admin control panel
- `SellerDashboard.tsx` - Seller management interface
- `ClientProfile.tsx` - Client profile components
- `DeliveryAgentCard.tsx` - Delivery agent information

---

## 🎣 Hooks Directory (`src/hooks/`)

Custom React hooks for shared logic and state management.

### Structure
```
hooks/
├── useAuth.ts           # Authentication state management
├── useApi.ts            # API call management
├── useOffline.ts        # Offline functionality
├── useBiometric.ts      # Biometric authentication
├── useLocation.ts       # GPS location services
├── useNotifications.ts  # Push notification handling
├── usePayment.ts        # Payment processing
└── useStorage.ts        # Local storage management
```

### Key Hooks

#### 🔐 `useAuth.ts`
- User authentication state
- Login/logout functionality
- Token management
- Role-based access control

#### 🌐 `useApi.ts`
- API request handling
- Error management
- Loading states
- Request/response interceptors

#### 📱 `useOffline.ts`
- Offline data synchronization
- Local storage management
- Network status monitoring
- Data conflict resolution

#### 👆 `useBiometric.ts`
- Biometric authentication
- Device capability detection
- Fallback authentication methods

#### 📍 `useLocation.ts`
- GPS location tracking
- Geofencing
- Address resolution
- Location permissions

#### 🔔 `useNotifications.ts`
- Push notification setup
- Notification permissions
- Message handling
- Notification scheduling

#### 💳 `usePayment.ts`
- Payment method management
- Transaction processing
- Payment validation
- Receipt generation

#### 💾 `useStorage.ts`
- Local data persistence
- Cache management
- Data encryption
- Storage quota monitoring

---

## 📋 Models Directory (`src/models/`)

TypeScript interfaces and data models for type safety.

### Structure
```
models/
├── User.ts              # User data models
├── Product.ts           # Product data models
├── Order.ts             # Order data models
├── Payment.ts           # Payment data models
├── Delivery.ts          # Delivery data models
├── Notification.ts      # Notification data models
├── Chat.ts              # Chat data models
└── Analytics.ts         # Analytics data models
```

### Key Models

#### 👤 `User.ts`
```typescript
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  profileImage?: string;
  phoneNumber: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### 📦 `Product.ts`
```typescript
interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  category: string;
  sellerId: string;
  stock: number;
  isActive: boolean;
  createdAt: Date;
}
```

#### 🛒 `Order.ts`
```typescript
interface Order {
  id: string;
  buyerId: string;
  sellerId: string;
  products: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  deliveryAddress: Address;
  createdAt: Date;
}
```

#### 💳 `Payment.ts`
```typescript
interface Payment {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  createdAt: Date;
}
```

---

## 🧭 Navigation Directory (`src/navigation/`)

Navigation configuration and routing setup.

### Structure
```
navigation/
├── AppNavigator.tsx      # Main app navigator
├── AuthNavigator.tsx     # Authentication flow
├── MainNavigator.tsx     # Main app navigation
├── AdminNavigator.tsx    # Admin-specific navigation
├── tabs/                 # Tab navigators
│   ├── ClientTabs.tsx   # Client tab navigation
│   ├── SellerTabs.tsx   # Seller tab navigation
│   └── DeliveryTabs.tsx # Delivery tab navigation
└── types.ts             # Navigation type definitions
```

### Navigation Flow

#### 🔐 Authentication Flow (`AuthNavigator.tsx`)
- Login screen
- Registration screen
- Password recovery
- Biometric setup

#### 🏠 Main Navigation (`MainNavigator.tsx`)
- Role-based navigation
- Conditional rendering based on user role
- Deep linking support

#### 📱 Tab Navigation
- **Client Tabs**: Home, Search, Cart, Profile
- **Seller Tabs**: Products, Orders, Analytics, Profile
- **Delivery Tabs**: Deliveries, Earnings, Profile

---

## 📱 Screens Directory (`src/screens/`)

Screen components organized by user role and functionality.

### Structure
```
screens/
├── admin/                # Admin dashboard screens
├── auth/                # Authentication screens
├── client/              # Client/user screens
├── delivery/            # Delivery agent screens
├── home/                # Home and landing screens
├── orders/              # Order management screens
├── profile/             # Profile management screens
└── seller/              # Seller screens
```

### Screen Categories

#### 👑 Admin Screens (`admin/`)
- `AdminDashboard.tsx` - Main admin dashboard
- `UserManagement.tsx` - User administration
- `ProductModeration.tsx` - Product approval
- `AnalyticsDashboard.tsx` - System analytics
- `SystemSettings.tsx` - App configuration

#### 🔐 Authentication Screens (`auth/`)
- `LoginScreen.tsx` - User login
- `RegisterScreen.tsx` - User registration
- `ForgotPasswordScreen.tsx` - Password recovery
- `BiometricSetupScreen.tsx` - Biometric configuration

#### 👤 Client Screens (`client/`)
- `HomeScreen.tsx` - Product browsing
- `ProductDetailsScreen.tsx` - Product information
- `CartScreen.tsx` - Shopping cart
- `CheckoutScreen.tsx` - Order checkout
- `OrderHistoryScreen.tsx` - Order history

#### 🚚 Delivery Screens (`delivery/`)
- `DeliveryDashboard.tsx` - Delivery overview
- `ActiveDeliveriesScreen.tsx` - Current deliveries
- `DeliveryDetailsScreen.tsx` - Delivery information
- `EarningsScreen.tsx` - Earnings tracking
- `DeliveryHistoryScreen.tsx` - Past deliveries

#### 🏠 Home Screens (`home/`)
- `SplashScreen.tsx` - App loading screen
- `OnboardingScreen.tsx` - User onboarding
- `WelcomeScreen.tsx` - Welcome interface

#### 📋 Order Screens (`orders/`)
- `OrderDetailsScreen.tsx` - Order information
- `OrderTrackingScreen.tsx` - Order status tracking
- `OrderHistoryScreen.tsx` - Order history
- `OrderCancellationScreen.tsx` - Order cancellation

#### 👤 Profile Screens (`profile/`)
- `ProfileScreen.tsx` - User profile
- `EditProfileScreen.tsx` - Profile editing
- `SettingsScreen.tsx` - App settings
- `ChangePasswordScreen.tsx` - Password change

#### 🛍️ Seller Screens (`seller/`)
- `SellerDashboard.tsx` - Seller overview
- `ProductManagementScreen.tsx` - Product CRUD
- `OrderManagementScreen.tsx` - Order handling
- `SalesAnalyticsScreen.tsx` - Sales analytics
- `EarningsScreen.tsx` - Earnings tracking

---

## 🔧 Services Directory (`src/services/`)

Business logic and external API integrations.

### Structure
```
services/
├── api.ts                # Base API configuration
├── authService.ts        # Authentication services
├── paymentService.ts     # Payment processing
├── productService.ts     # Product management
├── orderService.ts       # Order management
├── deliveryService.ts    # Delivery services
├── chatService.ts        # Chat functionality
├── notificationService.ts # Push notifications
├── offlineService.ts     # Offline data management
├── storageService.ts     # Local storage
├── locationService.ts    # GPS services
├── imageService.ts       # Image handling
└── analyticsService.ts   # Analytics tracking
```

### Key Services

#### 🌐 `api.ts`
- Axios configuration
- Request/response interceptors
- Error handling
- Base URL management

#### 🔐 `authService.ts`
- JWT token management
- User authentication
- Biometric authentication
- Session handling

#### 💳 `paymentService.ts`
- Multiple payment gateway integration
- Transaction processing
- Payment validation
- Receipt generation

#### 📦 `productService.ts`
- Product CRUD operations
- Image upload to Cloudinary
- Product search and filtering
- Category management

#### 🛒 `orderService.ts`
- Order creation and management
- Order status updates
- Order history
- Order cancellation

#### 🚚 `deliveryService.ts`
- Delivery assignment
- GPS tracking
- Status updates
- Delivery history

#### 💬 `chatService.ts`
- Real-time messaging
- Socket.io integration
- Message history
- File sharing

#### 🔔 `notificationService.ts`
- Push notification setup
- Notification scheduling
- Device token management
- Notification preferences

#### 📱 `offlineService.ts`
- SQLite database management
- Data synchronization
- Conflict resolution
- Offline queue management

---

## 🗂️ Store Directory (`src/store/`)

Redux store configuration and state slices.

### Structure
```
store/
├── index.ts              # Store configuration
├── slices/               # Redux slices
│   ├── authSlice.ts      # Authentication state
│   ├── cartSlice.ts      # Shopping cart state
│   ├── deliverySlice.ts  # Delivery state
│   ├── notificationSlice.ts # Notification state
│   ├── orderSlice.ts     # Order state
│   ├── paymentSlice.ts   # Payment state
│   ├── productSlice.ts   # Product state
│   ├── uiSlice.ts        # UI state
│   └── walletSlice.ts    # Wallet state
└── types.ts             # Store type definitions
```

### Redux Slices

#### 🔐 `authSlice.ts`
- User authentication state
- Login/logout actions
- User profile management
- Authentication status

#### 🛒 `cartSlice.ts`
- Cart items management
- Add/remove products
- Cart total calculation
- Cart persistence

#### 🚚 `deliverySlice.ts`
- Delivery status tracking
- GPS location updates
- Delivery assignments
- Delivery history

#### 🔔 `notificationSlice.ts`
- Notification queue
- Notification preferences
- Push notification settings
- Notification history

#### 📋 `orderSlice.ts`
- Order creation
- Order status updates
- Order history
- Order details

#### 💳 `paymentSlice.ts`
- Payment method selection
- Transaction processing
- Payment history
- Payment status

#### 📦 `productSlice.ts`
- Product listing
- Product search
- Product filtering
- Product details

#### 🎨 `uiSlice.ts`
- Theme management
- Loading states
- Modal management
- Navigation state

#### 💰 `walletSlice.ts`
- Wallet balance
- Transaction history
- Payment methods
- Wallet settings

---

## 🎨 Theme Directory (`src/theme/`)

Theme configuration and styling constants.

### Structure
```
theme/
├── colors.ts             # Color palette
├── typography.ts         # Font styles and sizes
├── spacing.ts            # Spacing constants
├── shadows.ts            # Shadow definitions
├── index.ts              # Theme exports
└── types.ts              # Theme type definitions
```

### Theme Components

#### 🎨 `colors.ts`
```typescript
export const colors = {
  primary: '#007AFF',
  secondary: '#5856D6',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  background: '#FFFFFF',
  surface: '#F2F2F7',
  text: '#1C1C1E',
  textSecondary: '#8E8E93',
};
```

#### 📝 `typography.ts`
- Font families (primary, secondary)
- Font sizes (xs, sm, md, lg, xl, xxl)
- Font weights (regular, medium, bold)
- Line heights

#### 📏 `spacing.ts`
- Spacing scale (1, 2, 3, 4, 6, 8, 12, 16, 24, 32, 48, 64)
- Margin and padding utilities
- Border radius values

#### 🌑 `shadows.ts`
- Shadow elevation levels
- iOS and Android shadow styles
- Shadow color variations

---

## 📝 Types Directory (`src/types/`)

Additional TypeScript type definitions.

### Structure
```
types/
├── api.ts                # API response types
├── navigation.ts         # Navigation types
├── payment.ts            # Payment-related types
├── ui.ts                 # UI component types
└── index.ts              # Type exports
```

### Key Types

#### 🌐 `api.ts`
- API response interfaces
- Error response types
- Pagination types
- Request parameter types

#### 🧭 `navigation.ts`
- Screen parameter types
- Navigation prop types
- Route parameter types

#### 💳 `payment.ts`
- Payment method types
- Transaction types
- Payment status enums

#### 🎨 `ui.ts`
- Component prop types
- Style types
- Theme types

---

## 🛠️ Utils Directory (`src/utils/`)

Utility functions and helper methods.

### Structure
```
utils/
├── constants.ts          # App constants
├── dateUtils.ts          # Date formatting utilities
├── formatUtils.ts        # Data formatting functions
├── validationUtils.ts    # Input validation
├── storageUtils.ts       # Storage utilities
├── networkUtils.ts       # Network utilities
├── currencyUtils.ts      # Currency formatting
└── index.ts              # Utility exports
```

### Key Utilities

#### 📅 `dateUtils.ts`
- Date formatting
- Relative time calculation
- Date validation
- Timezone handling

#### 🔢 `formatUtils.ts`
- Number formatting
- Text truncation
- Phone number formatting
- Address formatting

#### ✅ `validationUtils.ts`
- Email validation
- Phone number validation
- Password strength validation
- Form validation rules

#### 💾 `storageUtils.ts`
- AsyncStorage helpers
- Data encryption/decryption
- Cache management
- Storage quota checking

#### 🌐 `networkUtils.ts`
- Network status detection
- Connectivity monitoring
- Request retry logic
- Network error handling

#### 💰 `currencyUtils.ts`
- Currency conversion
- Price formatting
- Currency symbols
- Exchange rate handling

---

## 📊 ViewModels Directory (`src/viewmodels/`)

View models following the MVVM pattern for complex UI logic.

### Structure
```
viewmodels/
├── AuthViewModel.ts      # Authentication logic
├── ProductViewModel.ts   # Product management logic
├── OrderViewModel.ts     # Order processing logic
├── PaymentViewModel.ts   # Payment processing logic
├── DeliveryViewModel.ts  # Delivery tracking logic
└── ChatViewModel.ts      # Chat functionality logic
```

### Key ViewModels

#### 🔐 `AuthViewModel.ts`
- Login/logout logic
- User registration
- Password reset
- Biometric authentication

#### 📦 `ProductViewModel.ts`
- Product listing logic
- Product search and filtering
- Product creation/editing
- Image upload handling

#### 🛒 `OrderViewModel.ts`
- Order creation workflow
- Order status management
- Order history retrieval
- Order cancellation logic

#### 💳 `PaymentViewModel.ts`
- Payment method selection
- Payment processing
- Transaction validation
- Payment confirmation

#### 🚚 `DeliveryViewModel.ts`
- Delivery tracking
- GPS location updates
- Delivery status updates
- Delivery history

#### 💬 `ChatViewModel.ts`
- Message sending/receiving
- Chat history management
- Real-time updates
- File sharing logic

---

## 📚 Usage Guidelines

### Component Organization
- Keep components small and focused
- Use TypeScript interfaces for props
- Follow naming conventions (PascalCase for components)
- Export components with named exports

### Service Layer
- Use async/await for API calls
- Implement proper error handling
- Cache frequently used data
- Use TypeScript for type safety

### State Management
- Use Redux for global state
- Keep slices focused on specific domains
- Use selectors for computed state
- Implement proper action types

### File Naming
- Use PascalCase for components and classes
- Use camelCase for utilities and hooks
- Use kebab-case for file names
- Group related files in directories

### Code Quality
- Use ESLint and Prettier
- Write comprehensive tests
- Document complex logic
- Follow React Native best practices

---

This documentation provides a comprehensive overview of the Kamer Vide Grenier mobile app's source code structure. Each directory and file serves a specific purpose in maintaining clean, scalable, and maintainable code architecture.
