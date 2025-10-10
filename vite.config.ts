import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';

// Polyfills: React Native packages sometimes reference process.env
const defineEnv = {
  'process.env': {},
  __BUILD_ID__: JSON.stringify(Date.now().toString()),
};

export default defineConfig({
  plugins: [
  // Allow importing SVGs as React components; export default
  svgr({ svgrOptions: { exportType: 'default' } }),
    {
      name: 'rn-web-jsx-pre',
      enforce: 'pre',
      async transform(code, id) {
        // Normalize path and strip Vite query (e.g., ?v=hash)
        const norm = id.replace(/\\/g, '/');
        const cleanId = norm.split('?')[0];
        const isSrcJs = cleanId.includes('/src/') && cleanId.endsWith('.js');
        const isExpoLinearGradient = cleanId.includes('/node_modules/expo-linear-gradient/') && cleanId.endsWith('.js');
        if (!isSrcJs && !isExpoLinearGradient) return null;
        const { transform } = await import('esbuild');
        const result = await transform(code, { loader: 'jsx', jsx: 'automatic', sourcemap: false });
        return { code: result.code };
      },
    },
    react({
      jsxRuntime: 'automatic',
      include: [
        /\/src\/.*\.[jt]sx?$/,
      ],
    }),
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
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
        '.ts': 'ts',
        '.tsx': 'tsx',
      },
    },
    exclude: ['react-native-gesture-handler', 'react-native-screens'],
  },
  ssr: { noExternal: [] },
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
