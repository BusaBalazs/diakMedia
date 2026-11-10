import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite's dev and preview servers fall back to index.html, so refreshing a nested route works.
export default defineConfig({
  plugins: [react()],
});
