// Centralized color tokens for the whole app
// ----------------------------------------------------------------------------
// Goals of this improved palette:
// 1. Provide a richer semantic set (card, surface, border, muted, onPrimary, etc.)
// 2. Improve accessible contrast (WCAG AA for most text sizes)
// 3. Keep brand identity: energetic yellow (primary), sky blue (secondary), playful purple (accent)
// 4. Offer subtle elevation layers (surface, card) & consistent translucent overlays
// 5. Avoid hard‑coding hexes elsewhere – ALWAYS import from this module

// NOTES:
// - "card" is used for elevated panels / modals.
// - "surface" is a slightly higher elevation than background but lower than card.
// - "border" is a neutral outline color tuned per theme.
// - "muted" is for secondary text.
// - "onX" denotes legible text/icon color placed ON that color.
// - Keep alpha manipulations outside (components already add +"22" etc.).

// Dark palette (baseline)
export const colorsDark = {
  // Core backgrounds / text
  background: '#0E131A',      // Deep desaturated navy/graphite – softer than pure black
  surface: '#17202A',         // Slight elevation 1
  card: '#1E2A35',            // Elevation 2 (panels, modals)
  border: '#2D3A46',          // Neutral outline
  text: '#F5F7FA',            // High contrast primary text
  muted: '#8C98A8',           // Secondary text

  // Brand & semantic
  primary: '#F9E547',         // Brand yellow (vibrant but readable on dark)
  secondary: '#59B3FF',       // Sky blue CTA / highlights
  accent: '#C792EA',          // Playful purple accent
  error: '#FF5F56',           // Alert red tuned for dark
  correct: '#33D087',         // Success green
  warning: '#FFB347',         // Optional warning / amber
  info: '#4DB9FF',            // Informational cyan

  // On-colors (foregrounds placed against fills)
  onPrimary: '#1F1A00',       // Dark text on yellow
  onSecondary: '#041018',     // Dark navy on light blue
  onAccent: '#1B0F23',        // Deep purple-black
  onError: '#FFFFFF',         // White on error background
  onCorrect: '#062015',       // Deep green text for badges (if needed)

  // Utility / extras
  shadow: '#000000',
  focus: '#F9E547',
  outline: '#59B3FF',
  backdrop: '#0E131A',        // Base for dimmed modals (add alpha in component)
  gradientPrimary: ['#F9E547', '#FFCA28'],
  gradientSecondary: ['#59B3FF', '#2F7FD9'],
};

// Light palette
export const colorsLight = {
  background: '#FFFDF5',      // Soft warm near-white (reduces eye strain vs pure #FFF)
  surface: '#F5F7FA',         // Light grey-blue surface (cards on background)
  card: '#FFFFFF',            // Highest elevation / sheets
  border: '#E2E8F0',          // Subtle neutral border
  text: '#1A202C',            // Primary dark text
  muted: '#5F6B7A',           // Secondary text

  primary: '#FFE14D',         // Brand yellow balanced for light mode
  secondary: '#339DFF',       // More saturated sky blue to hold contrast on light
  accent: '#B052F7',          // Vivid purple accent
  error: '#E53935',           // Material-like red
  correct: '#2EAC6D',         // Balanced success green
  warning: '#FF9800',         // Warning amber
  info: '#1E88E5',            // Info blue

  onPrimary: '#2B2400',       // Legible dark over yellow
  onSecondary: '#FFFFFF',     // White on saturated blue
  onAccent: '#FFFFFF',        // White on purple
  onError: '#FFFFFF',
  onCorrect: '#FFFFFF',

  shadow: '#000000',
  focus: '#339DFF',
  outline: '#FFE14D',
  backdrop: '#0E131A',        // Keep same dark base for consistency (alpha added per use)
  gradientPrimary: ['#FFE14D', '#FFCA28'],
  gradientSecondary: ['#339DFF', '#1E88E5'],
};

// Helper to access a palette by theme name
export const getColorsForTheme = (theme = 'dark') => (theme === 'light' ? colorsLight : colorsDark);

// Backward-compatible named export (previously some modules imported { colors })
export const colors = colorsDark;

export default colorsDark;
