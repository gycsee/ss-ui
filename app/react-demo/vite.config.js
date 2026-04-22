import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: '@cardinal-odp/algo-params-react/style.css',
        replacement: fileURLToPath(
          new URL('../../packages/algo-params-react/src/style.css', import.meta.url),
        ),
      },
      {
        find: /^@cardinal-odp\/algo-params-react$/,
        replacement: fileURLToPath(
          new URL('../../packages/algo-params-react/src/index.mjs', import.meta.url),
        ),
      },
      {
        find: /^@cardinal-odp\/packing-3d-react$/,
        replacement: fileURLToPath(
          new URL('../../packages/packing-3d-react/src/index.ts', import.meta.url),
        ),
      },
    ],
  },
});
