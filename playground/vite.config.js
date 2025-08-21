import { defineConfig } from 'vite';
import { resolve } from 'path';

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
    }
  };

  // For local development, point the SDK to the local source code
  // to enable hot-reloading and instant updates.
  if (mode === 'development') {
    config.resolve.alias = {
      'smartcheckout-sdk': resolve(__dirname, '../src/SmartCheckout.ts')
    };
  }

  // For production builds, Vite will use the version from node_modules,
  // as defined in package.json, because no alias is provided.
  return config;
}); 