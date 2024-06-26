import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/',
    },
  },
  test: {
    environment: 'jsdom',
    testTimeout: 1000 * 60,
  },
})
