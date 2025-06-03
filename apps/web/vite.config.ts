import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import * as path from "node:path";

// Define __dirname for ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@ui': path.resolve(__dirname, '../../packages/ui/src'),
    },
  },
  // Add this to ensure node built-ins are properly handled
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
      plugins: [
        // NodeGlobalsPolyfillPlugin({
        //   process: true,
        //   buffer: true
        // }),
      ]
    }
  }

})
