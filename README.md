# Kamer Vide Grenier Mobile App

A comprehensive React Native marketplace application designed specifically for Cameroon, built with modern technologies and best practices.

## 📱 Overview

Kamer Vide Grenier is a feature-rich mobile marketplace application that connects buyers and sellers in Cameroon. The app supports multiple user roles (visitors, clients, sellers, delivery agents, and admins) with a complete e-commerce workflow including product listings, payments, delivery tracking, and real-time notifications.

## 🏗️ Architecture

### Technology Stack

- **Framework**: React Native 0.81.0
- **Language**: TypeScript
- **State Management**: Redux Toolkit
- **Navigation**: React Navigation v7
- **UI Components**: React Native Paper
- **Networking**: Axios with interceptors
- **Database**: SQLite (offline support)
- **Authentication**: JWT with biometric support
- **Real-time**: Socket.io
- **Payments**: Multiple gateways (Stripe, Noupia, Campay)
- **Image Handling**: Cloudinary integration

### Key Features

- 🔐 **Multi-role Authentication**: Support for 5 user roles
- 💳 **Multiple Payment Methods**: Mobile money, bank transfers, cash on delivery
- 🚚 **Delivery Tracking**: Real-time delivery status updates
- 📱 **Offline Support**: SQLite database for offline functionality
- 🔒 **Biometric Authentication**: Fingerprint/Face ID support
- 🌍 **Multi-language**: French and English support
- 🔔 **Push Notifications**: Real-time notifications
- 📊 **Analytics Dashboard**: Comprehensive analytics for admins
- 🛒 **Shopping Cart**: Persistent cart with local storage
- ⭐ **Reviews & Ratings**: Product and seller reviews
- 💬 **Real-time Chat**: In-app messaging system

## 📁 Project Structure

