import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  server: {
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Target modern browsers only — smaller output, no legacy polyfills
    target: 'es2020',
    // Aggressive minification
    minify: 'esbuild',
    // Split vendor chunks so React/router cache separately from app code
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
        },
      },
    },
    // Reduce CSS code-split threshold → inline small CSS
    cssCodeSplit: true,
    // Enable source maps only for debugging, disable for production
    sourcemap: false,
  },
})
