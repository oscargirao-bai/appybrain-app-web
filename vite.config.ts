import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const BUILD_ID = 'pure-' + Date.now();

console.log('🔨 Building PURE REACT version with ID:', BUILD_ID);

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
    }),
  ],
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'esbuild',
  },
  resolve: {
    alias: {
      '@react-native-async-storage/async-storage': path.resolve(__dirname, './src/services/storage-shim.js'),
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    __BUILD_ID__: JSON.stringify(BUILD_ID),
  },
  server: {
    port: 5173,
    open: false,
  },
});
