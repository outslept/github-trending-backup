import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['cli.ts', 'index.ts'],
  format: ['esm'],
  target: 'esnext',
  clean: true,
  sourcemap: true,
  minify: false,
  dts: true,
  outDir: 'dist',
  treeshake: true,
  platform: 'node',
  publint: true,
})
