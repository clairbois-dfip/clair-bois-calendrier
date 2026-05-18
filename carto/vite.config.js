import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Configuration Vite pour le projet Cartographie Clair Bois
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})
