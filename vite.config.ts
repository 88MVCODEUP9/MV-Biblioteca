import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // O repositório no GitHub se chama MV-Biblioteca (hífen) — o base precisa
  // bater com o nome do repo, senão todos os assets dão 404 e a página fica branca.
  base: '/MV-Biblioteca/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        // Separa as bibliotecas pesadas: o app abre rápido e cada leitor
        // só é baixado quando o livro é aberto.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('react-dom') || id.includes('/react/') || id.includes('scheduler')) return 'react';
          if (id.includes('epubjs') || id.includes('jszip')) return 'epub';
          if (id.includes('pdfjs-dist') || id.includes('react-pdf')) return 'pdf';
          if (id.includes('lucide-react')) return 'icons';
          return undefined;
        },
      },
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  preview: {
    port: 4173,
    host: true,
  }
});
