import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Animated,
  ViewStyle,
  TextStyle,
  AccessibilityProps,
  TouchableOpacity,
  TextInputProps,
} from 'react-native';

interface AnimatedInputProps extends TextInputProps, AccessibilityProps {
  label?: string;
  helperText?: string;
  error?: string;
  success?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
  animated?: boolean;
  required?: boolean;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
}

const AnimatedInput: React.FC<AnimatedInputProps> = ({
  label,
  helperText,
  error,
  success,
  leftIcon,
  rightIcon,
  loading = false,
  animated = true,
  required = false,
  value,
  onFocus,
  onBlur,
  containerStyle,
  inputStyle,
  labelStyle,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);

  const labelAnim = useRef(new Animated.Value(0)).current;
  const borderAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setHasValue(!!value);
  }, [value]);

  useEffect(() => {
    if (animated) {
      const shouldFloat = isFocused || hasValue;
      
      Animated.parallel([
        Animated.timing(labelAnim, {
          toValue: shouldFloat ? 1 : 0,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(borderAnim, {
          toValue: isFocused ? 1 : 0,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [isFocused, hasValue, animated]);

  useEffect(() => {
    if (error && animated) {
      // Shake animation for errors
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [error, animated]);

  useEffect(() => {
    if (success && animated) {
      // Pulse animation for success
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [success, animated]);

  const handleFocus = (event: any) => {
    setIsFocused(true);
    onFocus?.(event);
  };

  const handleBlur = (event: any) => {
    setIsFocused(false);
    onBlur?.(event);
  };

  const labelTop = animated ? labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 4],
  }) : (isFocused || hasValue) ? 4 : 20;

  const labelFontSize = animated ? labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 12],
  }) : (isFocused || hasValue) ? 12 : 16;

  const borderColor = animated ? borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      error ? '#dc2626' : '#d1d5db',
      error ? '#dc2626' : success ? '#059669' : '#2563eb'
    ],
  }) : error ? '#dc2626' : success ? '#059669' : isFocused ? '#2563eb' : '#d1d5db';

  const borderWidth = animated ? borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2],
  }) : isFocused ? 2 : 1;

  return (
    <Animated.View
      style={[
        containerStyle,
        animated && {
          transform: [
            { translateX: shakeAnim },
            { scale: pulseAnim },
          ],
        },
      ]}
    >
      <View style={styles.inputContainer}>
        <Animated.View
          style={[
            styles.input,
            {
              borderColor,
              borderWidth,
            },
            style,
          ]}
        >
          {/* Left Icon */}
          {leftIcon && (
            <View style={styles.leftIcon}>
              {leftIcon}
            </View>
          )}

          {/* Input Field */}
          <TextInput
            {...props}
            value={value}
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={[
              styles.textInput,
              leftIcon && styles.textInputWithLeftIcon,
              rightIcon && styles.textInputWithRightIcon,
              inputStyle,
            ]}
            placeholderTextColor="#9ca3af"
            accessibilityLabel={label}
            accessibilityHint={helperText}
            accessibilityState={{
              busy: loading,
            }}
          />

          {/* Floating Label */}
          {label && (
            <Animated.Text
              style={[
                styles.label,
                {
                  top: labelTop,
                  fontSize: labelFontSize,
                  color: error ? '#dc2626' : success ? '#059669' : isFocused ? '#2563eb' : '#6b7280',
                },
                labelStyle,
              ]}
              pointerEvents="none"
            >
              {label}
              {required && <Text style={styles.required}> *</Text>}
            </Animated.Text>
          )}

          {/* Right Icon */}
          {rightIcon && (
            <View style={styles.rightIcon}>
              {rightIcon}
            </View>
          )}
        </Animated.View>

        {/* Focus Indicator */}
        {animated && isFocused && (
          <Animated.View
            style={[
              styles.focusIndicator,
              {
                backgroundColor: error ? '#dc2626' : success ? '#059669' : '#2563eb',
                opacity: borderAnim,
              },
            ]}
          />
        )}
      </View>

      {/* Helper Text / Error / Success Message */}
      {(helperText || error || success) && (
        <View style={styles.messageContainer}>
          {error && (
            <Text style={styles.errorText} accessibilityRole="alert">
              {error}
            </Text>
          )}
          {success && !error && (
            <Text style={styles.successText}>
              {success}
            </Text>
          )}
          {helperText && !error && !success && (
            <Text style={styles.helperText}>
              {helperText}
            </Text>
          )}
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    position: 'relative',
  },
  input: {
    borderRadius: 8,
    backgroundColor: '#ffffff',
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    paddingTop: 20,
    paddingBottom: 8,
  },
  textInputWithLeftIcon: {
    marginLeft: 8,
  },
  textInputWithRightIcon: {
    marginRight: 8,
  },
  label: {
    position: 'absolute',
    left: 12,
    fontWeight: '500',
    backgroundColor: '#ffffff',
    paddingHorizontal: 4,
  },
  required: {
    color: '#dc2626',
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
  focusIndicator: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 2,
    borderRadius: 1,
  },
  messageContainer: {
    marginTop: 6,
    paddingHorizontal: 4,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '500',
  },
  successText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '500',
  },
  helperText: {
    color: '#6b7280',
    fontSize: 12,
  },
});

export default AnimatedInput;