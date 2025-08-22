import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/demo-map/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
  },
})
