import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Relative base so the built assets resolve correctly when the app is served
  // from a sub-path (e.g. GitHub Pages: /D-Cancer-Screening-Dashboard/).
  base: './',
  plugins: [react()],
})
