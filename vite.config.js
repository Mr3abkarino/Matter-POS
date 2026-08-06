import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import pkg from './package.json'

export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  build: {
    rollupOptions: {
      output: {
        // إضافة الهاش لأسماء الملفات لتفادي الكاش
        entryFileNames: `assets/[name].${pkg.version}.[hash].js`,
        chunkFileNames: `assets/[name].${pkg.version}.[hash].js`,
        assetFileNames: `assets/[name].${pkg.version}.[hash].[ext]`
      }
    }
  }
})
