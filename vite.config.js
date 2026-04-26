import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  server: {
    proxy: {
      // Proxy /yf/* → https://query1.finance.yahoo.com/*
      // This sidesteps the CORS block that Yahoo Finance applies to browser requests.
      '/yf': {
        target: 'https://query1.finance.yahoo.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/yf/, ''),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        },
      },
    },
  },
})
