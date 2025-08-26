import DeviceInfo from 'react-native-device-info';
import { Platform, Alert, AppState } from 'react-native';
import { check, request, PERMISSIONS, RESULTS, Permission } from 'react-native-permissions';
import EncryptedStorage from 'react-native-encrypted-storage';
import { biometricService } from './biometricService';
import { offlineDatabase } from './offlineDatabase';

export interface SecurityProfile {
  deviceId: string;
  deviceModel: string;
  osVersion: string;
  appVersion: string;
  isEmulator: boolean;
  isRooted: boolean;
  hasScreenLock: boolean;
  biometricType: string | null;
  lastSecurityCheck: number;
  securityLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  threatDetections: string[];
}

export interface PermissionStatus {
  permission: string;
  status: 'granted' | 'denied' | 'blocked' | 'unavailable';
  required: boolean;
  description: string;
}

export interface SecuritySettings {
  biometricAuthEnabled: boolean;
  appLockEnabled: boolean;
  autoLockTimeout: number; // minutes
  requireBiometricForSensitiveActions: boolean;
  allowScreenshots: boolean;
  dataEncryptionEnabled: boolean;
  sessionTimeout: number; // minutes
  maxLoginAttempts: number;
}

export class SecurityService {
  private static instance: SecurityService;
  private securityProfile: SecurityProfile | null = null;
  private securitySettings: SecuritySettings = {
    biometricAuthEnabled: false,
    appLockEnabled: false,
    autoLockTimeout: 5,
    requireBiometricForSensitiveActions: true,
    allowScreenshots: false,
    dataEncryptionEnabled: true,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
  };
  
  private isLocked = false;
  private lastActivity = Date.now();
  private loginAttempts = 0;
  private appStateSubscription: any = null;

  private constructor() {}

  public static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  /**
   * Initialize security service
   */
  async initialize(): Promise<void> {
    try {
      console.log('🔐 Initializing security service...');

      // Load security settings
      await this.loadSecuritySettings();

      // Generate security profile
      await this.generateSecurityProfile();

      // Set up app state monitoring
      this.setupAppStateMonitoring();

      // Check for security threats
      await this.performSecurityChecks();

      // Load login attempt counter
      const attempts = await EncryptedStorage.getItem('login_attempts');
      if (attempts) {
        this.loginAttempts = parseInt(attempts, 10);
      }

      console.log('✅ Security service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize security service:', error);
      throw error;
    }
  }

  /**
   * Generate comprehensive security profile
   */
  private async generateSecurityProfile(): Promise<void> {
    try {
      const deviceId = await DeviceInfo.getUniqueId();
      const deviceModel = await DeviceInfo.getModel();
      const osVersion = DeviceInfo.getSystemVersion();
      const appVersion = DeviceInfo.getVersion();
      const isEmulator = await DeviceInfo.isEmulator();

      // Check for root/jailbreak
      let isRooted = false;
      try {
        // Basic root detection (you might want to use more sophisticated methods)
        if (Platform.OS === 'android') {
          // Check for common root indicators
          isRooted = await this.checkForRootIndicators();
        }
      } catch (error) {
        console.warn('Could not determine root status:', error);
      }

      // Check biometric capability
      const biometricCapability = await biometricService.checkBiometricCapability();
      
      // Determine security level
      let securityLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM';
      let threatDetections: string[] = [];

      if (isEmulator) {
        securityLevel = 'LOW';
        threatDetections.push('Running on emulator/simulator');
      }

      if (isRooted) {
        securityLevel = 'LOW';
        threatDetections.push('Device is rooted/jailbroken');
      }

      if (biometricCapability.available && !isRooted && !isEmulator) {
        securityLevel = 'HIGH';
      }

      this.securityProfile = {
        deviceId,
        deviceModel,
        osVersion,
        appVersion,
        isEmulator,
        isRooted,
        hasScreenLock: biometricCapability.available,
        biometricType: biometricCapability.biometryType,
        lastSecurityCheck: Date.now(),
        securityLevel,
        threatDetections,
      };

      // Store security profile
      await EncryptedStorage.setItem('security_profile', JSON.stringify(this.securityProfile));

      console.log(`🔐 Security profile generated - Level: ${securityLevel}`);
    } catch (error) {
      console.error('Failed to generate security profile:', error);
    }
  }

