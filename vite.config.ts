import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue({
      script: {
        defineModel: true,
        propsDestructure: true
      }
    }),
    tailwindcss()
  ],
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@views':'/src/views',
      '@lib':'/src/lib',
      '@composables': '/src/composables',
      '@stores': '/src/stores',
      '@type': '/src/type'

    }
  }
})