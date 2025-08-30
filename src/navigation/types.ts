import { NavigatorScreenParams } from '@react-navigation/native';

// Auth Stack
export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
  VerifyEmail: { email: string };
  VerifyPhone: { phone: string };
  KYC: undefined;
};

// Main Tab Navigator
export type MainTabParamList = {
  HomeTab: undefined;
  SearchTab: undefined;
  SellTab: undefined;
  OrdersTab: undefined;
  ProfileTab: undefined;
};

// Home Stack
export type HomeStackParamList = {
  Home: undefined;
  ProductDetails: { productId: string };
  ProductList: { 
    title: string;
    category?: string;
    seller?: string;
    featured?: boolean;
  };
  CategoryList: undefined;
  CategoryProducts: { categoryId: string; categoryName: string };
  SellerProfile: { sellerId: string };
};

// Search Stack
export type SearchStackParamList = {
  Search: undefined;
  SearchResults: { query?: string; filters?: any };
  ProductFilter: undefined;
};

// Sell Stack
export type SellStackParamList = {
  MyProducts: undefined;
  CreateProduct: undefined;
  EditProduct: { product: any };
  ProductDetails: { productId: string };
  ProductPreview: { productData: any };
  ImageUpload: { productId?: string };
  CategorySelector: { onSelect: (category: any) => void };
};

// Orders Stack
export type OrdersStackParamList = {
  OrdersList: undefined;
  OrderDetails: { orderId: string };
  CreateOrder: { productId: string };
  CheckoutFlow: { cartItems: any[] };
  PaymentMethod: { orderId: string };
  OrderTracking: { orderId: string };
  SalesHistory: undefined;
  OrderChat: { orderId: string };
};

// Profile Stack
export type ProfileStackParamList = {
  Profile: undefined;
  Wallet: undefined;
  EditProfile: undefined;
  Settings: undefined;
  Notifications: undefined;
  Wishlist: undefined;
  Reviews: undefined;
  PaymentMethods: undefined;
  Addresses: undefined;
  HelpCenter: undefined;
  About: undefined;
  ChangePassword: undefined;
  Language: undefined;
  Privacy: undefined;
  Terms: undefined;
};

// Root Stack
export type RootStackParamList = {
  AuthStack: NavigatorScreenParams<AuthStackParamList>;
  MainStack: NavigatorScreenParams<MainTabParamList>;
  
  // Modal screens
  ImageViewer: { 
    images: string[]; 
    initialIndex?: number 
  };
  LocationPicker: { 
    onLocationSelect: (location: any) => void 
  };
  PaymentMethodModal: { 
    onMethodSelect: (method: any) => void 
  };
  ProductShare: { 
    productId: string 
  };
  OrderShare: { 
    orderId: string 
  };
  ReportProduct: { 
    productId: string 
  };
  ContactSeller: { 
    sellerId: string; 
    productId?: string 
  };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}