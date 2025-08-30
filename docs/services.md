# Kamer Vide Grenier Mobile App - Services Documentation

## 🔧 Services Directory (`src/services/`)

The services directory contains all business logic, API integrations, and external service communications. Services are organized by functionality and follow clean architecture principles.

---

## 🌐 API Service (`api.ts`)

**Purpose**: Base API configuration and HTTP client setup
**Key Features**:
- Axios instance configuration
- Request/response interceptors
- Error handling
- Authentication headers
- Base URL management

### Configuration
```typescript
// API base configuration
const api = axios.create({
  baseURL: Config.API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = await getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      logoutUser();
    }
    return Promise.reject(error);
  }
);
```

### Methods
- `GET /api/v1/*` - Data retrieval
- `POST /api/v1/*` - Data creation
- `PUT /api/v1/*` - Data updates
- `DELETE /api/v1/*` - Data deletion

---

## 🔐 Authentication Service (`authService.ts`)

**Purpose**: Handle user authentication and session management
**Key Features**:
- JWT token management
- Biometric authentication
- User registration/login
- Password reset
- Session persistence

### Core Functions

#### `login(credentials: LoginCredentials)`
```typescript
interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

const login = async (credentials: LoginCredentials): Promise<User> => {
  try {
    const response = await api.post('/auth/login', credentials);
    const { user, token } = response.data;

    // Store authentication data
    await storeAuthData(token, user);

    return user;
  } catch (error) {
    throw new Error('Login failed');
  }
};
```

#### `register(userData: RegisterData)`
```typescript
interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

const register = async (userData: RegisterData): Promise<User> => {
  const response = await api.post('/auth/register', userData);
  return response.data.user;
};
```

#### `setupBiometric()`
- Check device biometric capabilities
- Configure biometric authentication
- Store biometric preferences

#### `refreshToken()`
- Refresh expired JWT tokens
- Handle token refresh failures
- Update stored authentication data

---

## 💳 Payment Service (`paymentService.ts`)

**Purpose**: Handle payment processing and multiple payment gateways
**Key Features**:
- Multiple payment gateway integration
- Transaction processing
- Payment validation
- Receipt generation

### Supported Payment Methods
1. **Mobile Money** (MTN Mobile Money, Orange Money)
2. **Bank Transfer** (Direct bank transfers)
3. **Cash on Delivery** (Pay upon delivery)
4. **Credit/Debit Cards** (Stripe integration)
5. **Cryptocurrency** (Future implementation)

### Core Functions

#### `processPayment(paymentData: PaymentData)`
```typescript
interface PaymentData {
  amount: number;
  currency: string;
  method: PaymentMethod;
  orderId: string;
  customerInfo: CustomerInfo;
}

const processPayment = async (paymentData: PaymentData): Promise<PaymentResult> => {
  switch (paymentData.method) {
    case 'mobile_money':
      return await processMobileMoneyPayment(paymentData);
    case 'stripe':
      return await processStripePayment(paymentData);
    case 'bank_transfer':
      return await processBankTransfer(paymentData);
    default:
      throw new Error('Unsupported payment method');
  }
};
```

#### `validatePayment(transactionId: string)`
- Verify payment status
- Check transaction integrity
- Handle payment confirmations

#### `generateReceipt(payment: Payment)`
- Create payment receipt
- Format receipt data
- Send receipt via email/SMS

---

## 📦 Product Service (`productService.ts`)

**Purpose**: Manage product CRUD operations and inventory
**Key Features**:
- Product creation and management
- Image upload and optimization
- Product search and filtering
- Category management
- Inventory tracking

### Core Functions

#### `createProduct(productData: ProductData)`
```typescript
interface ProductData {
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  images: string[];
  stock: number;
  location: Location;
}

const createProduct = async (productData: ProductData): Promise<Product> => {
  // Upload images first
  const uploadedImages = await uploadProductImages(productData.images);

  // Create product with image URLs
  const product = {
    ...productData,
    images: uploadedImages,
  };

  const response = await api.post('/products', product);
  return response.data;
};
```

