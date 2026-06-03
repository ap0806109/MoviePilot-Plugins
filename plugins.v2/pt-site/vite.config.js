import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import federation from '@originjs/vite-plugin-federation'
import path from 'path'

export default defineConfig({
  plugins: [
    vue(),
    federation({
      name: 'ptsite',
      filename: 'remoteEntry.js',
      exposes: {
        './AppPage': './src/components/AppPage.vue',
      },
      shared: ['vue', 'vuetify'],
    }),
  ],
  build: {
    target: 'esnext',
    minify: false,
    modulePreload: false,
    rollupOptions: {
      output: {
        format: 'esm',
        dir: 'dist/assets',
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
})
