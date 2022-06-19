import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import WindiCSS from 'vite-plugin-windicss'
import forms from 'windicss/plugin/forms'

export default defineConfig({
  plugins: [solidPlugin(), WindiCSS({
    plugins: [forms]
  })],
  build: {
    target: 'esnext',
    polyfillDynamicImport: false,
  },
  // server: {
  //   proxy: {
  //     '/ws': {
  //       target: 'ws://localhost:1234',
  //       ws: true
  //     }
  //   }
  // }
});
