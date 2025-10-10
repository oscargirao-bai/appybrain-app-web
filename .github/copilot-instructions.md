# AppyBrain Web - AI Coding Agent Instructions

## Project Overview
React Native Expo app being adapted for web deployment using **React Native Web + Vite**. The codebase contains both mobile (React Native) and web-specific implementations.

## Critical Architecture Patterns

### Dual-Platform File Resolution
- **Web files take precedence**: `*.web.js` → `*.js` (configured in `vite.config.ts` extensions)
- Mobile screens use `navigation` prop; web screens use `onNavigate` callback
- Example: `LoginScreen.js` (mobile) vs `LoginScreen.web.js` (web with no SafeAreaView/Alert)

### Web-Specific Entry Points
- **Mobile**: `App.js` → `AppRouter.js` (React Navigation)
- **Web**: `src/web/main.jsx` → `App.web.minimal.jsx` → `WebAppRouter.jsx` (state-based routing)
- No `@react-navigation` on web - simple switch/case router with `useState`

### Native Module Shimming
All React Native-specific modules must be shimmed for web:
- `src/services/ApiManager.web.js` - uses AsyncStorage only (no SecureStore)
- `src/web/shims/merge-options.js` - replaces problematic CommonJS module
- `src/components/LoginComponents/*.web.js` - replaces @react-native-vector-icons with emojis

### API Communication
- **ApiManager** (`src/services/ApiManager.js`):
  - Singleton with `init({ baseUrl })` - MUST be called before use
  - Sequential request queue to handle token refresh safely
  - Auto token refresh on 401 responses
  - Web version excludes `expo-secure-store`, uses only `AsyncStorage`

### Theme & Translation Services
- **ThemeProvider** (`src/services/Theme.js`):
  - Context-based dark/light/system theme
  - `useThemeColors()` hook provides color palette
  - Persists to AsyncStorage
  
- **TranslationProvider** (`src/services/Translate.js`):
  - Fixed to Portuguese (`pt.json`)
  - `useTranslate()` provides `translate(key, vars)` function
  - Key format: dot-notation (`'login.email'`)

## Build & Development Commands

```bash
# Web development (Vite)
npm run dev:vite          # Dev server at localhost:5173
npm run build:vite        # Production build to dist/
npm run preview:vite      # Preview production build

# Mobile (Expo)
npm start                 # Expo dev server
npm run android/ios       # Platform-specific
```

### Vite Configuration Essentials
- **JSX in .js files**: Custom `rn-web-jsx-pre` plugin transforms JSX before React plugin
- **Excluded deps**: React Native packages in `optimizeDeps.exclude` to prevent bundling errors
- **Aliases**: Force web implementations via resolve.alias (see `vite.config.ts`)
- **BUILD_ID**: Unique timestamp for cache busting

## Component Development Rules

### When Creating Web Components
1. **Check for `.web.js` version first** - don't modify mobile files
2. **Replace native-only APIs**:
   - `SafeAreaView` → `View`
   - `Alert.alert()` → `window.alert()` (with Platform check)
   - `@react-native-vector-icons` → emoji or SVG
3. **Navigation pattern**:
   ```jsx
   // Mobile: navigation.navigate('Screen')
   // Web: onNavigate?.('Screen')
   ```

### File Size Limits
- Target: < 200 lines per file
- Split large screens into sub-components in same directory

### Translation Pattern
```jsx
import { useTranslate } from '../../services/Translate';

function Component() {
  const { translate } = useTranslate();
  return <Text>{translate('common.save')}</Text>;
}
```

## Common Pitfalls

### ❌ Don't
- Import `@react-navigation` in web files
- Use `expo-secure-store` on web
- Assume `navigation` prop exists in web screens
- Import native vector icons directly

### ✅ Do
- Create `.web.js` variants for components with native dependencies
- Use `ApiManager.init()` in App entry before any API calls
- Check Platform.OS === 'web' for conditional web logic
- Add new native deps to `optimizeDeps.exclude` in vite.config

## Key Files Reference
- `vite.config.ts` - Web build configuration, aliases, shimming
- `src/services/ApiManager.web.js` - Web-safe API client
- `src/WebAppRouter.jsx` - Simple state-based web navigation
- `src/web/shims/` - CommonJS module replacements for web
- `App.web.minimal.jsx` - Web app entry point

## Testing Web Changes Locally
1. Clear Vite cache: `rm -rf node_modules/.vite`
2. Start dev: `npm run dev:vite`
3. Hard refresh browser: Ctrl+Shift+R (Win) / Cmd+Shift+R (Mac)
4. Check console for BUILD_ID to confirm fresh bundle
