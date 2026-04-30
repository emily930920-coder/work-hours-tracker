import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    // 暂时禁用 PWA 以避免构建问题
    // 部署成功后可以重新启用
    // VitePWA({
    //   registerType: 'autoUpdate',
    //   includeAssets: ['favicon.ico'],
    //   manifest: {
    //     name: '工时记录系统',
    //     short_name: '工时记录',
    //     description: '高效的工时跟踪和管理系统',
    //     theme_color: '#3b82f6',
    //     background_color: '#ffffff',
    //     display: 'standalone',
    //     icons: [
    //       {
    //         src: '/icon-192.svg',
    //         sizes: '192x192',
    //         type: 'image/svg+xml'
    //       },
    //       {
    //         src: '/icon-512.svg',
    //         sizes: '512x512',
    //         type: 'image/svg+xml'
    //       }
    //     ]
    //   }
    // })
  ],
  server: {
    port: 5173,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  build: {
    sourcemap: false,
    minify: 'esbuild',
    chunkSizeWarningLimit: 1000
  }
});
