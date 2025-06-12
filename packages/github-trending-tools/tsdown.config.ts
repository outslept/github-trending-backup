import { defineConfig } from 'tsdown'

export default defineConfig(
  {
    entry: ['index.ts'],
    format: ['esm'],
    dts: false,
    target: 'esnext',
    sourcemap: true,
    outDir: 'dist',
    treeshake: true,
    platform: 'node',
    publint: true,
  },
)
