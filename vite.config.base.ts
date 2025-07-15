import { defineConfig } from 'vite';
import { resolve } from 'node:path';

const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig({
  build: {
    target: 'esnext',
    minify: isProduction,
    sourcemap: !isProduction,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});