#### `searchProducts(filters: ProductFilters)`
```typescript
interface ProductFilters {
  query?: string;
  category?: string;
  priceRange?: PriceRange;
  location?: Location;
  sortBy?: SortOption;
}

const searchProducts = async (filters: ProductFilters): Promise<Product[]> => {
  const params = buildSearchParams(filters);
  const response = await api.get('/products/search', { params });
  return response.data.products;
};
```

#### `updateProductStock(productId: string, stock: number)`
- Update product inventory
- Handle stock reservations
- Send low stock notifications

#### `uploadProductImages(images: string[])`
- Upload to Cloudinary
- Image optimization
- Generate thumbnails
- Return secure URLs

---

## 🛒 Order Service (`orderService.ts`)

**Purpose**: Handle order creation, management, and tracking
**Key Features**:
- Order lifecycle management
- Order status updates
- Order history
- Order cancellation
- Order notifications

### Order States
```
PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
    ↓        ↓          ↓          ↓          ↓
 CANCELLED  CANCELLED  CANCELLED  CANCELLED  COMPLETED
```

### Core Functions

#### `createOrder(orderData: OrderData)`
```typescript
interface OrderData {
  items: OrderItem[];
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
  deliveryInstructions?: string;
}

const createOrder = async (orderData: OrderData): Promise<Order> => {
  // Validate order data
  await validateOrderData(orderData);

  // Process payment
  const payment = await paymentService.processPayment({
    amount: calculateTotal(orderData.items),
    method: orderData.paymentMethod,
    orderId: 'temp',
  });

  // Create order
  const order = {
    ...orderData,
    paymentId: payment.id,
    status: 'PENDING',
  };

  const response = await api.post('/orders', order);
  return response.data;
};
```

#### `updateOrderStatus(orderId: string, status: OrderStatus)`
- Update order status
- Send status notifications
- Trigger delivery assignment
- Update inventory

#### `getOrderHistory(userId: string)`
- Retrieve user order history
- Apply pagination
- Include order details

#### `cancelOrder(orderId: string, reason: string)`
- Validate cancellation eligibility
- Process refunds if applicable
- Update order status
- Send cancellation notifications

---

## 🚚 Delivery Service (`deliveryService.ts`)

**Purpose**: Manage delivery operations and tracking
**Key Features**:
- Delivery assignment
- GPS tracking
- Real-time updates
- Delivery history
- Proof of delivery

### Core Functions

#### `assignDelivery(orderId: string, agentId: string)`
```typescript
const assignDelivery = async (orderId: string, agentId: string): Promise<Delivery> => {
  const delivery = {
    orderId,
    agentId,
    status: 'ASSIGNED',
    assignedAt: new Date(),
  };

  const response = await api.post('/deliveries', delivery);
  return response.data;
};
```

#### `updateDeliveryLocation(deliveryId: string, location: Location)`
- Update GPS coordinates
- Calculate ETA
- Send location updates to customer
- Store location history

#### `updateDeliveryStatus(deliveryId: string, status: DeliveryStatus)`
- Update delivery status
- Send notifications
- Handle status transitions
- Log status changes

#### `getDeliveryTracking(deliveryId: string)`
- Retrieve delivery details
- Get real-time location
- Calculate delivery progress
- Provide ETA updates

---

## 💬 Chat Service (`chatService.ts`)

**Purpose**: Handle real-time messaging functionality
**Key Features**:
- Real-time messaging with Socket.io
- Message history
- File sharing
- Typing indicators
- Message status tracking

### Core Functions

#### `sendMessage(message: MessageData)`
```typescript
interface MessageData {
  conversationId: string;
  content: string;
  type: 'text' | 'image' | 'file';
  fileUrl?: string;
}

const sendMessage = async (message: MessageData): Promise<Message> => {
  // Send via Socket.io for real-time delivery
  socket.emit('sendMessage', message);

  // Also store in database
  const response = await api.post('/messages', message);
  return response.data;
};
```

#### `getConversationHistory(conversationId: string)`
- Retrieve message history
- Apply pagination
- Include message metadata

#### `markMessagesAsRead(conversationId: string)`
- Update message read status
- Send read receipts
- Update conversation preview

#### `uploadFile(file: File)`
- Upload file to storage
- Generate secure URL
- Create file message
- Handle upload progress

---

## 🔔 Notification Service (`notificationService.ts`)

