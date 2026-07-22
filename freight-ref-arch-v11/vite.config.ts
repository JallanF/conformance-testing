import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// Path alias '@' maps to './src'
// This allows clean imports like:
//   import { useAuth } from '@/shared/hooks/useAuth'
// instead of:
//   import { useAuth } from '../../shared/hooks/useAuth'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
