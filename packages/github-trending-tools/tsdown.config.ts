import { defineConfig } from 'tsdown'

export default defineConfig([
  // CLI build
  {
    entry: ['cli.ts'],
    format: ['esm'],
    target: 'esnext',
    clean: true,
    sourcemap: false,
    minify: true,
    dts: false,
    outDir: 'dist',
    treeshake: true,
    platform: 'node',
    publint: false,
    outputOptions: {
      banner: '#!/usr/bin/env node',
    },
  },
  // Library build
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
