import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      'sentry-zaraz-consent-integration': path.resolve(
        __dirname,
        '../src/index.ts'
      ),
    },
  },
});
