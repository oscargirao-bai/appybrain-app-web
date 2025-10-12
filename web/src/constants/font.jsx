

// Work Sans font family for web
export const WORK_SANS_REGULAR = 'Work Sans';
export const WORK_SANS_MEDIUM = 'Work Sans';
export const WORK_SANS_SEMIBOLD = 'Work Sans';
export const WORK_SANS_BOLD = 'Work Sans';

export const family = {
  regular: WORK_SANS_REGULAR,
  medium: WORK_SANS_MEDIUM,
  semibold: WORK_SANS_SEMIBOLD,
  bold: WORK_SANS_BOLD,
  mono: 'monospace',
};

// Keep weights for building the font styles
const weights = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

// Base sizes
const sizeMap = {
  big: 44,
  medium: 22,
  small: 16,
};

// Helper: compute pixel lineHeight
const lh = (fontSize, ratio) => Math.round(fontSize * ratio);

// Define the 3 font styles
export const header = {
  fontSize: sizeMap.big,
  fontWeight: weights.bold,
  fontFamily: family.bold,
  // -2% letter spacing for headers
  letterSpacing: -0.02 * sizeMap.big,
};

export const normal = {
  fontSize: sizeMap.medium,
  fontWeight: weights.regular,
  fontFamily: family.regular,
};

export const small = {
  fontSize: sizeMap.small,
  fontWeight: weights.regular,
  fontFamily: family.regular,
};

// Text shadow presets for legibility on imagery
export const shadows = {
  none: {},
  soft: {
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  strong: {
    textShadowColor: 'rgba(0,0,0,0.85)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  glow: (color = 'rgba(255,255,255,0.9)') => ({
    textShadowColor: color,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  }),
};

// Grouped export for convenience
export const fonts = { header, normal, small };

export default {
  family,
  fonts,
  shadows,
};
