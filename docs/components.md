# Kamer Vide Grenier Mobile App - Components Documentation

## 🧩 Components Directory (`src/components/`)

This directory contains all reusable UI components organized by feature and functionality. The components are built using React Native Paper for consistent design and TypeScript for type safety.

---

## 📊 Analytics Components (`analytics/`)

Components for displaying analytics and dashboard data.

### SalesChart.tsx
**Purpose**: Visual representation of sales performance over time
**Props**:
```typescript
interface SalesChartProps {
  data: SalesData[];
  period: 'daily' | 'weekly' | 'monthly';
  showLegend?: boolean;
}
```
**Features**:
- Interactive chart with touch gestures
- Multiple chart types (line, bar, area)
- Date range filtering
- Export functionality

### UserStatsCard.tsx
**Purpose**: Display user statistics in card format
**Props**:
```typescript
interface UserStatsCardProps {
  title: string;
  value: number;
  change: number;
  icon: string;
  trend: 'up' | 'down' | 'neutral';
}
```
**Features**:
- Trend indicators with icons
- Percentage change display
- Color-coded trends
- Responsive design

### RevenueChart.tsx
**Purpose**: Revenue analytics visualization
**Props**:
```typescript
interface RevenueChartProps {
  data: RevenueData[];
  currency: string;
  groupBy: 'day' | 'week' | 'month';
}
```
**Features**:
- Multi-currency support
- Time period grouping
- Revenue breakdown by category
- Comparison with previous periods

### ProductPerformance.tsx
**Purpose**: Product performance metrics display
**Props**:
```typescript
interface ProductPerformanceProps {
  productId: string;
  metrics: ProductMetrics;
}
```
**Features**:
- Sales volume tracking
- View count analytics
- Conversion rate display
- Performance comparison

---

## 🔐 Authentication Components (`auth/`)

Components related to user authentication and account management.

### LoginForm.tsx
**Purpose**: User login interface
**Props**:
```typescript
interface LoginFormProps {
  onLogin: (credentials: LoginCredentials) => void;
  isLoading?: boolean;
  error?: string;
}
```
**Features**:
- Email/password validation
- Remember me functionality
- Social login options
- Biometric authentication prompt

### RegisterForm.tsx
**Purpose**: User registration form
**Props**:
```typescript
interface RegisterFormProps {
  onRegister: (userData: RegisterData) => void;
  isLoading?: boolean;
  error?: string;
}
```
**Features**:
- Multi-step registration
- Form validation
- Terms and conditions
- Email verification

### BiometricPrompt.tsx
**Purpose**: Biometric authentication interface
**Props**:
```typescript
interface BiometricPromptProps {
  onSuccess: () => void;
  onFailure: (error: string) => void;
  promptMessage: string;
}
```
**Features**:
- Fingerprint/Face ID support
- Fallback to PIN/password
- Device capability detection
- Error handling

### ForgotPassword.tsx
**Purpose**: Password recovery interface
**Props**:
```typescript
interface ForgotPasswordProps {
  onReset: (email: string) => void;
  isLoading?: boolean;
}
```
**Features**:
- Email validation
- Reset link sending
- Success/error feedback
- Back to login option

---

## 💬 Chat Components (`chat/`)

Components for real-time messaging functionality.

### ChatList.tsx
**Purpose**: Display list of conversations
**Props**:
```typescript
interface ChatListProps {
  conversations: Conversation[];
  onSelectConversation: (id: string) => void;
  currentUserId: string;
}
```
**Features**:
- Conversation preview
- Unread message indicators
- Last message timestamp
- Online status display

### ChatBubble.tsx
**Purpose**: Individual message display
**Props**:
```typescript
interface ChatBubbleProps {
  message: Message;
  isOwn: boolean;
  showTimestamp?: boolean;
}
```
**Features**:
- Message status indicators
- Timestamp display
- Message reactions
- Long press menu

### MessageInput.tsx
**Purpose**: Message composition interface
**Props**:
```typescript
interface MessageInputProps {
  onSend: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
}
```
**Features**:
- Text input with auto-resize
- Send button with state
- Attachment support
- Typing indicators

### TypingIndicator.tsx
**Purpose**: Show typing status
**Props**:
```typescript
interface TypingIndicatorProps {
  users: string[];
  isTyping: boolean;
}
```
**Features**:
- Multiple user typing
- Animated indicators
- Customizable messages

