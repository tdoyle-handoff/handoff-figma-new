import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['react', 'react-dom', 'sonner', 'clsx', 'tailwind-merge'],
  },
  resolve: {
    alias: [
      // Support imports like "@/..." from src
      { find: /^@\//, replacement: `${path.resolve(__dirname, 'src')}/` },
      // Fallback: allow "@/..." to resolve from project root (components, utils, hooks, etc.)
      { find: /^@root\//, replacement: `${path.resolve(__dirname, '.')}/` },
    ],
  },
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
  },
})

