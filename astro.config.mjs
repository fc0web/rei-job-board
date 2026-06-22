import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  site: 'https://rei-job-board.pages.dev',
  build: {
    format: 'directory',
  },
});
