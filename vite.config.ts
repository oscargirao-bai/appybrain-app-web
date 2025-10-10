import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Polyfills: React Native packages sometimes reference process.env
const defineEnv = {
  'process.env': {},
};

export default defineConfig({
  plugins: [react()],
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    sourcemap: true,
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
