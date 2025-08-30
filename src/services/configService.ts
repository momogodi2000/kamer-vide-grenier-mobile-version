import Config from 'react-native-config';

export interface AppConfig {
  // API Configuration
  API_BASE_URL: string;
  API_TIMEOUT: number;

  // Authentication
  JWT_SECRET: string;
  REFRESH_TOKEN_SECRET: string;

  // Payment Gateways
  STRIPE_PUBLISHABLE_KEY: string;
  STRIPE_SECRET_KEY: string;

  // Mobile Money (Cameroon)
  MTN_API_KEY: string;
  MTN_API_SECRET: string;
  MTN_BASE_URL: string;

  ORANGE_API_KEY: string;
  ORANGE_API_SECRET: string;
  ORANGE_BASE_URL: string;

  // Campay
  CAMPAY_APP_USERNAME: string;
  CAMPAY_APP_PASSWORD: string;
  CAMPAY_BASE_URL: string;

  // Noupai
  NOUPAI_API_KEY: string;
  NOUPAI_API_SECRET: string;
  NOUPAI_BASE_URL: string;

  // Cloudinary (Image Storage)
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
  CLOUDINARY_BASE_URL: string;

  // Email Service
  EMAIL_SERVICE_API_KEY: string;
  EMAIL_FROM: string;

  // SMS Service
  SMS_SERVICE_API_KEY: string;
  SMS_FROM: string;

  // Analytics
  ANALYTICS_API_KEY: string;

  // App Configuration
  APP_NAME: string;
  APP_VERSION: string;
  BUILD_NUMBER: string;

  // Feature Flags
  ENABLE_OFFLINE_MODE: boolean;
  ENABLE_BIOMETRICS: boolean;
  ENABLE_NOTIFICATIONS: boolean;
  ENABLE_ANALYTICS: boolean;
}

class ConfigService {
  private config: AppConfig;

  constructor() {
    this.config = {
      // API Configuration
      API_BASE_URL: Config.API_BASE_URL || 'http://localhost:4000/api',
      API_TIMEOUT: parseInt(Config.API_TIMEOUT || '30000', 10),

      // Authentication
      JWT_SECRET: Config.JWT_SECRET || '',
      REFRESH_TOKEN_SECRET: Config.REFRESH_TOKEN_SECRET || '',

      // Payment Gateways
      STRIPE_PUBLISHABLE_KEY: Config.STRIPE_PUBLISHABLE_KEY || '',
      STRIPE_SECRET_KEY: Config.STRIPE_SECRET_KEY || '',

      // Mobile Money (Cameroon)
      MTN_API_KEY: Config.MTN_API_KEY || '',
      MTN_API_SECRET: Config.MTN_API_SECRET || '',
      MTN_BASE_URL: Config.MTN_BASE_URL || 'https://api.mtn.cm',

      ORANGE_API_KEY: Config.ORANGE_API_KEY || '',
      ORANGE_API_SECRET: Config.ORANGE_API_SECRET || '',
      ORANGE_BASE_URL: Config.ORANGE_BASE_URL || 'https://api.orange.cm',

      // Campay
      CAMPAY_APP_USERNAME: Config.CAMPAY_APP_USERNAME || '',
      CAMPAY_APP_PASSWORD: Config.CAMPAY_APP_PASSWORD || '',
      CAMPAY_BASE_URL: Config.CAMPAY_BASE_URL || 'https://demo.campay.net/api',

      // Noupai
      NOUPAI_API_KEY: Config.NOUPAI_API_KEY || '',
      NOUPAI_API_SECRET: Config.NOUPAI_API_SECRET || '',
      NOUPAI_BASE_URL: Config.NOUPAI_BASE_URL || 'https://api.noupai.cm',

      // Cloudinary (Image Storage)
      CLOUDINARY_CLOUD_NAME: Config.CLOUDINARY_CLOUD_NAME || '',
      CLOUDINARY_API_KEY: Config.CLOUDINARY_API_KEY || '',
      CLOUDINARY_API_SECRET: Config.CLOUDINARY_API_SECRET || '',
      CLOUDINARY_BASE_URL: `https://res.cloudinary.com/${Config.CLOUDINARY_CLOUD_NAME || 'demo'}`,

      // Email Service
      EMAIL_SERVICE_API_KEY: Config.EMAIL_SERVICE_API_KEY || '',
      EMAIL_FROM: Config.EMAIL_FROM || 'noreply@kamervidegrenier.com',

      // SMS Service
      SMS_SERVICE_API_KEY: Config.SMS_SERVICE_API_KEY || '',
      SMS_FROM: Config.SMS_FROM || 'KamerVideGrenier',

      // Analytics
      ANALYTICS_API_KEY: Config.ANALYTICS_API_KEY || '',

      // App Configuration
      APP_NAME: Config.APP_NAME || 'Kamer Vidé Grenier',
      APP_VERSION: Config.APP_VERSION || '1.0.0',
      BUILD_NUMBER: Config.BUILD_NUMBER || '1',

      // Feature Flags
      ENABLE_OFFLINE_MODE: Config.ENABLE_OFFLINE_MODE === 'true',
      ENABLE_BIOMETRICS: Config.ENABLE_BIOMETRICS === 'true',
      ENABLE_NOTIFICATIONS: Config.ENABLE_NOTIFICATIONS === 'true',
      ENABLE_ANALYTICS: Config.ENABLE_ANALYTICS === 'true',
    };
  }