**Purpose**: Manage push notifications and in-app notifications
**Key Features**:
- Push notification setup
- Device token management
- Notification scheduling
- Notification preferences
- Notification history

### Core Functions

#### `registerDeviceToken(token: string)`
```typescript
const registerDeviceToken = async (token: string): Promise<void> => {
  await api.post('/notifications/register-token', {
    token,
    platform: Platform.OS,
  });
};
```

#### `sendNotification(notification: NotificationData)`
```typescript
interface NotificationData {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  data?: any;
}

const sendNotification = async (notification: NotificationData): Promise<void> => {
  await api.post('/notifications/send', notification);
};
```

#### `scheduleNotification(notification: ScheduledNotification)`
- Schedule future notifications
- Handle recurring notifications
- Manage notification queue

#### `updateNotificationPreferences(preferences: NotificationPreferences)`
- Update user preferences
- Enable/disable notification types
- Set quiet hours

---

## 📱 Offline Service (`offlineService.ts`)

**Purpose**: Handle offline functionality and data synchronization
**Key Features**:
- SQLite database management
- Data synchronization
- Conflict resolution
- Offline queue management
- Network status monitoring

### Core Functions

#### `initializeOfflineDatabase()`
```typescript
const initializeOfflineDatabase = async (): Promise<void> => {
  // Create SQLite tables
  await createTables();

  // Set up sync listeners
  setupSyncListeners();
};
```

#### `saveOfflineData(table: string, data: any)`
- Store data locally
- Mark as pending sync
- Handle data conflicts

#### `syncOfflineData()`
- Sync pending changes
- Resolve conflicts
- Update local data
- Handle sync failures

#### `getOfflineData(table: string, query?: any)`
- Retrieve local data
- Apply filters
- Return cached results

---

## 💾 Storage Service (`storageService.ts`)

**Purpose**: Handle local storage operations
**Key Features**:
- AsyncStorage management
- Data encryption/decryption
- Cache management
- Storage quota monitoring
- Data migration

### Core Functions

#### `storeData(key: string, value: any)`
```typescript
const storeData = async (key: string, value: any): Promise<void> => {
  try {
    const encryptedValue = await encryptData(JSON.stringify(value));
    await AsyncStorage.setItem(key, encryptedValue);
  } catch (error) {
    throw new Error('Storage operation failed');
  }
};
```

#### `getData(key: string)`
- Retrieve stored data
- Decrypt data
- Parse JSON
- Handle missing data

#### `clearStorage()`
- Clear all stored data
- Reset app state
- Handle logout scenarios

#### `getStorageSize()`
- Calculate storage usage
- Monitor quota limits
- Provide cleanup suggestions

---

## 📍 Location Service (`locationService.ts`)

**Purpose**: Handle GPS and location services
**Key Features**:
- GPS location tracking
- Geofencing
- Address resolution
- Location permissions
- Background location updates

### Core Functions

#### `getCurrentLocation()`
```typescript
const getCurrentLocation = async (): Promise<Location> => {
  const { status } = await requestLocationPermission();

  if (status !== 'granted') {
    throw new Error('Location permission denied');
  }

  const location = await getCurrentPositionAsync({
    accuracy: LocationAccuracy.High,
  });

  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    accuracy: location.coords.accuracy,
  };
};
```

#### `watchLocation(callback: (location: Location) => void)`
- Continuous location monitoring
- Background location updates
- Battery optimization
- Accuracy settings

#### `geocodeAddress(address: string)`
- Convert address to coordinates
- Handle geocoding errors
- Provide address suggestions

#### `calculateDistance(point1: Location, point2: Location)`
- Calculate distance between points
- Support different units
- Handle edge cases

---

## 🖼️ Image Service (`imageService.ts`)

**Purpose**: Handle image operations and Cloudinary integration
**Key Features**:
- Image upload and optimization
- Image compression
- Format conversion
- Cloud storage management
- Image caching

### Core Functions

