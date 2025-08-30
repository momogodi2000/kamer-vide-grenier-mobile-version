# Kamer Vide Grenier Mobile App - Screens Documentation

## 📱 Screens Directory (`src/screens/`)

The screens directory contains all UI screens organized by user role and functionality. Each screen is a React Native component that represents a specific user interface in the application.

---

## 👑 Admin Screens (`admin/`)

Screens for administrative functions and system management.

### AdminDashboard.tsx
**Purpose**: Main admin dashboard with system overview
**Navigation**: Tab-based navigation
**Features**:
- System statistics overview
- Recent activities feed
- Quick action buttons
- Analytics widgets
- User management shortcuts

**Key Components**:
- `SalesChart` - Revenue analytics
- `UserStatsCard` - User statistics
- `RecentOrders` - Latest order activity
- `SystemAlerts` - Important notifications

### UserManagement.tsx
**Purpose**: User administration and management
**Navigation**: Stack navigation from dashboard
**Features**:
- User search and filtering
- User role management
- Account status control
- Bulk user operations
- User activity logs

**Key Components**:
- `UserList` - Paginated user list
- `UserFilters` - Search and filter options
- `UserActions` - User management actions
- `UserDetailsModal` - User information modal

### ProductModeration.tsx
**Purpose**: Product approval and moderation
**Navigation**: Stack navigation from dashboard
**Features**:
- Pending product reviews
- Product approval/rejection
- Content moderation
- Seller communication
- Moderation queue management

**Key Components**:
- `ProductReviewCard` - Product review interface
- `ModerationActions` - Approve/reject actions
- `ProductDetails` - Full product information
- `SellerCommunication` - Message seller

### AnalyticsDashboard.tsx
**Purpose**: Comprehensive system analytics
**Navigation**: Tab navigation
**Features**:
- Revenue analytics
- User behavior insights
- Product performance
- Geographic data
- Time-based reporting

**Key Components**:
- `RevenueChart` - Financial analytics
- `UserAnalytics` - User behavior data
- `ProductAnalytics` - Product performance
- `GeographicMap` - Location-based data

### SystemSettings.tsx
**Purpose**: System configuration and settings
**Navigation**: Stack navigation
**Features**:
- App configuration
- Payment gateway settings
- Notification preferences
- Security settings
- Maintenance mode

**Key Components**:
- `SettingsList` - Organized settings
- `ConfigEditor` - Configuration editor
- `BackupManager` - Data backup tools
- `SystemStatus` - System health monitor

---

## 🔐 Authentication Screens (`auth/`)

Screens for user authentication and account management.

### LoginScreen.tsx
**Purpose**: User login interface
**Navigation**: Root navigation (no auth required)
**Features**:
- Email/password login
- Social login options
- Biometric authentication
- Remember me functionality
- Password recovery link

**Key Components**:
- `LoginForm` - Login form
- `BiometricPrompt` - Biometric auth
- `SocialLoginButtons` - Social login options
- `ForgotPasswordLink` - Password recovery

### RegisterScreen.tsx
**Purpose**: User registration
**Navigation**: Stack navigation from login
**Features**:
- Multi-step registration
- Form validation
- Terms and conditions
- Email verification
- Account type selection

**Key Components**:
- `RegisterForm` - Registration form
- `TermsModal` - Terms and conditions
- `EmailVerification` - Email verification
- `AccountTypeSelector` - User role selection

### ForgotPasswordScreen.tsx
**Purpose**: Password recovery
**Navigation**: Stack navigation from login
**Features**:
- Email verification
- Reset code entry
- New password setup
- Success confirmation

**Key Components**:
- `EmailForm` - Email input
- `CodeVerification` - Reset code entry
- `NewPasswordForm` - Password reset
- `SuccessMessage` - Confirmation

### BiometricSetupScreen.tsx
**Purpose**: Biometric authentication setup
**Navigation**: Stack navigation from profile
**Features**:
- Device capability check
- Biometric enrollment
- Fallback options
- Setup completion

**Key Components**:
- `BiometricInstructions` - Setup instructions
- `BiometricTest` - Test biometric auth
- `FallbackOptions` - Alternative auth methods
- `SetupComplete` - Success confirmation

---

## 👤 Client Screens (`client/`)

Screens for registered users (buyers).

### HomeScreen.tsx
**Purpose**: Main product browsing interface
**Navigation**: Tab navigation (home tab)
**Features**:
- Product grid/list view
- Category browsing
- Search functionality
- Featured products
- Recent products

**Key Components**:
- `ProductGrid` - Product display
- `CategoryTabs` - Category navigation
- `SearchBar` - Product search
- `FeaturedCarousel` - Featured products

