import React, { useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ViewStyle,
  AccessibilityProps,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface AnimatedCardProps extends AccessibilityProps {
  children: React.ReactNode;
  variant?: 'default' | 'outlined' | 'elevated' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  loading?: boolean;
  animated?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: ViewStyle;
  delay?: number;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  variant = 'default',
  size = 'md',
  interactive = false,
  loading = false,
  animated = true,
  onPress,
  onLongPress,
  style,
  delay = 0,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole,
  ...accessibilityProps
}) => {
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(20)).current;
  const pressScaleAnim = useRef(new Animated.Value(1)).current;

  // Entrance animation
  useEffect(() => {
    if (!animated) {
      scaleAnim.setValue(1);
      opacityAnim.setValue(1);
      translateYAnim.setValue(0);
      return;
    }

    const animationSequence = Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(translateYAnim, {
        toValue: 0,
        delay,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]);

    animationSequence.start();
  }, [animated, delay]);

  // Loading animation
  useEffect(() => {
    if (loading) {
      LayoutAnimation.configureNext({
        duration: 300,
        create: {
          type: LayoutAnimation.Types.easeInEaseOut,
          property: LayoutAnimation.Properties.opacity,
        },
        update: {
          type: LayoutAnimation.Types.easeInEaseOut,
        },
      });
    }
  }, [loading]);

  const handlePressIn = () => {
    if (!animated || !interactive || loading) return;

    Animated.spring(pressScaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    if (!animated || !interactive || loading) return;

    Animated.spring(pressScaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const variants = {
    default: {
      backgroundColor: '#ffffff',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    outlined: {
      backgroundColor: '#ffffff',
      borderColor: '#d1d5db',
      borderWidth: 2,
      elevation: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 1,
    },
    elevated: {
      backgroundColor: '#ffffff',
      borderColor: '#f3f4f6',
      borderWidth: 1,
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      borderWidth: 0,
      elevation: 0,
      shadowOpacity: 0,
    },
  };

  const sizes = {
    sm: {
      padding: 12,
      borderRadius: 8,
    },
    md: {
      padding: 16,
      borderRadius: 12,
    },
    lg: {
      padding: 24,
      borderRadius: 16,
    },
  };

  const variantStyle = variants[variant];
  const sizeStyle = sizes[size];

  const cardStyle = [
    styles.card,
    variantStyle,
    sizeStyle,
    loading && styles.loading,
    style,
  ];

  const animatedStyle = {
    opacity: opacityAnim,
    transform: [
      { scale: Animated.multiply(scaleAnim, pressScaleAnim) },
      { translateY: translateYAnim },
    ],
  };

  if (interactive && (onPress || onLongPress)) {
    return (
      <Animated.View style={animatedStyle}>
        <TouchableOpacity
          style={cardStyle}
          onPress={onPress}
          onLongPress={onLongPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.95}
          disabled={loading}
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={accessibilityHint}
          accessibilityRole={accessibilityRole || 'button'}
          accessibilityState={{ busy: loading }}
          {...accessibilityProps}
        >
          {loading && (
            <View style={styles.loadingOverlay}>
              <View style={styles.shimmer} />
            </View>
          )}
          <View style={[loading && styles.contentLoading]}>
            {children}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[animatedStyle, cardStyle]}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.shimmer} />
        </View>
      )}
      <View style={[loading && styles.contentLoading]}>
        {children}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 4,
  },
  loading: {
    position: 'relative',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
    overflow: 'hidden',
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#f0f0f0',
    opacity: 0.8,
  },
  contentLoading: {
    opacity: 0.3,
  },
});

export default AnimatedCard;