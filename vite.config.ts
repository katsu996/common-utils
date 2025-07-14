// common-utils-repo/vite.config.ts
import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        math: resolve(__dirname, 'src/math.ts'),
        string: resolve(__dirname, 'src/string.ts'),
      },
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: [],
      output: {
        entryFileNames: (chunkInfo) => {
          return `${chunkInfo.name}.${chunkInfo.format === 'es' ? 'mjs' : 'js'}`;
        },
      },
    },
  },
});
