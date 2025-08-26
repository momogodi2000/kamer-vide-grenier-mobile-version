import { launchImageLibrary, launchCamera, MediaType } from 'react-native-image-picker';
import { Alert, Platform } from 'react-native';

export interface ImagePickerResult {
  success: boolean;
  assets?: Array<{
    uri: string;
    fileName?: string;
    type?: string;
    fileSize?: number;
    width?: number;
    height?: number;
  }>;
  error?: string;
}

export class ImageService {
  async pickFromGallery(options: {
    mediaType?: MediaType;
    quality?: number;
    maxWidth?: number;
    maxHeight?: number;
    multiple?: boolean;
  } = {}): Promise<ImagePickerResult> {
    return new Promise((resolve) => {
      const defaultOptions = {
        mediaType: 'photo' as MediaType,
        quality: 0.8,
        maxWidth: 1200,
        maxHeight: 1200,
        selectionLimit: options.multiple ? 10 : 1,
        includeBase64: false,
      };

      launchImageLibrary(
        { ...defaultOptions, ...options },
        (response) => {
          if (response.didCancel) {
            resolve({ success: false, error: 'User cancelled image selection' });
          } else if (response.errorMessage) {
            resolve({ success: false, error: response.errorMessage });
          } else if (response.assets) {
            resolve({ success: true, assets: response.assets });
          } else {
            resolve({ success: false, error: 'Unknown error occurred' });
          }
        }
      );
    });
  }

  async takePhoto(options: {
    quality?: number;
    maxWidth?: number;
    maxHeight?: number;
  } = {}): Promise<ImagePickerResult> {
    return new Promise((resolve) => {
      const defaultOptions = {
        mediaType: 'photo' as MediaType,
        quality: 0.8,
        maxWidth: 1200,
        maxHeight: 1200,
        includeBase64: false,
      };

      launchCamera(
        { ...defaultOptions, ...options },
        (response) => {
          if (response.didCancel) {
            resolve({ success: false, error: 'User cancelled camera' });
          } else if (response.errorMessage) {
            resolve({ success: false, error: response.errorMessage });
          } else if (response.assets && response.assets.length > 0) {
            resolve({ success: true, assets: response.assets });
          } else {
            resolve({ success: false, error: 'No image captured' });
          }
        }
      );
    });
  }

  showImagePickerOptions(
    onGallery: () => void,
    onCamera: () => void,
    onCancel?: () => void
  ): void {
    Alert.alert(
      'Sélectionner une image',
      'Choisissez une source pour votre image',
      [
        { text: 'Galerie', onPress: onGallery },
        { text: 'Appareil photo', onPress: onCamera },
        { text: 'Annuler', style: 'cancel', onPress: onCancel },
      ],
      { cancelable: true }
    );
  }

  createFormData(assets: any[], fieldName: string = 'images'): FormData {
    const formData = new FormData();

    assets.forEach((asset, index) => {
      if (asset.uri) {
        const imageUri = Platform.OS === 'ios' ? asset.uri.replace('file://', '') : asset.uri;
        
        formData.append(`${fieldName}`, {
          uri: imageUri,
          type: asset.type || 'image/jpeg',
          name: asset.fileName || `image_${index}.jpg`,
        } as any);
      }
    });

    return formData;
  }

  validateImage(asset: any): { valid: boolean; error?: string } {
    if (!asset.uri) {
      return { valid: false, error: 'Image URI is required' };
    }

    if (asset.fileSize && asset.fileSize > 10 * 1024 * 1024) { // 10MB limit
      return { valid: false, error: 'Image size must be less than 10MB' };
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (asset.type && !allowedTypes.includes(asset.type.toLowerCase())) {
      return { valid: false, error: 'Only JPEG, PNG, and WebP images are allowed' };
    }

    return { valid: true };
  }

  getImageDimensions(uri: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const Image = require('react-native').Image;
      Image.getSize(
        uri,
        (width: number, height: number) => {
          resolve({ width, height });
        },
        (error: any) => {
          reject(error);
        }
      );
    });
  }
}

export const imageService = new ImageService();