---

## 🔧 Common Components (`common/`)

Shared components used across the application.

### Header.tsx
**Purpose**: Application header with navigation
**Props**:
```typescript
interface HeaderProps {
  title: string;
  showBack?: boolean;
  showMenu?: boolean;
  rightActions?: ReactNode[];
}
```
**Features**:
- Back navigation
- Menu toggle
- Custom right actions
- Search integration

### Footer.tsx
**Purpose**: Application footer
**Props**:
```typescript
interface FooterProps {
  activeTab: string;
  onTabPress: (tab: string) => void;
}
```
**Features**:
- Tab navigation
- Active state indication
- Customizable tabs

### LoadingSpinner.tsx
**Purpose**: Loading state indicator
**Props**:
```typescript
interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  message?: string;
}
```
**Features**:
- Multiple sizes
- Custom colors
- Optional loading message
- Centered positioning

### ErrorBoundary.tsx
**Purpose**: Error handling wrapper
**Props**:
```typescript
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}
```
**Features**:
- Error catching
- Fallback UI
- Error reporting
- Recovery options

### Modal.tsx
**Purpose**: Modal dialog container
**Props**:
```typescript
interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}
```
**Features**:
- Backdrop blur
- Swipe to dismiss
- Custom animations
- Accessibility support

---

## 🚚 Delivery Components (`delivery/`)

Components for delivery tracking and management.

### TrackingMap.tsx
**Purpose**: GPS tracking visualization
**Props**:
```typescript
interface TrackingMapProps {
  deliveryId: string;
  currentLocation: Location;
  destination: Location;
  route?: Location[];
}
```
**Features**:
- Real-time location updates
- Route visualization
- ETA calculation
- Interactive map

### DeliveryStatus.tsx
**Purpose**: Delivery status indicators
**Props**:
```typescript
interface DeliveryStatusProps {
  status: DeliveryStatus;
  estimatedTime?: Date;
  currentStep: number;
}
```
**Features**:
- Status progression
- Time estimates
- Visual indicators
- Status descriptions

### DeliveryCard.tsx
**Purpose**: Delivery information card
**Props**:
```typescript
interface DeliveryCardProps {
  delivery: Delivery;
  onPress?: () => void;
  showDetails?: boolean;
}
```
**Features**:
- Delivery summary
- Status display
- Customer information
- Action buttons

### ProofOfDelivery.tsx
**Purpose**: Delivery confirmation interface
**Props**:
```typescript
interface ProofOfDeliveryProps {
  deliveryId: string;
  onConfirm: (photo: string, signature?: string) => void;
}
```
**Features**:
- Photo capture
- Signature pad
- GPS verification
- Customer confirmation

---

## 📦 Product Components (`products/`)

Components for product display and management.

### ProductCard.tsx
**Purpose**: Product display card
**Props**:
```typescript
interface ProductCardProps {
  product: Product;
  onPress?: () => void;
  showActions?: boolean;
}
```
**Features**:
- Product image display
- Price formatting
- Rating display
- Quick actions

### ProductGrid.tsx
**Purpose**: Product listing grid
**Props**:
```typescript
interface ProductGridProps {
  products: Product[];
  onProductPress: (product: Product) => void;
  loading?: boolean;
}
```
**Features**:
- Grid/List view toggle
- Infinite scroll
- Loading states
- Empty state handling

### ProductDetails.tsx
**Purpose**: Detailed product view
**Props**:
```typescript
interface ProductDetailsProps {
  product: Product;
  onAddToCart?: () => void;
  onContactSeller?: () => void;
}
```
**Features**:
- Image gallery
- Product specifications
- Seller information
- Social sharing

### ProductFilters.tsx
**Purpose**: Product search and filtering
**Props**:
```typescript
interface ProductFiltersProps {
  filters: ProductFilters;
  onFiltersChange: (filters: ProductFilters) => void;
}
```
**Features**:
- Category filtering
- Price range slider
- Location filtering
- Sort options

### AddProductForm.tsx
**Purpose**: Product creation form
**Props**:
```typescript
interface AddProductFormProps {
  onSubmit: (product: ProductData) => void;
  initialData?: Partial<ProductData>;
}
```
**Features**:
- Multi-step form
- Image upload
- Category selection
- Form validation

---

## 🎨 UI Components (`ui/`)

