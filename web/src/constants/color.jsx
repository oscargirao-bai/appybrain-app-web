// Centralized color tokens for the whole app
// ----------------------------------------------------------------------------
// Goals of this improved palette:
// 1. Provide a richer semantic set (card, surface, border, muted, onPrimary, etc.)
// 2. Improve accessible contrast (WCAG AA for most text sizes)
// 3. Keep brand identity: energetic yellow (primary), sky blue (secondary), playful purple (accent)
// 4. Offer subtle elevation layers (surface, card) & consistent translucent overlays
// 5. Avoid hard‑coding hexes elsewhere – ALWAYS 
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
