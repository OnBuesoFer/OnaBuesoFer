
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// BASE_PATH lets the same build run at the domain root
// or under a sub-path (GitHub Pages project sites).
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: env.BASE_PATH || '/portfolio/',

    envPrefix: ['VITE_', 'SITE_'],

    plugins: [react()],

    build: {
      target: 'es2022',
      cssCodeSplit: true,
      assetsInlineLimit: 2048,
    },

    ssr: {
      noExternal: [],
    },
  };
});
