import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        // اقتصار البحث على الملفات الأساسية المضمون وجودها لتفادي تحذيرات globPatterns
        globPatterns: ['**/*.{js,css,html}']
      },
      manifest: {
        name: 'دريم كورنر POS',
        short_name: 'DreamCorner',
        description: 'نظام إدارة نقاط البيع والمبيعات',
        theme_color: '#4f46e5',
        background_color: '#f8fafc',
        display: 'standalone'
      }
    })
  ]
});