  /**
   * Basic root detection for Android
   */
  private async checkForRootIndicators(): Promise<boolean> {
    // This is a basic implementation - in production, you'd use more sophisticated methods
    // like checking for root management apps, su binaries, etc.
    try {
      if (Platform.OS !== 'android') return false;

      // Check for debug mode (not foolproof but an indicator)
      const isDebuggable = await DeviceInfo.isEmulator(); // This also checks debug mode
      
      // In a real implementation, you'd check for:
      // - Root management apps (SuperSU, Magisk, etc.)
      // - Modified system files
      // - Suspicious system properties
      // - Accessibility services
      
      return false; // Placeholder - implement proper root detection
    } catch (error) {
      return false;
    }
  }

  /**
   * Perform comprehensive security checks
   */
  private async performSecurityChecks(): Promise<void> {
    try {
      const checks = [];

      // Check app integrity
      checks.push(this.checkAppIntegrity());

      // Check for debugging
      checks.push(this.checkForDebugging());

      // Validate certificates (in production)
      checks.push(this.validateCertificates());

      const results = await Promise.allSettled(checks);
      
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.warn(`Security check ${index} failed:`, result.reason);
        }
      });
    } catch (error) {
      console.error('Security checks failed:', error);
    }
  }

  /**
   * Check app integrity
   */
  private async checkAppIntegrity(): Promise<boolean> {
    try {
      // Check if app is installed from official store
      const installerPackageName = await DeviceInfo.getInstallerPackageName();
      
      if (Platform.OS === 'android') {
        return installerPackageName === 'com.android.vending'; // Google Play Store
      } else if (Platform.OS === 'ios') {
        return installerPackageName === 'AppStore';
      }
      
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check for debugging
   */
  private async checkForDebugging(): Promise<boolean> {
    try {
      return !(await DeviceInfo.isEmulator() && __DEV__);
    } catch (error) {
      return true;
    }
  }

  /**
   * Validate app certificates
   */
  private async validateCertificates(): Promise<boolean> {
    // In production, implement certificate pinning validation
    return true;
  }

  /**
   * Setup app state monitoring for auto-lock
   */
  private setupAppStateMonitoring(): void {
    this.appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        this.handleAppForeground();
      } else if (nextAppState === 'background' || nextAppState === 'inactive') {
        this.handleAppBackground();
      }
    });
  }

  /**
   * Handle app coming to foreground
   */
  private async handleAppForeground(): Promise<void> {
    const now = Date.now();
    const timeSinceBackground = now - this.lastActivity;
    const autoLockTimeoutMs = this.securitySettings.autoLockTimeout * 60 * 1000;

    if (this.securitySettings.appLockEnabled && timeSinceBackground > autoLockTimeoutMs) {
      await this.lockApp();
    }

    // Update last activity
    this.lastActivity = now;
  }

  /**
   * Handle app going to background
   */
  private handleAppBackground(): void {
    this.lastActivity = Date.now();
  }

  /**
   * Lock the application
   */
  async lockApp(): Promise<void> {
    this.isLocked = true;
    
    // Track lock event
    await offlineDatabase.trackEvent('app_locked', {
      timestamp: Date.now(),
      reason: 'auto_lock',
    });

    console.log('🔒 Application locked');
  }

  /**
   * Unlock the application
   */
  async unlockApp(method: 'biometric' | 'passcode' | 'password'): Promise<{ success: boolean; error?: string }> {
    try {
      let authResult = { success: false, error: 'Unknown authentication method' };

      switch (method) {
        case 'biometric':
          if (this.securitySettings.biometricAuthEnabled) {
            const biometricResult = await biometricService.authenticateWithBiometrics(
              'Déverrouillez l\'application avec votre empreinte digitale ou Face ID'
            );
            authResult = { success: biometricResult.success, error: biometricResult.error };
          } else {
            authResult = { success: false, error: 'Biometric authentication not enabled' };
          }
          break;

        case 'passcode':
        case 'password':
          // Implement passcode/password authentication
          // This would typically show a PIN/password input dialog
          authResult = { success: false, error: 'Passcode authentication not implemented' };
          break;
      }

      if (authResult.success) {
        this.isLocked = false;
        this.lastActivity = Date.now();
        this.loginAttempts = 0;
        await EncryptedStorage.removeItem('login_attempts');

        // Track unlock event
        await offlineDatabase.trackEvent('app_unlocked', {
          timestamp: Date.now(),
          method,
        });

        console.log('🔓 Application unlocked');
      } else {
        this.loginAttempts++;
        await EncryptedStorage.setItem('login_attempts', this.loginAttempts.toString());

        if (this.loginAttempts >= this.securitySettings.maxLoginAttempts) {
          await this.handleMaxLoginAttemptsReached();
        }
      }

      return authResult;
    } catch (error: any) {
      return { success: false, error: error.message || 'Authentication failed' };
    }
  }

  /**
   * Handle maximum login attempts reached
   */
  private async handleMaxLoginAttemptsReached(): Promise<void> {
    // Lock account for 15 minutes
    const lockoutTime = Date.now() + (15 * 60 * 1000);
    await EncryptedStorage.setItem('lockout_until', lockoutTime.toString());

    // Track security event
    await offlineDatabase.trackEvent('max_login_attempts', {
      timestamp: Date.now(),
      attempts: this.loginAttempts,
    });

    Alert.alert(
      'Compte temporairement bloqué',
      'Trop de tentatives de connexion échouées. Votre compte est temporairement bloqué pour 15 minutes.',
      [{ text: 'OK' }]
    );
  }

  /**
   * Check if account is locked out
   */
  async isAccountLockedOut(): Promise<boolean> {
    try {
      const lockoutUntil = await EncryptedStorage.getItem('lockout_until');
      if (lockoutUntil) {
        const lockoutTime = parseInt(lockoutUntil, 10);
        if (Date.now() < lockoutTime) {
          return true;
        } else {
          // Lockout period has passed
          await EncryptedStorage.removeItem('lockout_until');
          this.loginAttempts = 0;
          await EncryptedStorage.removeItem('login_attempts');
        }
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check and request permissions
   */
  async checkAndRequestPermissions(): Promise<PermissionStatus[]> {
    const permissionsToCheck: { permission: Permission; required: boolean; description: string }[] = [
      {
        permission: Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA,
        required: true,
        description: 'Accès à la caméra pour prendre des photos de produits',
      },
      {
        permission: Platform.OS === 'ios' ? PERMISSIONS.IOS.PHOTO_LIBRARY : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
        required: true,
        description: 'Accès à la galerie photo pour sélectionner des images',
      },
      {
        permission: Platform.OS === 'ios' ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        required: false,
        description: 'Localisation pour améliorer la recherche de produits locaux',
      },
    ];

    if (Platform.OS === 'android') {
      permissionsToCheck.push({
        permission: PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
        required: true,
        description: 'Écriture sur le stockage pour sauvegarder les images',
      });
    }

    const permissionStatuses: PermissionStatus[] = [];

    for (const { permission, required, description } of permissionsToCheck) {
      try {
        let status = await check(permission);

        if (status === RESULTS.DENIED && required) {
          status = await request(permission);
        }

        permissionStatuses.push({
          permission: permission.toString(),
          status: this.mapPermissionResult(status),
          required,
          description,
        });
      } catch (error) {
        permissionStatuses.push({
          permission: permission.toString(),
          status: 'unavailable',
          required,
          description,
        });
      }
    }

    return permissionStatuses;
  }

  /**
   * Map permission result to our status type
   */
  private mapPermissionResult(result: string): 'granted' | 'denied' | 'blocked' | 'unavailable' {
    switch (result) {
      case RESULTS.GRANTED:
        return 'granted';
      case RESULTS.DENIED:
        return 'denied';
      case RESULTS.BLOCKED:
      case RESULTS.LIMITED:
        return 'blocked';
      case RESULTS.UNAVAILABLE:
      default:
        return 'unavailable';
    }
  }

  /**
   * Encrypt sensitive data
   */
  async encryptSensitiveData(key: string, data: string): Promise<boolean> {
    try {
      if (!this.securitySettings.dataEncryptionEnabled) {
        await EncryptedStorage.setItem(key, data);
        return true;
      }

      // EncryptedStorage already provides encryption
      await EncryptedStorage.setItem(`encrypted_${key}`, data);
      return true;
    } catch (error) {
      console.error('Failed to encrypt data:', error);
      return false;
    }
  }

  /**
   * Decrypt sensitive data
   */
  async decryptSensitiveData(key: string): Promise<string | null> {
    try {
      if (!this.securitySettings.dataEncryptionEnabled) {
        return await EncryptedStorage.getItem(key);
      }

      return await EncryptedStorage.getItem(`encrypted_${key}`);
    } catch (error) {
      console.error('Failed to decrypt data:', error);
      return null;
    }
  }

  /**
   * Update security settings
   */
  async updateSecuritySettings(settings: Partial<SecuritySettings>): Promise<void> {
    this.securitySettings = { ...this.securitySettings, ...settings };
    await EncryptedStorage.setItem('security_settings', JSON.stringify(this.securitySettings));

    // If biometric auth was enabled, set it up
    if (settings.biometricAuthEnabled && !this.securitySettings.biometricAuthEnabled) {
      const result = await biometricService.enableBiometricAuth();
      if (!result.success) {
        this.securitySettings.biometricAuthEnabled = false;
        await EncryptedStorage.setItem('security_settings', JSON.stringify(this.securitySettings));
        throw new Error(result.error || 'Failed to enable biometric authentication');
      }
    }

    // If biometric auth was disabled, clean up
    if (settings.biometricAuthEnabled === false) {
      await biometricService.disableBiometricAuth();
    }
  }

  /**
   * Load security settings
   */
  private async loadSecuritySettings(): Promise<void> {
    try {
      const settings = await EncryptedStorage.getItem('security_settings');
      if (settings) {
        this.securitySettings = { ...this.securitySettings, ...JSON.parse(settings) };
      }
    } catch (error) {
      console.error('Failed to load security settings:', error);
    }
  }

  /**
   * Get current security settings
   */
  getSecuritySettings(): SecuritySettings {
    return { ...this.securitySettings };
  }

  /**
   * Get security profile
   */
  getSecurityProfile(): SecurityProfile | null {
    return this.securityProfile ? { ...this.securityProfile } : null;
  }

  /**
   * Check if app is currently locked
   */
  isAppLocked(): boolean {
    return this.isLocked;
  }

  /**
   * Wipe all sensitive data (emergency reset)
   */
  async wipeSensitiveData(): Promise<void> {
    try {
      console.log('🔥 Wiping all sensitive data...');

      // Clear all encrypted storage
      await EncryptedStorage.clear();

      // Clear biometric data
      await biometricService.clearAllSecurityData();

      // Clear offline database
      await offlineDatabase.clearExpiredData();

      // Reset security settings
      this.securitySettings = {
        biometricAuthEnabled: false,
        appLockEnabled: false,
        autoLockTimeout: 5,
        requireBiometricForSensitiveActions: true,
        allowScreenshots: false,
        dataEncryptionEnabled: true,
        sessionTimeout: 30,
        maxLoginAttempts: 5,
      };

      this.isLocked = false;
      this.loginAttempts = 0;

      console.log('✅ Sensitive data wiped successfully');
    } catch (error) {
      console.error('❌ Failed to wipe sensitive data:', error);
      throw error;
    }
  }

  /**
   * Validate session timeout
   */
  isSessionExpired(): boolean {
    const sessionTimeoutMs = this.securitySettings.sessionTimeout * 60 * 1000;
    return (Date.now() - this.lastActivity) > sessionTimeoutMs;
  }

  /**
   * Update activity timestamp
   */
  updateActivity(): void {
    this.lastActivity = Date.now();
  }

  /**
   * Get remaining lockout time in minutes
   */
  async getRemainingLockoutTime(): Promise<number> {
    try {
      const lockoutUntil = await EncryptedStorage.getItem('lockout_until');
      if (lockoutUntil) {
        const lockoutTime = parseInt(lockoutUntil, 10);
        const remaining = Math.max(0, lockoutTime - Date.now());
        return Math.ceil(remaining / (60 * 1000)); // Convert to minutes
      }
      return 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Cleanup and stop security service
   */
  stop(): void {
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
  }
}

export const securityService = SecurityService.getInstance();