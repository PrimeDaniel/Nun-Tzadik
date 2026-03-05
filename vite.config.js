import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Allow importing .geojson files as JSON modules
    {
      name: 'geojson',
      transform(code, id) {
        if (id.endsWith('.geojson')) {
          return `export default ${code}`
        }
      },
    },
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-map': ['leaflet', 'react-leaflet'],
          'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'vendor-motion': ['framer-motion'],
        },
      },
    },
  },
})
