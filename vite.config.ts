import Vue from '@vitejs/plugin-vue';
import VueJSX from '@vitejs/plugin-vue-jsx';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import Dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [Dts({ outputDir: 'dist/types' }), Vue(), VueJSX()],
  test: {
    coverage: { provider: 'c8', include: ['src'], reporter: ['text', 'lcov', 'html', 'clover', 'json'] },
    environment: 'happy-dom',
    globals: true,
  },
  build: {
    sourcemap: 'inline',
    minify: false,
    lib: {
      entry: resolve(__dirname, 'src/alfred-form.ts'),
      name: 'alfred-form',
    },
    rollupOptions: {
      // see: https://vitejs.dev/guide/build.html#library-mode
      // define external dependencies here
      external: ['vue', '@inertiajs/vue3'],
      output: {
        globals: { vue: 'vue', '@inertiajs/vue3': 'inertiaVue3' },
      },
    },
  },
});
