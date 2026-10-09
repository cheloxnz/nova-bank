import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Se publica en https://cheloxnz.github.io/nova-bank/
export default defineConfig({
  plugins: [vue()],
  base: '/nova-bank/',
})
