import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  // 自定义域名部署在根路径；仅 github.io/仓库名 子路径时才需要 /pictureshow/
  base: process.env.GITHUB_PAGES === 'true' ? '/pictureshow/' : '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
