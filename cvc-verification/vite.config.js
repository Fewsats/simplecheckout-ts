import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copyFileSync } from 'fs';

export default defineConfig(({ mode }) => {
  const config = {
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
      alias: {}
    },
    plugins: [
      {
        name: 'copy-verification-success',
        writeBundle() {
          copyFileSync('./verification-success.html', './dist/verification-success.html');
        }
      }
    ]
  };

  if (mode === 'development') {
    config.resolve.alias = {
      'smartcheckout-sdk': resolve(__dirname, '../src/SmartCheckout.ts')
    };
  }

  return config;
});
