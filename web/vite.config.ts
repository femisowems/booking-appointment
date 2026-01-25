import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://booking-appointment-backend-production.up.railway.app',
        changeOrigin: true,
        // If the backend expects /api prefix, keeping it is fine.
        // If backend expects /appointments, we might need rewrite.
        // My server.go handles /api/appointments, so no rewrite needed.
      }
    }
  }
})
