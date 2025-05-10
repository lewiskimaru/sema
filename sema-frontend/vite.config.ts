import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Build configuration to skip TypeScript type checking
  build: {
    minify: 'esbuild',
    sourcemap: false,
    target: 'es2015',
  }
})