### ProductDetailsScreen.tsx
**Purpose**: Detailed product information
**Navigation**: Stack navigation from home/search
**Features**:
- Product image gallery
- Detailed specifications
- Seller information
- Reviews and ratings
- Add to cart/wishlist

**Key Components**:
- `ImageGallery` - Product images
- `ProductInfo` - Product details
- `SellerCard` - Seller information
- `ReviewsList` - Customer reviews
- `ActionButtons` - Cart/wishlist actions

### CartScreen.tsx
**Purpose**: Shopping cart management
**Navigation**: Tab navigation (cart tab)
**Features**:
- Cart items display
- Quantity management
- Price calculations
- Cart persistence
- Checkout initiation

**Key Components**:
- `CartItem` - Individual cart items
- `CartSummary` - Order summary
- `QuantityControls` - Item quantity
- `CheckoutButton` - Proceed to checkout

### CheckoutScreen.tsx
**Purpose**: Order checkout process
**Navigation**: Stack navigation from cart
**Features**:
- Shipping address selection
- Payment method selection
- Order review
- Order confirmation

**Key Components**:
- `AddressSelector` - Shipping address
- `PaymentSelector` - Payment method
- `OrderSummary` - Order details
- `PlaceOrderButton` - Order confirmation

### OrderHistoryScreen.tsx
**Purpose**: User's order history
**Navigation**: Tab navigation (orders tab)
**Features**:
- Order list with status
- Order details view
- Order tracking
- Reorder functionality

**Key Components**:
- `OrderList` - Order history
- `OrderCard` - Individual orders
- `OrderStatus` - Status indicators
- `TrackOrder` - Order tracking

---

## 🚚 Delivery Screens (`delivery/`)

Screens for delivery agents.

### DeliveryDashboard.tsx
**Purpose**: Delivery agent main dashboard
**Navigation**: Tab navigation
**Features**:
- Active deliveries
- Delivery assignments
- Earnings overview
- Performance metrics

**Key Components**:
- `ActiveDeliveries` - Current deliveries
- `EarningsCard` - Earnings summary
- `PerformanceStats` - Delivery metrics
- `QuickActions` - Common actions

### ActiveDeliveriesScreen.tsx
**Purpose**: Current delivery assignments
**Navigation**: Stack navigation from dashboard
**Features**:
- Delivery list
- Status updates
- Customer information
- Route optimization

**Key Components**:
- `DeliveryList` - Active deliveries
- `DeliveryCard` - Delivery details
- `StatusUpdater` - Status changes
- `CustomerInfo` - Customer details

### DeliveryDetailsScreen.tsx
**Purpose**: Individual delivery information
**Navigation**: Stack navigation from active deliveries
**Features**:
- Delivery tracking map
- Customer communication
- Proof of delivery
- Delivery notes

**Key Components**:
- `TrackingMap` - GPS tracking
- `DeliveryInfo` - Delivery details
- `CustomerChat` - Communication
- `ProofOfDelivery` - Delivery confirmation

### EarningsScreen.tsx
**Purpose**: Delivery earnings and payments
**Navigation**: Tab navigation (earnings tab)
**Features**:
- Earnings history
- Payment tracking
- Performance bonuses
- Weekly/monthly summaries

**Key Components**:
- `EarningsChart` - Earnings visualization
- `PaymentHistory` - Payment records
- `BonusTracker` - Performance bonuses
- `PayoutSchedule` - Payment schedule

### DeliveryHistoryScreen.tsx
**Purpose**: Past delivery records
**Navigation**: Tab navigation (history tab)
**Features**:
- Completed deliveries
- Performance analytics
- Customer feedback
- Earnings breakdown

**Key Components**:
- `HistoryList` - Past deliveries
- `PerformanceCard` - Delivery stats
- `CustomerReviews` - Feedback
- `EarningsBreakdown` - Detailed earnings

---

## 🏠 Home Screens (`home/`)

General home and landing screens.

### SplashScreen.tsx
**Purpose**: App loading screen
**Navigation**: Initial screen
**Features**:
- App logo display
- Loading animation
- Version information
- Auto-navigation to main app

**Key Components**:
- `Logo` - App branding
- `LoadingIndicator` - Loading animation
- `VersionInfo` - App version

### OnboardingScreen.tsx
**Purpose**: User onboarding flow
**Navigation**: Stack navigation (first launch)
**Features**:
- Welcome slides
- Feature introduction
- Permission requests
- Account creation prompt

**Key Components**:
- `OnboardingSlides` - Feature slides
- `PermissionRequest` - System permissions
- `GetStartedButton` - Continue to app

### WelcomeScreen.tsx
**Purpose**: Welcome interface for visitors
**Navigation**: Root navigation (no auth)
**Features**:
- App introduction
- Key features highlight
- Login/register options
- Browse as guest

