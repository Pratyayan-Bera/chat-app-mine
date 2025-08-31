import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  define: {
    global: 'globalThis',
    'process.env': {},
    'process.nextTick': '((fn, ...args) => setTimeout(() => fn(...args), 0))',
    'process.browser': 'true',
  },
  resolve: {
    alias: {
      events: 'events',
      util: 'util',
      buffer: 'buffer',
      process: 'process/browser',
      stream: 'readable-stream',
    },
  },
});
