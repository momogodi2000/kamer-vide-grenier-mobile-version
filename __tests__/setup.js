import 'react-native-gesture-handler/jestSetup';
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// Mock react-native modules
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Platform: {
      ...RN.Platform,
      OS: 'ios',
      select: jest.fn((config) => config.ios || config.default),
    },
    Dimensions: {
      get: jest.fn(() => ({ width: 375, height: 667 })),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },
    Alert: {
      alert: jest.fn(),
    },
    Linking: {
      openURL: jest.fn(() => Promise.resolve()),
      canOpenURL: jest.fn(() => Promise.resolve(true)),
    },
    StatusBar: {
      setBarStyle: jest.fn(),
      setBackgroundColor: jest.fn(),
    },
  };
});

// Mock react-navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    reset: jest.fn(),
    setOptions: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
  useFocusEffect: jest.fn(),
  NavigationContainer: ({ children }) => children,
}));

jest.mock('@react-navigation/stack', () => ({
  createStackNavigator: () => ({
    Navigator: ({ children }) => children,
    Screen: ({ children }) => children,
  }),
}));

jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: ({ children }) => children,
    Screen: ({ children }) => children,
  }),
}));

// Mock vector icons
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');
jest.mock('react-native-vector-icons/FontAwesome', () => 'Icon');

// Mock image picker
jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn(),
  launchCamera: jest.fn(),
  MediaType: {
    photo: 'photo',
    video: 'video',
    mixed: 'mixed',
  },
}));

// Mock permissions
jest.mock('react-native-permissions', () => ({
  PERMISSIONS: {
    IOS: {
      CAMERA: 'ios.permission.CAMERA',
      PHOTO_LIBRARY: 'ios.permission.PHOTO_LIBRARY',
    },
    ANDROID: {
      CAMERA: 'android.permission.CAMERA',
      READ_EXTERNAL_STORAGE: 'android.permission.READ_EXTERNAL_STORAGE',
    },
  },
  RESULTS: {
    GRANTED: 'granted',
    DENIED: 'denied',
    BLOCKED: 'blocked',
  },
  request: jest.fn(() => Promise.resolve('granted')),
  check: jest.fn(() => Promise.resolve('granted')),
}));

// Mock react-native-maps
jest.mock('react-native-maps', () => ({
  __esModule: true,
  default: 'MapView',
  Marker: 'Marker',
  Callout: 'Callout',
  PROVIDER_GOOGLE: 'google',
}));

// Mock geolocation
const mockGeolocation = {
  getCurrentPosition: jest.fn((success) =>
    success({
      coords: {
        latitude: 3.848,
        longitude: 11.502,
        accuracy: 10,
      },
    })
  ),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
};

global.navigator.geolocation = mockGeolocation;

// Mock push notifications
jest.mock('@react-native-firebase/messaging', () => ({
  __esModule: true,
  default: () => ({
    hasPermission: jest.fn(() => Promise.resolve(true)),
    subscribeToTopic: jest.fn(),
    unsubscribeFromTopic: jest.fn(),
    requestPermission: jest.fn(() => Promise.resolve(true)),
    getToken: jest.fn(() => Promise.resolve('fcm-token')),
    onMessage: jest.fn(),
    onNotificationOpenedApp: jest.fn(),
    getInitialNotification: jest.fn(() => Promise.resolve(null)),
  }),
}));

// Mock Flipper
jest.mock('react-native-flipper', () => ({
  createFlipperPlugin: jest.fn(),
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => children,
  SafeAreaView: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

// Mock react-native-keyboard-aware-scroll-view
jest.mock('react-native-keyboard-aware-scroll-view', () => ({
  KeyboardAwareScrollView: ({ children }) => children,
}));

// Mock react-native-device-info
jest.mock('react-native-device-info', () => ({
  getVersion: () => '1.0.0',
  getBuildNumber: () => '1',
  getUniqueId: () => 'unique-device-id',
  getSystemVersion: () => '14.0',
}));

// Mock NetInfo
jest.mock('@react-native-netinfo/netinfo', () => ({
  fetch: jest.fn(() =>
    Promise.resolve({
      isConnected: true,
      isInternetReachable: true,
      type: 'wifi',
    })
  ),
  addEventListener: jest.fn(() => jest.fn()),
}));

// Mock i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, options) => {
      if (options && typeof options === 'object') {
        let result = key;
        Object.keys(options).forEach(optionKey => {
          result = result.replace(new RegExp(`{{${optionKey}}}`, 'g'), options[optionKey]);
        });
        return result;
      }
      return key;
    },
    i18n: {
      changeLanguage: jest.fn(),
      language: 'en',
    },
  }),
  initReactI18next: {
    type: '3rdParty',
    init: jest.fn(),
  },
}));

