/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Caminhos relativos: o site funciona em qualquer pasta ou hospedagem estática.
  base: './',
  server: {
    port: 5173,
    // Os jogos rodam no próprio servidor de desenvolvimento e são repassados por aqui,
    // ficando no mesmo endereço da plataforma (como no build final).
    proxy: { '/jogos': 'http://localhost:5174' },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/teste-setup.ts'],
  },
});