  getConfig(): AppConfig {
    return this.config;
  }

  get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    return this.config[key];
  }

  isDevelopment(): boolean {
    return __DEV__;
  }

  isProduction(): boolean {
    return !__DEV__;
  }

  // Helper methods for common configurations
  getApiBaseUrl(): string {
    return this.config.API_BASE_URL;
  }

  getImageBaseUrl(): string {
    return this.config.CLOUDINARY_BASE_URL;
  }

  getFullApiUrl(endpoint: string): string {
    const baseUrl = this.config.API_BASE_URL;
    return `${baseUrl}${endpoint}`;
  }

  // Payment configuration helpers
  getStripeConfig() {
    return {
      publishableKey: this.config.STRIPE_PUBLISHABLE_KEY,
      secretKey: this.config.STRIPE_SECRET_KEY,
    };
  }

  getMobileMoneyConfig(provider: 'mtn' | 'orange') {
    if (provider === 'mtn') {
      return {
        apiKey: this.config.MTN_API_KEY,
        apiSecret: this.config.MTN_API_SECRET,
        baseUrl: this.config.MTN_BASE_URL,
      };
    } else {
      return {
        apiKey: this.config.ORANGE_API_KEY,
        apiSecret: this.config.ORANGE_API_SECRET,
        baseUrl: this.config.ORANGE_BASE_URL,
      };
    }
  }

  getCampayConfig() {
    return {
      username: this.config.CAMPAY_APP_USERNAME,
      password: this.config.CAMPAY_APP_PASSWORD,
      baseUrl: this.config.CAMPAY_BASE_URL,
    };
  }

  getNoupaiConfig() {
    return {
      apiKey: this.config.NOUPAI_API_KEY,
      apiSecret: this.config.NOUPAI_API_SECRET,
      baseUrl: this.config.NOUPAI_BASE_URL,
    };
  }

  getCloudinaryConfig() {
    return {
      cloudName: this.config.CLOUDINARY_CLOUD_NAME,
      apiKey: this.config.CLOUDINARY_API_KEY,
      apiSecret: this.config.CLOUDINARY_API_SECRET,
      baseUrl: this.config.CLOUDINARY_BASE_URL,
    };
  }
}

// Create and export singleton instance
export const configService = new ConfigService();
export default configService;
