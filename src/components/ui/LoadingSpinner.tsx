import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  ViewStyle,
  Text,
} from 'react-native';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  text?: string;
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars';
  style?: ViewStyle;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = '#2563eb',
  text,
  variant = 'spinner',
  style,
}) => {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;

  const sizes = {
    small: 20,
    medium: 40,
    large: 60,
  };

  const containerSize = sizes[size];

  useEffect(() => {
    if (variant === 'spinner') {
      const spinAnimation = Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      );
      spinAnimation.start();

      return () => spinAnimation.stop();
    }

    if (variant === 'pulse') {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();

      return () => pulseAnimation.stop();
    }

    if (variant === 'dots') {
      const dotsAnimation = Animated.loop(
        Animated.stagger(150, [
          Animated.sequence([
            Animated.timing(dot1Anim, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(dot1Anim, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(dot2Anim, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(dot2Anim, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(dot3Anim, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(dot3Anim, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
      dotsAnimation.start();

      return () => dotsAnimation.stop();
    }

    if (variant === 'bars') {
      const barsAnimation = Animated.loop(
        Animated.stagger(100, [
          Animated.sequence([
            Animated.timing(dot1Anim, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(dot1Anim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(dot2Anim, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(dot2Anim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(dot3Anim, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(dot3Anim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
      barsAnimation.start();

      return () => barsAnimation.stop();
    }
  }, [variant, spinAnim, pulseAnim, dot1Anim, dot2Anim, dot3Anim]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const renderSpinner = () => {
    switch (variant) {
      case 'spinner':
        return (
          <Animated.View
            style={[
              styles.spinner,
              {
                width: containerSize,
                height: containerSize,
                borderColor: `${color}20`,
                borderTopColor: color,
                borderWidth: Math.max(2, containerSize / 10),
                transform: [{ rotate: spin }],
              },
            ]}
          />
        );

      case 'pulse':
        return (
          <Animated.View
            style={[
              styles.pulse,
              {
                width: containerSize,
                height: containerSize,
                backgroundColor: color,
                transform: [{ scale: pulseAnim }],
              },
            ]}
          />
        );

      case 'dots':
        const dotSize = containerSize / 4;
        return (
          <View style={styles.dotsContainer}>
            <Animated.View
              style={[
                styles.dot,
                {
                  width: dotSize,
                  height: dotSize,
                  backgroundColor: color,
                  opacity: dot1Anim,
                },
              ]}
            />
            <Animated.View
              style={[
                styles.dot,
                {
                  width: dotSize,
                  height: dotSize,
                  backgroundColor: color,
                  opacity: dot2Anim,
                },
              ]}
            />
            <Animated.View
              style={[
                styles.dot,
                {
                  width: dotSize,
                  height: dotSize,
                  backgroundColor: color,
                  opacity: dot3Anim,
                },
              ]}
            />
          </View>
        );

      case 'bars':
        const barWidth = containerSize / 6;
        const barHeight = containerSize;
        return (
          <View style={styles.barsContainer}>
            <Animated.View
              style={[
                styles.bar,
                {
                  width: barWidth,
                  height: barHeight,
                  backgroundColor: color,
                  transform: [
                    {
                      scaleY: dot1Anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.3, 1],
                      }),
                    },
                  ],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.bar,
                {
                  width: barWidth,
                  height: barHeight,
                  backgroundColor: color,
                  transform: [
                    {
                      scaleY: dot2Anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.3, 1],
                      }),
                    },
                  ],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.bar,
                {
                  width: barWidth,
                  height: barHeight,
                  backgroundColor: color,
                  transform: [
                    {
                      scaleY: dot3Anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.3, 1],
                      }),
                    },
                  ],
                },
              ]}
            />
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, style]}>
      {renderSpinner()}
      {text && (
        <Text
          style={[
            styles.text,
            { color, fontSize: size === 'small' ? 12 : size === 'medium' ? 14 : 16 },
          ]}
          accessibilityLabel={`Loading: ${text}`}
        >
          {text}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    borderRadius: 1000,
  },
  pulse: {
    borderRadius: 1000,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  dot: {
    borderRadius: 1000,
    marginHorizontal: 2,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    width: '100%',
    height: '100%',
  },
  bar: {
    marginHorizontal: 1,
    borderRadius: 2,
  },
  text: {
    marginTop: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default LoadingSpinner;