import { defineConfig } from 'tsdown'

export default defineConfig([
  {
    entry: ['index.ts'],
    format: ['esm'],
    target: 'esnext',
    clean: false,
    sourcemap: true,
    minify: false,
    dts: {
      sourcemap: true,
      resolve: true,
    },
    outDir: 'dist',
    treeshake: true,
    platform: 'node',
    publint: true,
  },
])
