import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { host: '127.0.0.1', proxy: { '/api': process.env.API_PROXY_TARGET || 'http://127.0.0.1:8080' } },
  preview: { host: '127.0.0.1', proxy: { '/api': process.env.API_PROXY_TARGET || 'http://127.0.0.1:8080' } },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setup.js',
    include: ['tests/**/*.test.{js,jsx}'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/main.jsx'],
      reporter: ['text', 'html'],
    },
  },
});
