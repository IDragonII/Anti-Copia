import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    https: {
      key: readFileSync(resolve(__dirname, 'certs/localhost-key.pem')),
      cert: readFileSync(resolve(__dirname, 'certs/localhost.pem')),
    },
  },
})
