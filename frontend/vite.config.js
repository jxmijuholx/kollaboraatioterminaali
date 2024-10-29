import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  server: {
//     proxy: {
//       '/auth': {
//         target: 'http://localhost:8080',
//         changeOrigin: true,
//       },
//       '/ws': {
//         target: 'http://localhost:8080',
//         changeOrigin: true,
//         ws: true,
//   },
// },
  },
})
