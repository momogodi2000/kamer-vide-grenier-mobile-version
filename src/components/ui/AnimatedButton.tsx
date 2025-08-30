import React, { useRef, useEffect } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  ViewStyle,
  TextStyle,
  AccessibilityProps,
  ActivityIndicator,
  View,
  Easing,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';

interface AnimatedButtonProps extends AccessibilityProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost' | 'african' | 'kente';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  animated?: boolean;
  africanPattern?: boolean;
  pulseEffect?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  animated = true,
  africanPattern = false,
  pulseEffect = false,
  style,
  textStyle,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
  ...accessibilityProps
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (pulseEffect && !loading && !disabled) {
      // Gentle pulse animation for African-inspired buttons
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [pulseEffect, loading, disabled, pulseAnim]);

  useEffect(() => {
    if (loading) {
      // Start rotation animation for loading state
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      rotateAnim.setValue(0);
    }
  }, [loading, rotateAnim]);

  const handlePressIn = () => {
    if (!animated || loading || disabled) return;
    
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    if (!animated || loading || disabled) return;
    
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const variants = {
    primary: {
      backgroundColor: '#2563eb',
      borderColor: '#2563eb',
      color: '#ffffff',
    },
    secondary: {
      backgroundColor: '#f3f4f6',
      borderColor: '#d1d5db',
      color: '#374151',
    },
    danger: {
      backgroundColor: '#dc2626',
      borderColor: '#dc2626',
      color: '#ffffff',
    },
    success: {
      backgroundColor: '#059669',
      borderColor: '#059669',
      color: '#ffffff',
    },
    outline: {
      backgroundColor: 'transparent',
      borderColor: '#d1d5db',
      color: '#374151',
    },
    ghost: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      color: '#6b7280',
    },
    african: {
      backgroundColor: '#8B4513', // African brown
      borderColor: '#DAA520', // Golden border
      color: '#FFFFFF',
    },
    kente: {
      backgroundColor: '#FFD700', // Gold background
      borderColor: '#8B4513', // Brown border
      color: '#8B4513', // Brown text
    },
  };

  const sizes = {
    sm: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 6,
      fontSize: 14,
      minHeight: 36,
    },
    md: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 8,
      fontSize: 16,
      minHeight: 44,
    },
    lg: {
      paddingHorizontal: 24,
      paddingVertical: 16,
      borderRadius: 10,
      fontSize: 18,
      minHeight: 52,
    },
  };

  const variantStyle = variants[variant];
  const sizeStyle = sizes[size];

  const buttonStyle = [
    styles.button,
    {
      backgroundColor: variantStyle.backgroundColor,
      borderColor: variantStyle.borderColor,
      paddingHorizontal: sizeStyle.paddingHorizontal,
      paddingVertical: sizeStyle.paddingVertical,
      borderRadius: sizeStyle.borderRadius,
      minHeight: sizeStyle.minHeight,
    },
    fullWidth && styles.fullWidth,
    (disabled || loading) && styles.disabled,
    africanPattern && styles.africanPattern,
    style,
  ];

  const textStyles = [
    styles.text,
    {
      color: variantStyle.color,
      fontSize: sizeStyle.fontSize,
    },
    (disabled || loading) && styles.disabledText,
    textStyle,
  ];

  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
        fullWidth && styles.fullWidth,
      ]}
    >
      <TouchableOpacity
        style={buttonStyle}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={animated ? 0.8 : 1}
        accessibilityLabel={accessibilityLabel || title}
        accessibilityHint={accessibilityHint}
        accessibilityRole={accessibilityRole}
        accessibilityState={{
          disabled: disabled || loading,
          busy: loading,
        }}
        {...accessibilityProps}
      >
        <View style={styles.content}>
          {leftIcon && !loading && (
            <View style={styles.leftIcon}>{leftIcon}</View>
          )}
          
          {loading ? (
            <ActivityIndicator
              size="small"
              color={variantStyle.color}
              accessibilityLabel="Loading"
            />
          ) : (
            <Text style={textStyles} numberOfLines={1}>
              {title}
            </Text>
          )}
          
          {rightIcon && !loading && (
            <View style={styles.rightIcon}>{rightIcon}</View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.6,
    elevation: 0,
    shadowOpacity: 0,
  },
  africanPattern: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#DAA520',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
  disabledText: {
    opacity: 0.7,
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
});

export default AnimatedButton;