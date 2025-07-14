import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        math: resolve(__dirname, 'src/math.ts'),
      },
      formats: ['cjs'],
    },
    rollupOptions: {
      external: [],
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
      },
    },
    minify: false,
    sourcemap: true,
  },
});