**Key Components**:
- `HeroSection` - App introduction
- `FeaturesList` - Key features
- `AuthOptions` - Login/register
- `GuestBrowse` - Browse without account

---

## 📋 Order Screens (`orders/`)

Order management screens.

### OrderDetailsScreen.tsx
**Purpose**: Detailed order information
**Navigation**: Stack navigation from various screens
**Features**:
- Complete order details
- Order status tracking
- Product information
- Customer/seller details

**Key Components**:
- `OrderHeader` - Order summary
- `OrderItems` - Product list
- `OrderStatus` - Status tracking
- `OrderActions` - Available actions

### OrderTrackingScreen.tsx
**Purpose**: Real-time order tracking
**Navigation**: Stack navigation from order details
**Features**:
- Delivery tracking map
- Status updates
- Estimated delivery time
- Driver information

**Key Components**:
- `TrackingMap` - GPS tracking
- `StatusTimeline` - Order progress
- `ETACard` - Delivery estimate
- `DriverInfo` - Delivery agent details

### OrderHistoryScreen.tsx
**Purpose**: Order history (role-specific)
**Navigation**: Tab navigation
**Features**:
- Order filtering
- Status-based organization
- Search functionality
- Bulk operations

**Key Components**:
- `OrderFilters` - Filter options
- `OrderList` - Order display
- `SearchBar` - Order search
- `BulkActions` - Multiple order actions

### OrderCancellationScreen.tsx
**Purpose**: Order cancellation interface
**Navigation**: Stack navigation from order details
**Features**:
- Cancellation reasons
- Refund information
- Confirmation process
- Alternative options

**Key Components**:
- `CancellationForm` - Reason selection
- `RefundInfo` - Refund details
- `ConfirmDialog` - Confirmation
- `AlternativeActions` - Other options

---

## 👤 Profile Screens (`profile/`)

User profile and settings screens.

### ProfileScreen.tsx
**Purpose**: User profile display and editing
**Navigation**: Tab navigation (profile tab)
**Features**:
- Profile information display
- Profile editing
- Account settings
- Privacy controls

**Key Components**:
- `ProfileHeader` - User info
- `ProfileForm` - Edit profile
- `SettingsList` - Account settings
- `PrivacySettings` - Privacy controls

### EditProfileScreen.tsx
**Purpose**: Profile editing interface
**Navigation**: Stack navigation from profile
**Features**:
- Personal information editing
- Profile picture upload
- Address management
- Preference settings

**Key Components**:
- `PersonalInfoForm` - Basic info
- `ProfilePicture` - Photo upload
- `AddressForm` - Address management
- `PreferencesForm` - User preferences

### SettingsScreen.tsx
**Purpose**: App settings and preferences
**Navigation**: Stack navigation from profile
**Features**:
- Notification settings
- Privacy settings
- App preferences
- Account management

**Key Components**:
- `NotificationSettings` - Push notifications
- `PrivacySettings` - Privacy controls
- `AppPreferences` - App settings
- `AccountActions` - Account management

### ChangePasswordScreen.tsx
**Purpose**: Password change interface
**Navigation**: Stack navigation from settings
**Features**:
- Current password verification
- New password setup
- Password strength validation
- Confirmation process

**Key Components**:
- `PasswordForm` - Password change
- `StrengthIndicator` - Password strength
- `ConfirmationDialog` - Confirm change
- `SuccessMessage` - Change confirmation

---

## 🛍️ Seller Screens (`seller/`)

Screens for sellers/vendors.

### SellerDashboard.tsx
**Purpose**: Seller main dashboard
**Navigation**: Tab navigation
**Features**:
- Sales overview
- Product management
- Order tracking
- Performance analytics

**Key Components**:
- `SalesOverview` - Sales metrics
- `ProductStats` - Product performance
- `OrderSummary` - Order status
- `AnalyticsWidgets` - Performance data

### ProductManagementScreen.tsx
**Purpose**: Product CRUD operations
**Navigation**: Tab navigation (products tab)
**Features**:
- Product listing
- Add/edit products
- Inventory management
- Product analytics

**Key Components**:
- `ProductList` - Product display
- `AddProductButton` - New product
- `ProductEditor` - Edit product
- `InventoryControls` - Stock management

### OrderManagementScreen.tsx
**Purpose**: Seller order management
**Navigation**: Tab navigation (orders tab)
**Features**:
- Order processing
- Status updates
- Customer communication
- Order analytics

**Key Components**:
- `OrderQueue` - Pending orders
- `OrderProcessor` - Order handling
- `CustomerChat` - Communication
- `OrderAnalytics` - Order metrics