#### `uploadImage(imageUri: string, options?: UploadOptions)`
```typescript
interface UploadOptions {
  quality?: number;
  format?: 'jpg' | 'png' | 'webp';
  resize?: { width: number; height: number };
}

const uploadImage = async (imageUri: string, options?: UploadOptions): Promise<string> => {
  // Compress image
  const compressedImage = await compressImage(imageUri, options);

  // Upload to Cloudinary
  const formData = new FormData();
  formData.append('file', compressedImage);
  formData.append('upload_preset', Config.CLOUDINARY_PRESET);

  const response = await fetch(Config.CLOUDINARY_URL, {
    method: 'POST',
    body: formData,
  });

  const result = await response.json();
  return result.secure_url;
};
```

#### `compressImage(imageUri: string, options: CompressOptions)`
- Reduce image file size
- Maintain image quality
- Support multiple formats

#### `generateThumbnail(imageUri: string, size: number)`
- Create image thumbnails
- Maintain aspect ratio
- Optimize for different screen sizes

#### `deleteImage(publicId: string)`
- Remove images from Cloudinary
- Clean up unused images
- Handle deletion errors

---

## 📊 Analytics Service (`analyticsService.ts`)

**Purpose**: Track user behavior and app analytics
**Key Features**:
- Event tracking
- User behavior analysis
- Performance monitoring
- Crash reporting
- Custom analytics events

### Core Functions

#### `trackEvent(eventName: string, parameters?: any)`
```typescript
const trackEvent = async (eventName: string, parameters?: any): Promise<void> => {
  // Track with analytics service
  await analytics().logEvent(eventName, parameters);

  // Also send to custom analytics endpoint
  await api.post('/analytics/track', {
    event: eventName,
    parameters,
    timestamp: new Date(),
    userId: getCurrentUserId(),
  });
};
```

#### `trackScreen(screenName: string)`
- Track screen views
- Measure screen time
- Analyze user flow

#### `trackPurchase(purchaseData: PurchaseData)`
- Track purchase events
- Calculate revenue metrics
- Monitor conversion rates

#### `trackError(error: Error, context?: any)`
- Track application errors
- Send crash reports
- Monitor error rates

---

## 🔧 Service Architecture Patterns

### 1. Error Handling
```typescript
try {
  const result = await apiCall();
  return result;
} catch (error) {
  // Log error
  console.error('Service error:', error);

  // Handle specific error types
  if (error.response?.status === 401) {
    await handleUnauthorized();
  }

  // Re-throw with user-friendly message
  throw new Error(getErrorMessage(error));
}
```

### 2. Caching Strategy
```typescript
const getCachedData = async (key: string, fetcher: () => Promise<any>) => {
  // Check cache first
  const cached = await getFromCache(key);
  if (cached && !isExpired(cached)) {
    return cached.data;
  }

  // Fetch fresh data
  const data = await fetcher();

  // Cache the result
  await setCache(key, data);

  return data;
};
```

### 3. Retry Logic
```typescript
const withRetry = async (operation: () => Promise<any>, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;

      // Exponential backoff
      await delay(Math.pow(2, i) * 1000);
    }
  }
};
```

### 4. Request Cancellation
```typescript
const cancellableRequest = () => {
  const cancelToken = axios.CancelToken.source();

  const request = api.get('/data', {
    cancelToken: cancelToken.token,
  });

  return {
    request,
    cancel: () => cancelToken.cancel('Request cancelled'),
  };
};
```

---

## 🔒 Security Considerations

### Authentication
- JWT token validation
- Secure token storage
- Automatic token refresh
- Session timeout handling

### Data Protection
- API request encryption
- Sensitive data encryption
- Secure local storage
- Data sanitization

### Network Security
- Certificate pinning
- Request signing
- Rate limiting
- DDoS protection

### Privacy
- Data minimization
- User consent management
- GDPR compliance
- Data retention policies

---

## 📈 Performance Optimization

### Caching
- Implement intelligent caching
- Cache invalidation strategies
- Memory management
- Cache size limits

### Network
- Request compression
- Response caching
- Connection pooling
- Timeout management

### Database
- Query optimization
- Index management
- Connection pooling
- Data pagination

### Monitoring
- Performance metrics
- Error tracking
- Usage analytics
- Resource monitoring

This comprehensive services documentation covers all the business logic and external integrations in the Kamer Vide Grenier mobile app, providing detailed information about each service's purpose, functionality, and implementation patterns.
