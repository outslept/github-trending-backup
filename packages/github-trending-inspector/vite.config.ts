import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    tanstackRouter({
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          router: ['@tanstack/react-router'],
          query: ['@tanstack/react-query'],
          table: ['@tanstack/react-table', '@tanstack/react-virtual'],
          calendar: ['react-day-picker'],
          radix: ['radix-ui'],
          ui: ['class-variance-authority', 'clsx', 'tailwind-merge'],
          icons: ['lucide-react'],
          themes: ['next-themes'],
          utils: ['react-error-boundary'],
        },
      },
    },
  },
})