### SalesAnalyticsScreen.tsx
**Purpose**: Sales performance analytics
**Navigation**: Tab navigation (analytics tab)
**Features**:
- Revenue tracking
- Product performance
- Customer insights
- Sales forecasting

**Key Components**:
- `RevenueChart` - Sales visualization
- `ProductPerformance` - Product analytics
- `CustomerInsights` - Customer data
- `ForecastWidget` - Sales predictions

### EarningsScreen.tsx
**Purpose**: Seller earnings and payouts
**Navigation**: Tab navigation (earnings tab)
**Features**:
- Earnings history
- Payout tracking
- Commission breakdown
- Payment methods

**Key Components**:
- `EarningsChart` - Earnings visualization
- `PayoutHistory` - Payment records
- `CommissionBreakdown` - Fee structure
- `PaymentMethods` - Payout options

---

## 📱 Screen Architecture Patterns

### 1. Screen Structure
```typescript
// Screen component structure
import React, { useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { styles } from './styles';

interface ScreenNameProps {
  navigation: any;
  route: any;
}

const ScreenName: React.FC<ScreenNameProps> = ({ navigation, route }) => {
  // Redux hooks
  const dispatch = useDispatch();
  const data = useSelector(state => state.slice.data);

  // Local state
  const [loading, setLoading] = useState(false);

  // Effects
  useEffect(() => {
    loadData();
  }, []);

  // Functions
  const loadData = async () => {
    setLoading(true);
    try {
      await dispatch(fetchData());
    } catch (error) {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Screen content */}
    </ScrollView>
  );
};

export default ScreenName;
```

### 2. Navigation Integration
```typescript
// Navigation setup
const ScreenName = ({ navigation, route }: ScreenNameProps) => {
  // Navigation params
  const { param1, param2 } = route.params || {};

  // Navigation functions
  const goToNextScreen = () => {
    navigation.navigate('NextScreen', { data: someData });
  };

  const goBack = () => {
    navigation.goBack();
  };

  return (
    // Screen JSX
  );
};
```

### 3. Redux Integration
```typescript
// Redux state and actions
const ScreenName = () => {
  const dispatch = useDispatch();

  // Selectors
  const data = useSelector(state => state.dataSlice.items);
  const loading = useSelector(state => state.dataSlice.loading);
  const error = useSelector(state => state.dataSlice.error);

  // Actions
  const loadData = () => {
    dispatch(fetchDataAction());
  };

  const updateData = (newData) => {
    dispatch(updateDataAction(newData));
  };

  return (
    // Screen JSX with data, loading, error handling
  );
};
```

### 4. Error Handling
```typescript
// Error boundary and error handling
const ScreenName = () => {
  const [error, setError] = useState(null);

  const handleError = (error) => {
    setError(error.message);
    // Log error, show toast, etc.
  };

  if (error) {
    return <ErrorView error={error} onRetry={() => setError(null)} />;
  }

  return (
    // Normal screen content
  );
};
```

### 5. Loading States
```typescript
// Loading state management
const ScreenName = () => {
  const loading = useSelector(state => state.dataSlice.loading);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    // Screen content
  );
};
```

---

## 🎨 Screen Design Guidelines

### Layout
- Use consistent spacing (theme.spacing)
- Implement responsive design
- Follow platform-specific guidelines
- Use proper touch targets

### Navigation
- Clear navigation hierarchy
- Consistent back navigation
- Proper screen titles
- Loading states during navigation

### User Experience
- Handle offline scenarios
- Provide feedback for actions
- Implement proper error states
- Use loading indicators

### Performance
- Implement proper key props for lists
- Use FlatList for large datasets
- Optimize image loading
- Implement proper memoization

### Accessibility
- Add accessibility labels
- Support screen readers
- Handle keyboard navigation
- Provide proper focus management

---

## 🔄 Screen Lifecycle

### 1. Initialization
- Load required data
- Set up subscriptions
- Initialize local state
- Configure navigation options

### 2. User Interaction
- Handle user inputs
- Update local state
- Dispatch actions
- Navigate between screens

### 3. Data Updates
- Listen for Redux updates
- Update local state
- Re-render components
- Handle side effects

### 4. Cleanup
- Cancel pending requests
- Clear subscriptions
- Reset local state
- Clean up resources

---

## 📱 Responsive Design

### Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Adaptive Layout
- Use flexbox for flexible layouts
- Implement responsive grids
- Handle different screen orientations
- Scale components appropriately

### Platform-Specific
- iOS-specific styling
- Android-specific styling
- Web-specific considerations
- Cross-platform compatibility

This comprehensive screens documentation covers all the UI screens in the Kamer Vide Grenier mobile app, organized by user role and functionality, with detailed information about each screen's purpose, features, and implementation patterns.
