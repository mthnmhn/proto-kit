import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import gitApi from './git-api';
import vercelApi from './vercel-api';

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), gitApi(), vercelApi()],
  define: {
    __DEV__: JSON.stringify(mode !== 'production'),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}));
