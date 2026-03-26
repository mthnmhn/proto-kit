import path from 'path';
import type { Configuration } from '@ladle/react';

const config: Configuration = {
  stories: './src/**/*.stories.@(tsx|jsx)',
  viteConfig: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  },
};

export default config;
