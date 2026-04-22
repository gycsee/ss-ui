import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  dts: true,
  entry: ['src/index.ts'],
  external: [
    'react',
    'react-dom',
    'three',
    '@react-three/fiber',
    '@react-three/drei',
  ],
  format: ['esm'],
  outDir: 'dist',
  outExtension() {
    return {
      js: '.mjs',
    };
  },
  sourcemap: true,
  splitting: false,
  treeshake: true,
});
