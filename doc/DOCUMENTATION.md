# Kamer Vidé-Grenier - Mobile App Documentation

## 📋 Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Navigation Structure](#navigation-structure)
- [State Management](#state-management)
- [Services & API](#services--api)
- [Screen Components](#screen-components)
- [Authentication Flow](#authentication-flow)
- [Role-Based Dashboards](#role-based-dashboards)
- [Offline Capabilities](#offline-capabilities)
- [Testing](#testing)
- [Build & Deployment](#build--deployment)
- [Platform-Specific Features](#platform-specific-features)

## 🎯 Overview

The Kamer Vidé-Grenier mobile app is a React Native application that provides a native mobile experience for Cameroon's premier digital marketplace. Built with TypeScript for type safety and featuring comprehensive offline capabilities, the app delivers optimal performance for both iOS and Android platforms.

### Key Features
- **Role-Based Interface**: Adaptive UI based on user roles (Client, Admin, Delivery)
- **Offline-First Architecture**: Seamless experience even without internet
- **Cameroon Integration**: XAF currency, local phone formats, French/English localization
- **Real-time Updates**: Socket.IO integration for live notifications
- **Advanced Security**: Biometric authentication, encrypted storage
- **Payment Integration**: Mobile Money support (MTN, Orange, Express Union)
- **Image Recognition**: AI-powered product categorization
- **Delivery Tracking**: Real-time GPS tracking for deliveries

### Technology Stack
- **Framework**: React Native 0.73+
- **Language**: TypeScript
- **Navigation**: React Navigation v6
- **State Management**: Redux Toolkit with RTK Query
- **Networking**: Axios with interceptors
- **Database**: SQLite with TypeORM (offline storage)
- **Authentication**: JWT with biometric support
- **UI Components**: React Native Elements + Custom components
- **Maps**: React Native Maps
- **Push Notifications**: React Native Push Notification
- **Image Handling**: React Native Image Picker/Crop
- **Storage**: React Native Keychain/AsyncStorage

## 🏗️ Architecture

```
src/
├── components/           # Reusable UI components
│   ├── common/          # Generic components
│   └── specific/        # Feature-specific components
├── screens/             # Screen components
│   ├── auth/           # Authentication screens
│   ├── admin/          # Admin dashboard screens
│   ├── client/         # Client dashboard screens
│   ├── delivery/       # Delivery dashboard screens
│   └── home/           # General app screens
├── navigation/          # Navigation configuration
│   ├── types.ts        # Navigation type definitions
│   ├── AppNavigator.tsx # Root navigator
│   ├── AuthNavigator.tsx # Auth stack
│   ├── MainNavigator.tsx # Main app stack
│   └── tabs/           # Tab navigators
├── services/           # API and external services
├── store/              # Redux store configuration
│   └── slices/         # Redux Toolkit slices
├── models/             # TypeScript interfaces
├── utils/              # Utility functions
├── assets/             # Images, fonts, icons
└── viewmodels/         # Business logic layer
```

### Design Patterns
- **MVVM Pattern**: ViewModels for business logic separation
- **Repository Pattern**: Data access abstraction
- **Observer Pattern**: Redux for state management
- **Factory Pattern**: Service instantiation
- **Singleton Pattern**: Database and API clients

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)
- CocoaPods (for iOS dependencies)

### Installation

1. **Clone and install dependencies:**
```bash
cd videgrinier-mobile
npm install

# iOS specific (macOS only)
cd ios && pod install && cd ..
```

2. **Environment Configuration:**
Create `.env` file:
```env
# API Configuration
API_BASE_URL=http://localhost:5000/api
WS_URL=ws://localhost:5000
ENVIRONMENT=development

# App Configuration
APP_NAME=Kamer Vidé-Grenier
APP_VERSION=1.0.0
BUNDLE_ID=com.kamer.videgrenier

# External Services
GOOGLE_MAPS_API_KEY=your_google_maps_key
SENTRY_DSN=your_sentry_dsn

# Feature Flags
ENABLE_BIOMETRIC=true
ENABLE_OFFLINE=true
ENABLE_PUSH_NOTIFICATIONS=true
ENABLE_AI_FEATURES=true

# Payment Configuration
CAMPAY_APP_ID=your_campay_app_id
NOUPIA_MERCHANT_ID=your_noupia_merchant_id
```

3. **Platform Setup:**

**Android:**
```bash
# Start Metro bundler
npm start

# Run on Android device/emulator
npm run android
```

**iOS:**
```bash
# Start Metro bundler
npm start

# Run on iOS simulator (macOS only)
npm run ios
```

### Development Scripts
```bash
npm start              # Start Metro bundler
npm run android       # Run Android app
npm run ios          # Run iOS app (macOS only)
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run lint         # Check code style
npm run type-check   # TypeScript type checking
npm run clean        # Clean build cache
npm run build:android # Build Android APK
npm run build:ios    # Build iOS app (macOS only)
```

## 🗺️ Navigation Structure

### Navigation Hierarchy
```
AppNavigator (Stack)
├── AuthNavigator (Stack) - Unauthenticated users
│   ├── WelcomeScreen
│   ├── LoginScreen
│   ├── RegisterScreen
│   ├── VerifyEmailScreen
│   ├── VerifyPhoneScreen
│   └── ForgotPasswordScreen
└── MainNavigator (Stack) - Authenticated users
    ├── RoleBasedDashboard (Conditional)
    │   ├── ClientDashboard
    │   ├── AdminDashboard
    │   └── DeliveryDashboard
    ├── BottomTabNavigator
    │   ├── HomeTab
    │   ├── SearchTab
    │   ├── SellTab
    │   ├── OrdersTab
    │   └── ProfileTab
    └── ModalNavigator (Modal Stack)
        ├── ProductDetailModal
        ├── OrderDetailModal
        └── PaymentModal
```

### Navigation Configuration
```typescript
// types.ts
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  VerifyEmail: { token?: string; email?: string };
  VerifyPhone: { phone: string };
};

export type MainStackParamList = {
  Dashboard: undefined;
  Tabs: undefined;
  ProductDetail: { productId: string };
  OrderDetail: { orderId: string };
};
```

### Dynamic Navigation
```typescript
// Role-based navigation
const getDashboardComponent = (userRole: UserRole) => {
  switch (userRole) {
    case 'admin':
    case 'super_admin':
      return AdminDashboard;
    case 'delivery':
      return DeliveryDashboard;
    case 'client':
    case 'partner':
    default:
      return ClientDashboard;
  }
};
```

## 🎯 State Management

### Redux Store Structure
```typescript
interface RootState {
  auth: AuthState;
  user: UserState;
  products: ProductsState;
  orders: OrdersState;
  cart: CartState;
  notifications: NotificationsState;
  ui: UIState;
}
```

### Auth Slice
```typescript
// store/slices/authSlice.ts
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  tokens: {
    access: string | null;
    refresh: string | null;
  };
  biometricEnabled: boolean;
  loading: boolean;
  error: string | null;
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.tokens = action.payload.tokens;
      state.loading = false;
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.tokens = { access: null, refresh: null };
    },
  },
});
```

### RTK Query API
```typescript
// services/api.ts
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.tokens.access;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['User', 'Product', 'Order', 'Notification'],
  endpoints: (builder) => ({
    // API endpoints defined here
  }),
});
```

## 🌐 Services & API

### Core Services

#### 1. AuthService (`services/authService.ts`)
```typescript
class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post('/auth/login', credentials);
    await this.storeBiometricData(response.data);
    return response.data;
  }

  async biometricLogin(): Promise<AuthResponse> {
    const hasFingerprint = await BiometricService.isAvailable();
    if (!hasFingerprint) throw new Error('Biometric not available');
    
    const credentials = await BiometricService.getCredentials();
    return this.login(credentials);
  }

  async refreshToken(): Promise<string> {
    const refreshToken = await SecureStorage.get('refresh_token');
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data.accessToken;
  }
}
```

#### 2. OfflineDatabase (`services/offlineDatabase.ts`)
```typescript
class OfflineDatabase {
  private connection: Connection;

  async initialize(): Promise<void> {
    this.connection = await createConnection({
      type: 'react-native',
      database: 'kamer_offline.db',
      location: 'default',
      logging: ['error'],
      synchronize: false,
      entities: [UserEntity, ProductEntity, OrderEntity],
    });
  }

  async syncWithServer(): Promise<void> {
    const pendingActions = await this.getPendingActions();
    for (const action of pendingActions) {
      try {
        await this.executeRemoteAction(action);
        await this.markActionCompleted(action.id);
      } catch (error) {
        console.log('Sync failed for action:', action.id);
      }
    }
  }
}
```

#### 3. NotificationService (`services/notificationService.ts`)
```typescript
class NotificationService {
  async initialize(): Promise<void> {
    await PushNotification.configure({
      onNotification: this.handleNotification,
      onRegistrationError: this.handleRegistrationError,
    });

    const token = await PushNotification.getToken();
    await this.registerDeviceToken(token);
  }

  async handleNotification(notification: Notification): Promise<void> {
    if (notification.userInteraction) {
      // User tapped notification
      await this.navigateToNotification(notification);
    } else {
      // Background notification
      store.dispatch(addNotification(notification));
    }
  }

  async scheduleLocalNotification(notification: LocalNotification): Promise<void> {
    await PushNotification.localNotificationSchedule({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      date: notification.scheduledDate,
      userInfo: notification.data,
    });
  }
}
```

### API Integration
```typescript
// HTTP Interceptors
api.interceptors.request.use(
  (config) => {
    // Add auth headers, request timing, etc.
    config.metadata = { startTime: Date.now() };
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    // Log response time, handle success
    const duration = Date.now() - response.config.metadata.startTime;
    console.log(`Request to ${response.config.url} took ${duration}ms`);
    return response;
  },
  async (error) => {
    // Handle token refresh
    if (error.response?.status === 401) {
      await store.dispatch(refreshTokenThunk());
      return api.request(error.config);
    }
    return Promise.reject(error);
  }
);
```

## 📱 Screen Components

### Authentication Screens

#### WelcomeScreen
```typescript
const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const features = [
    {
      icon: 'shopping-bag',
      title: 'Acheter & Vendre',
      description: 'Découvrez des milliers de produits locaux',
      color: '#2563EB'
    },
    // ... other features
  ];

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={['#F0FDF4', '#EFF6FF']}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Welcome content */}
        </Animated.View>
      </LinearGradient>
    </ScrollView>
  );
};
```

#### VerifyPhoneScreen
```typescript
const VerifyPhoneScreen: React.FC = () => {
  const [code, setCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const route = useRoute<VerifyPhoneScreenRouteProp>();

  const verifyPhone = useCallback(async () => {
    try {
      await authService.verifyPhone(route.params.phone, code);
      navigation.navigate('Dashboard');
    } catch (error) {
      Alert.alert('Erreur', 'Code invalide');
    }
  }, [code, route.params.phone]);

  return (
    <KeyboardAvoidingView style={styles.container}>
      <ScrollView>
        <View style={styles.content}>
          <Text style={styles.title}>Vérifiez votre téléphone</Text>
          <Text style={styles.subtitle}>
            Code envoyé au {formatPhone(route.params.phone)}
          </Text>
          
          <TextInput
            style={styles.codeInput}
            value={code}
            onChangeText={setCode}
            placeholder="123456"
            keyboardType="numeric"
            maxLength={6}
            autoFocus
          />
          
          <TouchableOpacity
            style={styles.verifyButton}
            onPress={verifyPhone}
            disabled={code.length !== 6}
          >
            <Text style={styles.verifyButtonText}>Vérifier</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
```

### Dashboard Screens

#### ClientDashboard
```typescript
const ClientDashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: stats } = useGetDashboardStatsQuery();
  const navigation = useNavigation();

  const quickActions = [
    {
      title: 'Vendre un produit',
      icon: 'add-circle',
      onPress: () => navigation.navigate('SellProduct'),
      color: '#16A34A'
    },
    {
      title: 'Mes commandes',
      icon: 'receipt',
      onPress: () => navigation.navigate('Orders'),
      color: '#2563EB'
    },
    // ... other actions
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>
          Bonjour, {user?.first_name}!
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Notifications')}
        >
          <Icon name="notifications" size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <StatCard title="Ventes" value={stats?.totalSales || 0} />
        <StatCard title="Achats" value={stats?.totalPurchases || 0} />
        <StatCard title="Revenus" value={formatCurrency(stats?.earnings || 0)} />
      </View>

      <View style={styles.quickActions}>
        {quickActions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.actionCard, { borderLeftColor: action.color }]}
            onPress={action.onPress}
          >
            <Icon name={action.icon} size={24} color={action.color} />
            <Text style={styles.actionTitle}>{action.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};
```

#### AdminDashboard
```typescript
const AdminDashboard: React.FC = () => {
  const { data: analytics } = useGetAdminAnalyticsQuery();
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  const chartData = useMemo(() => {
    return analytics?.revenue?.map(item => ({
      x: item.date,
      y: item.amount
    })) || [];
  }, [analytics]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard Admin</Text>
        <PeriodSelector
          value={selectedPeriod}
          onChange={setSelectedPeriod}
        />
      </View>

      <View style={styles.metricsGrid}>
        <MetricCard
          title="Utilisateurs Actifs"
          value={analytics?.activeUsers || 0}
          change="+12%"
          icon="people"
        />
        <MetricCard
          title="Revenus"
          value={formatCurrency(analytics?.totalRevenue || 0)}
          change="+8%"
          icon="trending-up"
        />
        {/* More metrics */}
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Revenus</Text>
        <LineChart
          data={chartData}
          width={Dimensions.get('window').width - 32}
          height={220}
          chartConfig={chartConfig}
        />
      </View>

      <AdminActions />
    </ScrollView>
  );
};
```

## 🔐 Authentication Flow

### Authentication States
```typescript
type AuthState = 
  | 'unauthenticated'
  | 'authenticating'
  | 'authenticated'
  | 'token_expired'
  | 'biometric_available'
  | 'biometric_authenticating';

const AuthFlow: React.FC = () => {
  const { authState, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const hasStoredToken = await SecureStorage.has('access_token');
      if (hasStoredToken) {
        const hasBiometric = await BiometricService.isAvailable();
        if (hasBiometric) {
          dispatch(setBiometricAvailable(true));
        } else {
          await dispatch(validateStoredToken()).unwrap();
        }
      }
    } catch (error) {
      dispatch(logout());
    }
  };

  switch (authState) {
    case 'biometric_available':
      return <BiometricPrompt />;
    case 'authenticating':
      return <LoadingScreen />;
    case 'authenticated':
      return <MainNavigator />;
    default:
      return <AuthNavigator />;
  }
};
```

### Biometric Authentication
```typescript
const BiometricService = {
  async isAvailable(): Promise<boolean> {
    const biometryType = await TouchID.isSupported();
    return biometryType !== false;
  },

  async authenticate(): Promise<boolean> {
    try {
      await TouchID.authenticate('Connectez-vous avec votre empreinte', {
        title: 'Authentification biométrique',
        color: '#16A34A',
        fallbackTitle: 'Utiliser le code PIN',
      });
      return true;
    } catch (error) {
      return false;
    }
  },

  async storeCredentials(credentials: AuthCredentials): Promise<void> {
    await Keychain.setInternetCredentials(
      'kamer_auth',
      credentials.email,
      credentials.token
    );
  },

  async getStoredCredentials(): Promise<AuthCredentials | null> {
    try {
      const credentials = await Keychain.getInternetCredentials('kamer_auth');
      return {
        email: credentials.username,
        token: credentials.password,
      };
    } catch (error) {
      return null;
    }
  },
};
```

## 🎭 Role-Based Dashboards

### Dashboard Factory
```typescript
const DashboardFactory = {
  createDashboard: (role: UserRole): React.ComponentType => {
    switch (role) {
      case 'admin':
      case 'super_admin':
        return AdminDashboard;
      case 'delivery':
        return DeliveryDashboard;
      case 'client':
      case 'partner':
      default:
        return ClientDashboard;
    }
  },

  getDashboardConfig: (role: UserRole): DashboardConfig => {
    return {
      quickActions: getQuickActionsForRole(role),
      widgets: getWidgetsForRole(role),
      permissions: getPermissionsForRole(role),
    };
  },
};
```

### Permission System
```typescript
const usePermissions = (requiredPermission: Permission) => {
  const { user } = useSelector((state: RootState) => state.auth);
  
  return useMemo(() => {
    const userPermissions = getRolePermissions(user?.role);
    return userPermissions.includes(requiredPermission);
  }, [user?.role, requiredPermission]);
};

// Usage in components
const MyComponent: React.FC = () => {
  const canManageUsers = usePermissions('manage_users');
  const canViewAnalytics = usePermissions('view_analytics');

  return (
    <View>
      {canViewAnalytics && <AnalyticsWidget />}
      {canManageUsers && <UserManagement />}
    </View>
  );
};
```

## 📴 Offline Capabilities

### Offline-First Architecture
```typescript
class OfflineManager {
  private queue: PendingAction[] = [];

  async addAction(action: PendingAction): Promise<void> {
    this.queue.push(action);
    await AsyncStorage.setItem('pending_actions', JSON.stringify(this.queue));
    
    if (NetInfo.isConnected) {
      this.processQueue();
    }
  }

  async processQueue(): Promise<void> {
    while (this.queue.length > 0) {
      const action = this.queue[0];
      try {
        await this.executeAction(action);
        this.queue.shift();
      } catch (error) {
        console.log('Failed to process action:', error);
        break;
      }
    }
    await this.saveQueue();
  }

  async executeAction(action: PendingAction): Promise<void> {
    switch (action.type) {
      case 'CREATE_PRODUCT':
        await api.post('/products', action.payload);
        break;
      case 'UPDATE_ORDER':
        await api.put(`/orders/${action.id}`, action.payload);
        break;
      // Handle other actions
    }
  }
}
```

### Data Synchronization
```typescript
const useSyncManager = () => {
  const dispatch = useDispatch();
  
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected) {
        dispatch(startSync());
      }
    });

    return unsubscribe;
  }, [dispatch]);

  const syncData = useCallback(async () => {
    try {
      // Sync user data
      const user = await api.get('/users/profile');
      dispatch(updateUser(user.data));

      // Sync orders
      const orders = await api.get('/orders');
      dispatch(updateOrders(orders.data));

      // Process pending actions
      await offlineManager.processQueue();
    } catch (error) {
      console.log('Sync failed:', error);
    }
  }, [dispatch]);

  return { syncData };
};
```

## 🧪 Testing

### Test Structure
```
__tests__/
├── components/          # Component tests
├── screens/            # Screen integration tests
├── services/           # Service unit tests
├── utils/              # Utility function tests
├── __mocks__/          # Mock implementations
└── setup.ts           # Test configuration
```

### Testing Configuration
```javascript
// jest.config.js
module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest.setup-after-env.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-navigation|@react-navigation)/)',
  ],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
```

### Test Examples
```typescript
// __tests__/screens/auth/LoginScreen.test.tsx
describe('LoginScreen', () => {
  it('should render login form', () => {
    const { getByPlaceholderText, getByText } = render(
      <Provider store={store}>
        <LoginScreen />
      </Provider>
    );

    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Mot de passe')).toBeTruthy();
    expect(getByText('Se connecter')).toBeTruthy();
  });

  it('should handle login submission', async () => {
    const mockLogin = jest.fn();
    const { getByPlaceholderText, getByText } = render(
      <Provider store={store}>
        <LoginScreen />
      </Provider>
    );

    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Mot de passe'), 'password123');
    fireEvent.press(getByText('Se connecter'));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });
});
```

## 📦 Build & Deployment

### Environment-Specific Builds
```json
{
  "scripts": {
    "build:dev:android": "cd android && ./gradlew assembleDebug",
    "build:staging:android": "cd android && ./gradlew assembleStaging",
    "build:prod:android": "cd android && ./gradlew assembleRelease",
    "build:dev:ios": "react-native run-ios --configuration Debug",
    "build:prod:ios": "react-native run-ios --configuration Release"
  }
}
```

### Code Signing & Release
```yaml
# fastlane/Fastfile
platform :android do
  lane :release do
    gradle(
      task: "assembleRelease",
      project_dir: "android/"
    )
    
    upload_to_play_store(
      track: "internal",
      apk: "android/app/build/outputs/apk/release/app-release.apk"
    )
  end
end

platform :ios do
  lane :release do
    gym(
      scheme: "KamerVideGrenierApp",
      configuration: "Release"
    )
    
    deliver(
      submit_for_review: false,
      skip_screenshots: true,
      skip_metadata: true
    )
  end
end
```

### Version Management
```typescript
// version.ts
export const APP_VERSION = {
  major: 1,
  minor: 0,
  patch: 0,
  build: __DEV__ ? 999 : BUILD_NUMBER,
  toString: () => `${major}.${minor}.${patch}`,
  fullVersion: () => `${major}.${minor}.${patch}.${build}`,
};

// Automatic version checking
const useVersionCheck = () => {
  useEffect(() => {
    checkAppVersion().then(({ needsUpdate, storeVersion }) => {
      if (needsUpdate) {
        Alert.alert(
          'Mise à jour disponible',
          `Une nouvelle version (${storeVersion}) est disponible.`,
          [
            { text: 'Plus tard', style: 'cancel' },
            { text: 'Mettre à jour', onPress: openStore },
          ]
        );
      }
    });
  }, []);
};
```

## 📱 Platform-Specific Features

### iOS Specific
```typescript
// iOS specific configurations
const iOSConfig = {
  // App Transport Security
  NSAppTransportSecurity: {
    NSAllowsArbitraryLoads: false,
    NSExceptionDomains: {
      'your-api-domain.com': {
        NSExceptionAllowsInsecureHTTPLoads: false,
        NSExceptionMinimumTLSVersion: '1.2',
      },
    },
  },
  
  // Background modes
  UIBackgroundModes: [
    'background-processing',
    'background-fetch',
  ],
  
  // Privacy permissions
  NSCameraUsageDescription: 'Cette app utilise la caméra pour prendre des photos de produits.',
  NSLocationWhenInUseUsageDescription: 'Cette app utilise la localisation pour la livraison.',
  NSFaceIDUsageDescription: 'Utilisez Face ID pour vous connecter rapidement.',
};
```

### Android Specific
```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
  <!-- Permissions -->
  <uses-permission android:name="android.permission.INTERNET" />
  <uses-permission android:name="android.permission.CAMERA" />
  <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
  <uses-permission android:name="android.permission.USE_FINGERPRINT" />
  <uses-permission android:name="android.permission.USE_BIOMETRIC" />
  
  <!-- Network security config -->
  <application
    android:networkSecurityConfig="@xml/network_security_config"
    android:usesCleartextTraffic="false">
    
    <!-- Deep linking -->
    <activity
      android:name=".MainActivity"
      android:exported="true"
      android:launchMode="singleTask">
      <intent-filter android:autoVerify="true">
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data android:scheme="kamer" />
      </intent-filter>
    </activity>
  </application>
</manifest>
```

### Performance Optimizations
```typescript
// Image optimization
const OptimizedImage: React.FC<{ uri: string }> = ({ uri }) => {
  return (
    <FastImage
      source={{
        uri,
        priority: FastImage.priority.normal,
        cache: FastImage.cacheControl.immutable,
      }}
      style={styles.image}
      resizeMode={FastImage.resizeMode.cover}
    />
  );
};

// Memory management for lists
const ProductList: React.FC = () => {
  const renderProduct = useCallback(({ item }: { item: Product }) => (
    <ProductCard product={item} />
  ), []);

  return (
    <FlatList
      data={products}
      renderItem={renderProduct}
      keyExtractor={(item) => item.id}
      removeClippedSubviews
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={5}
      getItemLayout={(data, index) => ({
        length: ITEM_HEIGHT,
        offset: ITEM_HEIGHT * index,
        index,
      })}
    />
  );
};
```

---

## 📞 Support & Maintenance

### Performance Monitoring
- **Flipper**: Development debugging and profiling
- **Sentry**: Crash reporting and performance monitoring
- **React Native Performance**: Built-in performance metrics

### Debugging Tools
```bash
# React Native Debugger
npm install -g react-native-debugger

# Flipper plugins
flipper-plugin-redux-debugger
flipper-plugin-async-storage
flipper-plugin-network
```

### Common Issues & Solutions
- **Build failures**: Clear cache with `npm run clean`
- **Metro bundler issues**: Reset Metro cache with `npx react-native start --reset-cache`
- **iOS pod issues**: `cd ios && pod install --repo-update`
- **Android build issues**: Clean gradle with `cd android && ./gradlew clean`

**Last Updated**: December 2024
**Version**: 1.0.0
**Platforms**: iOS 13+, Android API 21+