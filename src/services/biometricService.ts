import ReactNativeBiometrics from 'react-native-biometrics';
import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import EncryptedStorage from 'react-native-encrypted-storage';

export type BiometricType = 'TouchID' | 'FaceID' | 'Biometrics' | null;

export interface BiometricCapability {
  available: boolean;
  biometryType: BiometricType;
  error?: string;
}

export interface BiometricAuthResult {
  success: boolean;
  signature?: string;
  error?: string;
}

export class BiometricService {
  private static instance: BiometricService;
  private rnBiometrics: ReactNativeBiometrics;
  
  private constructor() {
    this.rnBiometrics = new ReactNativeBiometrics({
      allowDeviceCredentials: true,
    });
  }

  public static getInstance(): BiometricService {
    if (!BiometricService.instance) {
      BiometricService.instance = new BiometricService();
    }
    return BiometricService.instance;
  }

  /**
   * Check if biometric authentication is available on the device
   */
  async checkBiometricCapability(): Promise<BiometricCapability> {
    try {
      const { available, biometryType, error } = await this.rnBiometrics.isSensorAvailable();
      
      return {
        available,
        biometryType: biometryType as BiometricType,
        error,
      };
    } catch (error: any) {
      return {
        available: false,
        biometryType: null,
        error: error.message,
      };
    }
  }

  /**
   * Create biometric keys for secure authentication
   */
  async createBiometricKeys(): Promise<{ success: boolean; publicKey?: string; error?: string }> {
    try {
      const result = await this.rnBiometrics.createKeys();
      const success = result && typeof result === 'object' && 'publicKey' in result;

      if (success && result.publicKey) {
        // Store the public key securely
        await EncryptedStorage.setItem('biometric_public_key', result.publicKey);
        return { success: true, publicKey: result.publicKey };
      }
      
      return { success: false, error: 'Failed to create biometric keys' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete biometric keys
   */
  async deleteBiometricKeys(): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await this.rnBiometrics.deleteKeys();
      const success = result && typeof result === 'object' && 'keysDeleted' in result ? result.keysDeleted : false;
      
      if (success) {
        // Remove stored public key
        await EncryptedStorage.removeItem('biometric_public_key');
        await EncryptedStorage.removeItem('biometric_enabled');
      }
      
      return { success };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if biometric keys exist
   */
  async biometricKeysExist(): Promise<boolean> {
    try {
      const { keysExist } = await this.rnBiometrics.biometricKeysExist();
      return keysExist;
    } catch (error) {
      return false;
    }
  }

  /**
   * Authenticate using biometrics
   */
  async authenticateWithBiometrics(
    promptMessage: string = 'Authentifiez-vous avec votre empreinte digitale ou Face ID'
  ): Promise<BiometricAuthResult> {
    try {
      const capability = await this.checkBiometricCapability();
      
      if (!capability.available) {
        return {
          success: false,
          error: 'Biometric authentication not available',
        };
      }

      const keysExist = await this.biometricKeysExist();
      if (!keysExist) {
        const keyResult = await this.createBiometricKeys();
        if (!keyResult.success) {
          return {
            success: false,
            error: keyResult.error || 'Failed to create biometric keys',
          };
        }
      }

      const epochTimeSeconds = Math.round((new Date()).getTime() / 1000).toString();
      const payload = epochTimeSeconds + 'kamer_vide_grenier_auth';

      const { success, signature, error } = await this.rnBiometrics.createSignature({
        promptMessage,
        payload,
        cancelButtonText: 'Annuler',
      });

      return {
        success,
        signature,
        error,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Enable biometric authentication for the app
   */
  async enableBiometricAuth(): Promise<{ success: boolean; error?: string }> {
    try {
      const capability = await this.checkBiometricCapability();
      
      if (!capability.available) {
        return {
          success: false,
          error: 'Biometric authentication not available on this device',
        };
      }

      const keyResult = await this.createBiometricKeys();
      if (!keyResult.success) {
        return {
          success: false,
          error: keyResult.error,
        };
      }

      // Test the authentication
      const authResult = await this.authenticateWithBiometrics(
        'Configurez l\'authentification biométrique pour sécuriser votre compte'
      );

      if (authResult.success) {
        await EncryptedStorage.setItem('biometric_enabled', 'true');
        return { success: true };
      }

      return {
        success: false,
        error: authResult.error,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Disable biometric authentication
   */
  async disableBiometricAuth(): Promise<{ success: boolean; error?: string }> {
    try {
      await this.deleteBiometricKeys();
      await EncryptedStorage.removeItem('biometric_enabled');
      
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Check if biometric authentication is enabled by user
   */
  async isBiometricEnabled(): Promise<boolean> {
    try {
      const enabled = await EncryptedStorage.getItem('biometric_enabled');
      const keysExist = await this.biometricKeysExist();
      
      return enabled === 'true' && keysExist;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get device security information
   */
  async getDeviceSecurityInfo(): Promise<{
    hasSecurityEnabled: boolean;
    biometricType: BiometricType;
    deviceModel: string;
    isEmulator: boolean;
    isRooted?: boolean;
  }> {
    try {
      const capability = await this.checkBiometricCapability();
      const deviceModel = await DeviceInfo.getModel();
      const isEmulator = await DeviceInfo.isEmulator();
      
      let isRooted = false;
      if (Platform.OS === 'android') {
        // Note: DeviceInfo.isRooted() might not be available in newer versions
        // You might need to implement custom root detection
        try {
          // isRooted = await DeviceInfo.isRooted();
        } catch (e) {
          // Root detection not available
        }
      }

      return {
        hasSecurityEnabled: capability.available,
        biometricType: capability.biometryType,
        deviceModel,
        isEmulator,
        isRooted,
      };
    } catch (error) {
      return {
        hasSecurityEnabled: false,
        biometricType: null,
        deviceModel: 'Unknown',
        isEmulator: false,
        isRooted: false,
      };
    }
  }

  /**
   * Verify biometric signature (for backend verification)
   */
  async verifyBiometricSignature(signature: string, _payload: string): Promise<boolean> {
    try {
      const publicKey = await EncryptedStorage.getItem('biometric_public_key');
      
      if (!publicKey) {
        return false;
      }

      // This would typically involve sending the signature, payload, and public key
      // to your backend for verification using cryptographic libraries
      // For now, we'll just check if signature exists (basic validation)
      return signature.length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Store sensitive data using device keychain
   */
  async storeSecureData(key: string, value: string): Promise<boolean> {
    try {
      await EncryptedStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error('Failed to store secure data:', error);
      return false;
    }
  }

  /**
   * Retrieve sensitive data from device keychain
   */
  async getSecureData(key: string): Promise<string | null> {
    try {
      return await EncryptedStorage.getItem(key);
    } catch (error) {
      console.error('Failed to retrieve secure data:', error);
      return null;
    }
  }

  /**
   * Remove sensitive data from device keychain
   */
  async removeSecureData(key: string): Promise<boolean> {
    try {
      await EncryptedStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Failed to remove secure data:', error);
      return false;
    }
  }

  /**
   * Clear all stored biometric and security data
   */
  async clearAllSecurityData(): Promise<void> {
    try {
      await this.deleteBiometricKeys();
      await EncryptedStorage.clear();
    } catch (error) {
      console.error('Failed to clear security data:', error);
    }
  }
}

export const biometricService = BiometricService.getInstance();
