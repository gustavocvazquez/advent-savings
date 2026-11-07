import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' permite desplegar la app en cualquier subruta (GitHub Pages, etc.)
export default defineConfig({
  base: './',
  plugins: [react()],
  test: { environment: 'node' },
});
