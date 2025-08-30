import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: keyof typeof spacing;
  shadow?: keyof typeof shadows;
  borderRadius?: keyof typeof borderRadius;
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = 'lg',
  shadow = 'sm',
  borderRadius: borderRadiusSize = 'md',
}) => {
  return (
    <View
      style={[
        styles.card,
        {
          padding: spacing[padding],
          borderRadius: borderRadius[borderRadiusSize],
          ...shadows[shadow],
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.white,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
});

export default Card;
