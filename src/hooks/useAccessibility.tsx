import { useEffect, useState, useRef } from 'react';
import {
  AccessibilityInfo,
  AccessibilityChangeEventName,
  AccessibilityChangeEvent,
  Platform,
  findNodeHandle,
} from 'react-native';

// Hook for screen reader state
export const useScreenReader = () => {
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isScreenReaderEnabled().then(setIsScreenReaderEnabled);

    const subscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged' as AccessibilityChangeEventName,
      (enabled: boolean) => setIsScreenReaderEnabled(enabled)
    );

    return () => subscription?.remove();
  }, []);

  const announceForAccessibility = (message: string) => {
    if (isScreenReaderEnabled) {
      AccessibilityInfo.announceForAccessibility(message);
    }
  };

  return {
    isScreenReaderEnabled,
    announceForAccessibility,
  };
};

// Hook for reduced motion preferences
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setPrefersReducedMotion);

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged' as AccessibilityChangeEventName,
      (enabled: boolean) => setPrefersReducedMotion(enabled)
    );

    return () => subscription?.remove();
  }, []);

  return prefersReducedMotion;
};

// Hook for high contrast preferences
export const useHighContrast = () => {
  const [prefersHighContrast, setPrefersHighContrast] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'ios') {
      AccessibilityInfo.isInvertColorsEnabled().then(setPrefersHighContrast);

      const subscription = AccessibilityInfo.addEventListener(
        'invertColorsChanged' as AccessibilityChangeEventName,
        (enabled: boolean) => setPrefersHighContrast(enabled)
      );

      return () => subscription?.remove();
    }
  }, []);

  return prefersHighContrast;
};

// Hook for managing focus
export const useFocusManager = () => {
  const setAccessibilityFocus = (element: any) => {
    const reactTag = findNodeHandle(element);
    if (reactTag) {
      AccessibilityInfo.setAccessibilityFocus(reactTag);
    }
  };

  const moveFocusToNext = () => {
    if (Platform.OS === 'android') {
      AccessibilityInfo.sendAccessibilityEvent(
        findNodeHandle(null),
        'typeViewFocused'
      );
    }
  };

  return {
    setAccessibilityFocus,
    moveFocusToNext,
  };
};

// Hook for accessible announcements with timing
export const useAccessibleAnnouncements = () => {
  const { announceForAccessibility } = useScreenReader();
  const announcementQueue = useRef<string[]>([]);
  const isAnnouncing = useRef(false);

  const queueAnnouncement = (message: string, delay: number = 1000) => {
    announcementQueue.current.push(message);
    
    if (!isAnnouncing.current) {
      processQueue(delay);
    }
  };

  const processQueue = (delay: number) => {
    if (announcementQueue.current.length === 0) {
      isAnnouncing.current = false;
      return;
    }

    isAnnouncing.current = true;
    const nextMessage = announcementQueue.current.shift();
    
    if (nextMessage) {
      announceForAccessibility(nextMessage);
      
      setTimeout(() => {
        processQueue(delay);
      }, delay);
    }
  };

  const clearQueue = () => {
    announcementQueue.current = [];
    isAnnouncing.current = false;
  };

  const announceImmediate = (message: string) => {
    clearQueue();
    announceForAccessibility(message);
  };

  return {
    queueAnnouncement,
    clearQueue,
    announceImmediate,
  };
};

// Hook for form accessibility
export const useFormAccessibility = (fieldId: string) => {
  const getFieldAccessibility = (
    label: string,
    error?: string,
    helperText?: string,
    required?: boolean
  ) => {
    const accessibilityLabel = required ? `${label}, required` : label;
    const accessibilityHint = error || helperText;
    
    return {
      accessibilityLabel,
      accessibilityHint,
      accessibilityRequired: required,
      accessibilityInvalid: !!error,
      accessibilityLabelledBy: fieldId,
    };
  };

  const announceValidationChange = (error?: string, success?: string) => {
    const { announceForAccessibility } = useScreenReader();
    
    if (error) {
      announceForAccessibility(`Error: ${error}`);
    } else if (success) {
      announceForAccessibility(`Success: ${success}`);
    }
  };

  return {
    getFieldAccessibility,
    announceValidationChange,
  };
};

