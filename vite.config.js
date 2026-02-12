import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/exoplanet-api': {
        target: 'https://exoplanetarchive.ipac.caltech.edu',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/exoplanet-api/, ''),
      },
    },
  },
})
