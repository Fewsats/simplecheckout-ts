import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
  root: '.',
  server: {
    port: 3001,
    open: true
  },
  build: {
    outDir: 'dist',
    lib: {
      entry: resolve(__dirname, 'src/SimpleCheckout.ts'),
      name: 'SimpleCheckout',
      fileName: 'SimpleCheckout',
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
  };
});