// Mock react-native-fast-image
jest.mock('react-native-fast-image', () => 'FastImage');

// Mock react-native-chart-kit
jest.mock('react-native-chart-kit', () => ({
  LineChart: 'LineChart',
  BarChart: 'BarChart',
  PieChart: 'PieChart',
  ProgressChart: 'ProgressChart',
}));

// Mock react-native-modal
jest.mock('react-native-modal', () => 'Modal');

// Global test utilities for mobile
global.testUtils = {
  // Mock user data
  mockUser: {
    id: 'test-user-id',
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    phone: '+237677123456',
    role: 'client',
    isEmailVerified: true,
    isPhoneVerified: true,
    region: 'centre',
    city: 'yaounde',
  },

  // Mock product data
  mockProduct: {
    id: 'test-product-id',
    title: 'Test Product',
    description: 'This is a test product',
    price: 50000,
    category: 'electronics',
    condition: 'new',
    images: ['https://example.com/image1.jpg'],
    location: 'Yaoundé',
    views: 100,
    sellerId: 'test-user-id',
    createdAt: new Date().toISOString(),
  },

  // Mock order data
  mockOrder: {
    id: 'test-order-id',
    orderNumber: 'TEST-2024-001',
    customerId: 'test-user-id',
    sellerId: 'test-seller-id',
    status: 'pending',
    totalAmount: 50000,
    paymentMethod: 'campay',
    items: [
      {
        productId: 'test-product-id',
        title: 'Test Product',
        price: 50000,
        quantity: 1,
        image: 'https://example.com/image1.jpg',
      },
    ],
    createdAt: new Date().toISOString(),
  },

  // Mock analytics data
  mockAnalytics: {
    overview: {
      totalUsers: 1250,
      activeUsers: 890,
      totalProducts: 4523,
      totalOrders: 2341,
      revenue: 125000000,
      commission: 12500000,
    },
    userMetrics: {
      newUsers: [120, 180, 240, 190, 280, 320, 250],
      activeUsers: [2400, 2210, 2290, 2800, 3200, 3100, 3400],
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    },
  },

  // Create mock fetch response
  createMockResponse: (data, status = 200) => {
    return Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(data),
      text: () => Promise.resolve(JSON.stringify(data)),
    });
  },

  // Setup mock fetch for success
  mockFetchSuccess: (data) => {
    global.fetch = jest.fn().mockResolvedValueOnce(
      global.testUtils.createMockResponse({
        success: true,
        data,
        message: 'Operation successful',
      })
    );
  },

  // Setup mock fetch for error
  mockFetchError: (message = 'An error occurred', status = 400) => {
    global.fetch = jest.fn().mockResolvedValueOnce(
      global.testUtils.createMockResponse({
        success: false,
        message,
        errors: [message],
      }, status)
    );
  },

  // Wait for async operations
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  // Generate random test data
  randomString: (length = 10) => {
    return Math.random().toString(36).substring(2, 2 + length);
  },

  randomEmail: () => {
    return `test_${global.testUtils.randomString()}@example.com`;
  },

  randomPhone: () => {
    const numbers = Math.floor(Math.random() * 900000000) + 100000000;
    return `+237${numbers}`;
  },

  // Mock navigation
  mockNavigation: {
    navigate: jest.fn(),
    goBack: jest.fn(),
    reset: jest.fn(),
    setOptions: jest.fn(),
  },

  // Mock route
  mockRoute: {
    params: {},
  },

  // Mock image picker response
  mockImagePickerResponse: {
    assets: [
      {
        uri: 'file:///path/to/image.jpg',
        type: 'image/jpeg',
        fileName: 'image.jpg',
        fileSize: 1024,
        width: 800,
        height: 600,
      },
    ],
  },
};

// Mock global fetch
global.fetch = jest.fn();

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
  mockAsyncStorage.clear();
});

// Set test timeout
jest.setTimeout(10000);

// Silence console warnings in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};