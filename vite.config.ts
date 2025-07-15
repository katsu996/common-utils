import { defineConfig, mergeConfig } from 'vite';
import { resolve } from 'node:path';
import baseConfig from './vite.config.base';

export default mergeConfig(baseConfig, defineConfig({
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
  },
}));
