import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import { nitro } from 'nitro/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Separate deployment target: never changes the existing Vercel build.
// Dynamic APIs must be implemented and verified on the Russian host before cutover.
export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    tanstackStart({
      spa: { enabled: true },
      prerender: {
        enabled: true,
        autoStaticPathsDiscovery: false,
        crawlLinks: false,
        failOnError: true,
      },
      pages: ['/', '/services', '/pricing', '/portfolio', '/process', '/contacts', '/order', '/admin'].map(path => ({ path })),
    }),
    nitro({ preset: 'node-server', output: { dir: '.output-russia' } }),
    react(),
  ],
});
