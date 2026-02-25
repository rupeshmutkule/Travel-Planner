import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import viteCompression from 'vite-plugin-compression'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [
      react({
        babel: {
          plugins: [['babel-plugin-react-compiler']],
        },
      }),
      // Gzip compression for production
      viteCompression({
        algorithm: 'gzip',
        ext: '.gz',
        threshold: 1024, // Only compress files > 1KB
        deleteOriginFile: false,
      }),
      // Brotli compression for modern browsers
      viteCompression({
        algorithm: 'brotliCompress',
        ext: '.br',
        threshold: 1024,
        deleteOriginFile: false,
      }),
    ],
    server: {
      host: true,
      proxy: {
        '/api': {
          target: env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001',
          changeOrigin: true,
        },
      },
    },
    build: {
      target: 'es2020',
      minify: 'esbuild',
      cssMinify: true,
      
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'router': ['react-router-dom'],
          },
          // Optimize chunk names for better caching
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        },
      },
      
      // Inline small assets as base64 to reduce requests
      assetsInlineLimit: 4096,
      
      // Enable CSS code splitting
      cssCodeSplit: true,
      
      // Disable source maps for production
      sourcemap: false,
      
      // Optimize chunk size
      chunkSizeWarningLimit: 1000,
      
      // Enable module preload polyfill
      modulePreload: {
        polyfill: true,
      },
      
      // Report compressed size
      reportCompressedSize: true,
    },
    
    // Optimize dependencies
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
      exclude: [],
    },
  }
})
