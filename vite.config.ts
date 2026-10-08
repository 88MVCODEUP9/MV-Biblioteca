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
    // Sem manualChunks: a chunking manual jogava clsx/jszip para os chunks dos
    // leitores, e o Rollup aí puxava pdf (425kB) + epub (359kB) no carregamento
    // inicial via <link rel="modulepreload">. Com a chunking padrão do Vite,
    // pdf/epub só são baixados quando o livro é aberto.
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
