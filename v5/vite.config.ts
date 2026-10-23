import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// `npm run build`         → dist/ for hosting (cPanel, DirectAdmin, Vercel…)
// `npm run build:single`  → dist-single/index.html, one self-contained file that
//                           opens by double-click (fonts, images and code inlined)
export default defineConfig(({ mode }) =>
  mode === 'single'
    ? {
        plugins: [react(), viteSingleFile()],
        build: { outDir: 'dist-single', assetsInlineLimit: 100_000_000, chunkSizeWarningLimit: 5000 },
      }
    : {
        plugins: [react()],
        build: {
          chunkSizeWarningLimit: 700,
          rollupOptions: {
            output: {
              manualChunks: (id: string) => {
                if (id.includes('node_modules/three')) return 'three'
                if (id.includes('node_modules/gsap') || id.includes('node_modules/lenis')) return 'motion'
              },
            },
          },
        },
      },
)
