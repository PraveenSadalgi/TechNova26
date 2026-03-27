import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    port: 3000
  },
  build: {
    rollupOptions: {
      input: {
        main:    resolve(__dirname, 'index.html'),
        auth:    resolve(__dirname, 'auth.html'),
        profile: resolve(__dirname, 'profile.html'),
        results: resolve(__dirname, 'results.html'),
      }
    }
  }
});
