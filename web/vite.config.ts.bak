import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true,
    minify: false, // DEBUG: desativar minify para ver erros completos
    rollupOptions: {
      output: {
        manualChunks: undefined // Evitar code splitting para debug
      }
    }
  },
  server: {
    port: 5173
  }
});
