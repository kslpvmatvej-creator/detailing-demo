import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Относительный базовый путь './' работает везде: на github.io/<репозиторий>/, на своём домене и локально.
// При желании его можно задать явно через VITE_BASE (например, '/detailing-demo/').
const rawBase = process.env.VITE_BASE || './'
const base = rawBase === './' || rawBase.endsWith('/') ? rawBase : `${rawBase}/`

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
})
