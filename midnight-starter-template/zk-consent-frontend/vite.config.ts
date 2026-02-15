import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    wasm(),
    topLevelAwait()
  ],
  resolve: {
    alias: {
      buffer: 'buffer',
      events: 'events',
    }
  },
  define: {
    'process.env': {}, // Polyfill for some libs
    // 'global': 'window', // Sometimes needed, but can break others. Use carefully.
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
  optimizeDeps: {
    include: [
      'object-inspect',
      'buffer',
      'events',
      '@midnight-ntwrk/midnight-js-contracts',
      '@midnight-ntwrk/midnight-js-level-private-state-provider',
      '@midnight-ntwrk/compact-runtime',
    ],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  assetsInclude: ['**/*.wasm'],
  build: {
    target: 'esnext'
  }
})
