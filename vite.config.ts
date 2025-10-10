import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';

// Polyfills: React Native packages sometimes reference process.env
const defineEnv = {
  'process.env': {},
};

export default defineConfig({
  plugins: [
    // Allow importing SVGs as React components (default export)
    svgr({ exportAsDefault: true }),
    {
      name: 'rn-web-jsx-pre',
      enforce: 'pre',
      async transform(code, id) {
        const isSrcJs = id.includes('/src/') && id.endsWith('.js');
        const isExpoLinearGradient = id.includes('/node_modules/expo-linear-gradient/') && id.endsWith('.js');
        if (!isSrcJs && !isExpoLinearGradient) return null;
        const { transform } = await import('esbuild');
        const result = await transform(code, { loader: 'jsx', jsx: 'automatic', sourcemap: false });
        return { code: result.code };
      },
    },
    react(),
  ],
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  esbuild: {
    jsx: 'automatic',
  },
  resolve: {
    alias: {
      'react-native': 'react-native-web',
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.web.tsx', '.web.ts', '.web.jsx', '.web.js', '.tsx', '.ts', '.jsx', '.js', '.json'],
  },
  define: defineEnv,
  server: {
    port: 5173,
    open: false,
  },
});
