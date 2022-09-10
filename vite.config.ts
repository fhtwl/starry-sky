import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import Components from 'unplugin-vue-components/vite';
import vueJsx from '@vitejs/plugin-vue-jsx';
import viteCompression from 'vite-plugin-compression';
import { createHtmlPlugin } from 'vite-plugin-html';
import { version } from './package.json';
import config from './src/config/defaultSettings';

function resolve(url: string): string {
  return path.resolve(__dirname, url);
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    // 按需加载
    Components({
      include: [/\.vue$/, /\.tsx$/],
      resolvers: [],
    }),
    viteCompression(),
    createHtmlPlugin({
      inject: {
        data: {
          title: config.title,
          description: config.description,
          version,
        },
      },
    }),
  ],
  resolve: {
    alias: {
      '@': resolve('./src'),
      '~@': resolve('./src'),
    },
    // 省略文件后缀
    extensions: ['.js', '.ts', '.json', '.jsx', '.tsx'],
  },
  // 声明node变量
  define: {
    'process.env': {},
  },
  css: {
    preprocessorOptions: {
      less: {
        // 全局添加less
        additionalData: `@import '@/assets/styles/common/var.less';`,
        javascriptEnabled: true,
      },
    },
  },
  build: {
    outDir: './dist',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // 块大小警告大小限制(kb)
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // 分解大块js,
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return id
              .toString()
              .split('node_modules/')[1]
              .split('/')[0]
              .toString();
          }
        },
      },
    },
  },
  server: {
    port: 8001,
    proxy: {
      '/api': {
        target: 'http://1.116.40.155:9002/',
        ws: false,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api/v1'),
      },
      '/resource': {
        target: 'https://static.fhtwl.cc',
        ws: false,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/resource/, ''),
      },
      '/socket.io': {
        target: 'ws://localhost:9003/',
        ws: true,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/socket.io/, '/socket.io/im/'),
      },
    },
  },
});
