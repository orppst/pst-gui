import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({

  plugins: [react()],
  resolve: {
    alias: {
      src: resolve('src/')
    },
  },
  build: {

    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        tool: resolve(__dirname, 'tool/index.html'),
      },
    },
  },
})
