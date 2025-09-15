import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  root: 'demo',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        'without-sentry': resolve(__dirname, 'without-sentry.html'),
      },
    },
  },
  server: {
    port: 3000,
    // Enable serving multiple HTML files
    open: '/',
  },
});
