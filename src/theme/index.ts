export const colors = {
  // Primary colors
  primary: '#2E7D32',
  primaryLight: '#4CAF50',
  primaryDark: '#1B5E20',

  // Secondary colors
  secondary: '#FF9800',
  secondaryLight: '#FFB74D',
  secondaryDark: '#F57C00',

  // Accent colors
  accent: '#2196F3',

  // Background colors
  background: {
    default: '#F5F5F5',
    white: '#FFFFFF',
    secondary: '#F8F8F8',
    tertiary: '#EEEEEE',
  },

  // Text colors
  text: {
    primary: '#212121',
    secondary: '#757575',
    disabled: '#BDBDBD',
    white: '#FFFFFF',
  },

  // Status colors
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',

  // Border colors
  border: {
    light: '#E0E0E0',
    medium: '#BDBDBD',
    dark: '#757575',
  },

  // Shadow
  shadow: '#000000',

  // Transparent
  transparent: 'transparent',
};

export const typography = {
  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },

  // Font weights
  fontWeight: {
    light: '300' as const,
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.8,
  },

  // Letter spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  },

  // Text styles
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 1.2,
    color: colors.text.primary,
  },

  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 1.3,
    color: colors.text.primary,
  },

  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 1.4,
    color: colors.text.primary,
  },

  body1: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 1.5,
    color: colors.text.primary,
  },

  body2: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 1.5,
    color: colors.text.secondary,
  },

  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 1.4,
    color: colors.text.secondary,
  },

  button: {
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 1.2,
    color: colors.text.white,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};

export const shadows = {
  none: {
    shadowColor: colors.transparent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },

  sm: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1,
    elevation: 1,
  },

  md: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  lg: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },

  xl: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 16,
  },
};

export const breakpoints = {
  phone: 0,
  tablet: 768,
  desktop: 1024,
};

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modal: 1040,
  popover: 1050,
  tooltip: 1060,
  toast: 1070,
};
