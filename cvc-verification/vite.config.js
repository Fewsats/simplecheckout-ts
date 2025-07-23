import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  base: './', // Relative paths for CDN deployment
  server: {
    port: 3001,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Optimize for CDN deployment
    minify: 'terser',
    sourcemap: false, // Disable sourcemaps for production
    rollupOptions: {
      // Configure multiple HTML entry points
      input: {
        main: resolve(__dirname, 'index.html'),
        success: resolve(__dirname, 'verification-success.html')
      },
      output: {
        // Optimize chunk splitting for CDN caching
        manualChunks: {
          'vgs-collect': ['@vgs/collect-js']
        },
        // Add cache busting to filenames
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    },
    // Optimize assets
    assetsInlineLimit: 4096, // Inline small assets
    // Enable compression
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true
      }
    }
  },
  optimizeDeps: {
    include: ['@vgs/collect-js']
  }
}); 