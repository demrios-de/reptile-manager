import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  base: './',   // relative paths — required for HA Ingress
  resolve: {
    alias: { '@': resolve(__dirname, 'src') }
  }
})
