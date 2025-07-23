import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  server: {
    port: 3001,
    open: true
  },
  build: {
    outDir: 'dist',
    lib: {
      entry: resolve(__dirname, 'src/SmartCheckout.ts'),
      name: 'SmartCheckout',
      fileName: 'SmartCheckout',
      formats: ['es', 'umd']
    },
    rollupOptions: {
      external: ['@vgs/collect-js'],
      output: {
        globals: {
          '@vgs/collect-js': 'VGSCollect'
        }
      }
    }
  },
  optimizeDeps: {
    include: ['@vgs/collect-js']
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
}); 