// Hook for loading states accessibility
export const useLoadingAccessibility = () => {
  const { announceForAccessibility } = useScreenReader();

  const announceLoadingStart = (context?: string) => {
    const message = context ? `Loading ${context}` : 'Loading';
    announceForAccessibility(message);
  };

  const announceLoadingComplete = (context?: string) => {
    const message = context ? `${context} loaded` : 'Loading complete';
    announceForAccessibility(message);
  };

  const announceLoadingError = (error: string) => {
    announceForAccessibility(`Loading failed: ${error}`);
  };

  const getLoadingAccessibility = (loading: boolean, label?: string) => ({
    accessibilityState: { busy: loading },
    accessibilityLabel: loading 
      ? `Loading${label ? `: ${label}` : ''}` 
      : label,
  });

  return {
    announceLoadingStart,
    announceLoadingComplete,
    announceLoadingError,
    getLoadingAccessibility,
  };
};

// Hook for navigation accessibility
export const useNavigationAccessibility = () => {
  const { announceForAccessibility } = useScreenReader();

  const announceScreenChange = (screenName: string) => {
    // Small delay to ensure the screen has loaded
    setTimeout(() => {
      announceForAccessibility(`Navigated to ${screenName}`);
    }, 500);
  };

  const announceTabChange = (tabName: string) => {
    announceForAccessibility(`${tabName} tab selected`);
  };

  const getNavigationAccessibility = (
    label: string,
    current?: boolean,
    index?: number,
    total?: number
  ) => ({
    accessibilityRole: 'tab' as const,
    accessibilityLabel: label,
    accessibilityState: { 
      selected: current,
    },
    accessibilityHint: current 
      ? 'Currently selected'
      : 'Double tap to select',
    ...(index !== undefined && total !== undefined && {
      accessibilityValue: {
        min: 1,
        max: total,
        now: index + 1,
      },
    }),
  });

  return {
    announceScreenChange,
    announceTabChange,
    getNavigationAccessibility,
  };
};

// Hook for list accessibility
export const useListAccessibility = () => {
  const getListAccessibility = (
    itemIndex: number,
    totalItems: number,
    label?: string
  ) => ({
    accessibilityRole: 'button' as const,
    accessibilityLabel: label,
    accessibilityHint: `Item ${itemIndex + 1} of ${totalItems}. Double tap to select.`,
    accessibilityValue: {
      min: 1,
      max: totalItems,
      now: itemIndex + 1,
    },
  });

  const getSectionHeaderAccessibility = (title: string, itemCount: number) => ({
    accessibilityRole: 'header' as const,
    accessibilityLabel: title,
    accessibilityHint: `Section with ${itemCount} items`,
  });

  return {
    getListAccessibility,
    getSectionHeaderAccessibility,
  };
};

// Hook for modal accessibility
export const useModalAccessibility = () => {
  const { setAccessibilityFocus } = useFocusManager();
  const { announceForAccessibility } = useScreenReader();
  const previousFocus = useRef<any>(null);

  const openModal = (modalRef: any, title?: string) => {
    // Announce modal opening
    if (title) {
      announceForAccessibility(`${title} dialog opened`);
    }
    
    // Focus the modal after a short delay
    setTimeout(() => {
      if (modalRef?.current) {
        setAccessibilityFocus(modalRef.current);
      }
    }, 100);
  };

  const closeModal = (title?: string) => {
    // Announce modal closing
    if (title) {
      announceForAccessibility(`${title} dialog closed`);
    }
  };

  const getModalAccessibility = (title?: string, description?: string) => ({
    accessibilityRole: 'dialog' as const,
    accessibilityModal: true,
    accessibilityLabel: title,
    accessibilityHint: description,
    accessibilityViewIsModal: true,
  });

  return {
    openModal,
    closeModal,
    getModalAccessibility,
  };
};

// Hook for gesture accessibility
export const useGestureAccessibility = () => {
  const createAccessibleGesture = (
    gesture: string,
    description: string,
    onActivate: () => void
  ) => ({
    accessibilityActions: [
      {
        name: 'activate' as const,
        label: description,
      },
    ],
    onAccessibilityAction: (event: { nativeEvent: { actionName: string } }) => {
      if (event.nativeEvent.actionName === 'activate') {
        onActivate();
      }
    },
    accessibilityHint: `${gesture}. ${description}`,
  });

  return {
    createAccessibleGesture,
  };
};

// Hook for color and contrast
export const useAccessibleColors = () => {
  const { prefersHighContrast } = useHighContrast();
  
  const getAccessibleColor = (
    normalColor: string,
    highContrastColor: string
  ) => {
    return prefersHighContrast ? highContrastColor : normalColor;
  };

  const getAccessibleColorPair = (
    normalFg: string,
    normalBg: string,
    highContrastFg: string,
    highContrastBg: string
  ) => ({
    color: getAccessibleColor(normalFg, highContrastFg),
    backgroundColor: getAccessibleColor(normalBg, highContrastBg),
  });

  return {
    prefersHighContrast,
    getAccessibleColor,
    getAccessibleColorPair,
  };
};