```
videgrinier-mobile/
├── android/                    # Android native code
├── ios/                       # iOS native code
├── src/
│   ├── assets/                # Static assets (images, fonts, etc.)
│   ├── components/            # Reusable UI components
│   │   ├── analytics/         # Analytics and charts components
│   │   ├── auth/             # Authentication components
│   │   ├── chat/             # Chat/messaging components
│   │   ├── common/           # Common/shared components
│   │   ├── delivery/         # Delivery tracking components
│   │   ├── products/         # Product-related components
│   │   ├── ui/               # Base UI components
│   │   └── specific/         # Role-specific components
│   ├── hooks/                # Custom React hooks
│   ├── models/               # TypeScript interfaces and types
│   ├── navigation/           # Navigation configuration
│   │   ├── tabs/             # Tab navigators
│   │   └── types.ts          # Navigation type definitions
│   ├── screens/              # Screen components by role
│   │   ├── admin/            # Admin dashboard screens
│   │   ├── auth/             # Authentication screens
│   │   ├── client/           # Client/user screens
│   │   ├── delivery/         # Delivery agent screens
│   │   ├── home/             # Home screen
│   │   ├── orders/           # Order management screens
│   │   ├── profile/          # Profile management screens
│   │   └── seller/           # Seller screens
│   ├── services/             # Business logic and API services
│   ├── store/                # Redux store configuration
│   │   └── slices/           # Redux slices
│   ├── theme/                # Theme configuration
│   ├── types/                # Additional type definitions
│   ├── utils/                # Utility functions
│   └── viewmodels/           # View models (MVVM pattern)
├── __tests__/                # Test files
└── docs/                     # Documentation
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd videgrinier-mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install iOS dependencies** (macOS only)
   ```bash
   cd ios && pod install && cd ..
   ```

4. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Start Metro bundler**
   ```bash
   npm start
   ```

6. **Run on Android**
   ```bash
   npm run android
   ```

7. **Run on iOS** (macOS only)
   ```bash
   npm run ios
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
API_BASE_URL=https://api.kamervidegrenier.com
CLOUDINARY_CLOUD_NAME=your_cloud_name
STRIPE_PUBLISHABLE_KEY=pk_test_...
NOUPIA_API_KEY=your_noupia_key
CAMPAY_API_KEY=your_campay_key
SOCKET_URL=https://socket.kamervidegrenier.com
```

### Android Configuration

1. **SDK Setup**: Ensure Android SDK is properly configured
2. **Emulator**: Create an Android Virtual Device (AVD)
3. **ADB**: Ensure Android Debug Bridge is in PATH

### iOS Configuration

1. **Xcode**: Install latest Xcode version
2. **Cocoapods**: Install CocoaPods dependencies
3. **Simulator**: Configure iOS Simulator

## 📱 User Roles & Features

### 1. Visitor (Anonymous User)
- Browse products
- View product details
- Search products
- View seller profiles
- Basic app functionality

### 2. Client (Registered User)
- All visitor features
- Create account
- Add to cart/wishlist
- Place orders
- Make payments
- Rate and review products
- Real-time chat with sellers
- Order tracking
- Wallet management

### 3. Seller
- All client features
- Create and manage products
- Manage inventory
- View sales analytics
- Respond to customer inquiries
- Manage orders
- Receive payments

### 4. Delivery Agent
- View assigned deliveries
- Update delivery status
- Real-time GPS tracking
- Customer communication
- Delivery history
- Earnings tracking

### 5. Admin
- Complete system access
- User management
- Product moderation
- Order management
- Analytics dashboard
- System configuration
- Payment gateway management

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Biometric Authentication**: Fingerprint/Face ID support
- **Encrypted Storage**: Sensitive data encryption
- **Certificate Pinning**: API security
- **Offline Data Security**: Encrypted local database
- **Session Management**: Automatic session handling

## 💳 Payment Integration

### Supported Payment Methods
- **Mobile Money**: MTN Mobile Money, Orange Money
- **Bank Transfer**: Direct bank transfers
- **Cash on Delivery**: Pay upon delivery
- **Credit/Debit Cards**: Stripe integration
- **Cryptocurrency**: Future implementation

### Payment Flow
1. Order creation
2. Payment method selection
3. Payment processing
4. Confirmation and receipt
5. Order status updates

## 🚚 Delivery System

### Features
- **Real-time Tracking**: GPS-based delivery tracking
- **Status Updates**: Automated status notifications
- **Customer Communication**: In-app messaging
- **Proof of Delivery**: Photo verification
- **Delivery Analytics**: Performance metrics

### Delivery States
- Assigned
- Picked up
- In transit
- Delivered
- Cancelled/Failed

## 📊 Analytics & Reporting

### Admin Dashboard
- Sales analytics
- User statistics
- Product performance
- Revenue reports
- Delivery metrics
- Customer insights

### Seller Dashboard
- Sales performance
- Product analytics
- Customer reviews
- Inventory reports
- Earnings tracking

## 🧪 Testing

### Test Structure
```
__tests__/
├── components/          # Component tests
├── screens/            # Screen tests
├── services/           # Service tests
├── hooks/              # Hook tests
└── utils/              # Utility tests
```

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 🚀 Deployment

### Android Build
```bash
# Generate release APK
cd android && ./gradlew assembleRelease

# Generate AAB (Android App Bundle)
cd android && ./gradlew bundleRelease
```

### iOS Build
```bash
# Archive for App Store
cd ios && xcodebuild archive -scheme KamerVideGrenierApp
```

## 📚 Documentation

- [API Documentation](./docs/api.md)
- [Component Library](./docs/components.md)
- [Navigation Guide](./docs/navigation.md)
- [State Management](./docs/redux.md)
- [Testing Guide](./docs/testing.md)
- [Deployment Guide](./docs/deployment.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Email: support@kamervidegrenier.com
- Documentation: [docs.kamervidegrenier.com](https://docs.kamervidegrenier.com)
- Issues: [GitHub Issues](https://github.com/kamer-vide-grenier/mobile/issues)

---

**Built with ❤️ for Cameroon** 🇨🇲

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
