import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tanstackRouter(), react(), tailwindcss()],
  server: {
    port: 3000,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          'tanstack-router': ['@tanstack/react-router'],
          'tanstack-query': ['@tanstack/react-query'],
          'tanstack-table': [
            '@tanstack/react-table',
            '@tanstack/react-virtual',
          ],
          ui: ['class-variance-authority', 'clsx', 'tailwind-merge'],
          icons: ['lucide-react'],
          radix: ['radix-ui'],
          calendar: ['react-day-picker'],
          themes: ['next-themes'],
          utils: ['react-error-boundary'],
        },
      },
    },
  },
});
