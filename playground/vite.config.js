import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  server: {
    port: 3001,
    open: false
  },
  build: {
    outDir: 'dist'
  },
  optimizeDeps: {
    include: ['@vgs/collect-js']
  },
  resolve: {
    // Note: use this for local development
    // alias: {
    //   '../dist/SmartCheckout.js': resolve(__dirname, '../src/SmartCheckout.ts')
    // }
  }
}); 