Base UI components for consistent design.

### Button.tsx
**Purpose**: Custom button component
**Props**:
```typescript
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
}
```
**Features**:
- Multiple variants
- Loading states
- Accessibility support
- Custom styling

### Input.tsx
**Purpose**: Text input field
**Props**:
```typescript
interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  type?: 'text' | 'email' | 'password' | 'number';
}
```
**Features**:
- Input validation
- Error display
- Icon support
- Secure text entry

### Card.tsx
**Purpose**: Card container component
**Props**:
```typescript
interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  elevation?: number;
  style?: ViewStyle;
}
```
**Features**:
- Elevation shadows
- Press handling
- Custom styling
- Content padding

### Badge.tsx
**Purpose**: Status badge component
**Props**:
```typescript
interface BadgeProps {
  text: string;
  variant?: 'success' | 'warning' | 'error' | 'info';
  size?: 'small' | 'medium';
}
```
**Features**:
- Color variants
- Size options
- Icon support
- Accessibility

### Avatar.tsx
**Purpose**: User avatar component
**Props**:
```typescript
interface AvatarProps {
  source?: ImageSourcePropType;
  name?: string;
  size?: number;
  online?: boolean;
}
```
**Features**:
- Image or initials display
- Online status indicator
- Size customization
- Press handling

---

## 👥 Role-Specific Components (`specific/`)

Components specific to user roles.

### AdminPanel.tsx
**Purpose**: Admin control panel
**Props**:
```typescript
interface AdminPanelProps {
  user: User;
  permissions: Permission[];
}
```
**Features**:
- Role-based access
- Admin actions
- System controls
- Audit logging

### SellerDashboard.tsx
**Purpose**: Seller management interface
**Props**:
```typescript
interface SellerDashboardProps {
  seller: Seller;
  stats: SellerStats;
}
```
**Features**:
- Sales overview
- Product management
- Order tracking
- Analytics display

### ClientProfile.tsx
**Purpose**: Client profile components
**Props**:
```typescript
interface ClientProfileProps {
  user: User;
  onEdit?: () => void;
}
```
**Features**:
- Profile display
- Edit functionality
- Preferences management
- Account settings

### DeliveryAgentCard.tsx
**Purpose**: Delivery agent information
**Props**:
```typescript
interface DeliveryAgentCardProps {
  agent: DeliveryAgent;
  rating: number;
  onContact?: () => void;
}
```
**Features**:
- Agent details
- Rating display
- Contact options
- Availability status

---

## 📋 Component Usage Guidelines

### 1. Component Structure
```typescript
// Component file structure
import React from 'react';
import { View, Text } from 'react-native';
import { styles } from './styles';

interface ComponentNameProps {
  // Props definition
}

const ComponentName: React.FC<ComponentNameProps> = ({
  // Props destructuring
}) => {
  // Component logic

  return (
    // JSX return
  );
};

export default ComponentName;
```

### 2. Props Interface
- Use TypeScript interfaces for all props
- Make optional props clear with `?`
- Use union types for limited options
- Document complex prop types

### 3. Styling
- Use StyleSheet for consistent styling
- Follow theme guidelines
- Use responsive design principles
- Avoid inline styles

### 4. State Management
- Use local state for component-specific data
- Use Redux for global state
- Implement proper state updates
- Handle loading and error states

### 5. Performance
- Use React.memo for expensive components
- Implement proper key props for lists
- Optimize image loading
- Use FlatList for large lists

### 6. Accessibility
- Add accessibility labels
- Support screen readers
- Handle keyboard navigation
- Provide focus management

### 7. Testing
- Write unit tests for components
- Test user interactions
- Mock external dependencies
- Test error states

---

## 🔧 Component Development Best Practices

### Naming Conventions
- Use PascalCase for component names
- Use camelCase for props and functions
- Use descriptive names
- Follow React naming conventions

### File Organization
- One component per file
- Separate styles file
- Group related components
- Use index files for exports

### Error Handling
- Implement error boundaries
- Handle network errors gracefully
- Provide user-friendly error messages
- Log errors for debugging

### Internationalization
- Use i18n for text content
- Support RTL languages
- Format dates and numbers properly
- Handle pluralization

This documentation covers all major components in the Kamer Vide Grenier mobile app, providing detailed information about their purpose, props, features, and usage guidelines.
