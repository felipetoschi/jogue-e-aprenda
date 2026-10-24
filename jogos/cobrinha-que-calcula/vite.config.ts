import { defineConfig } from 'vite';

// Em desenvolvimento o jogo é servido em /jogos/cobrinha-que-calcula/, caminho que a
// plataforma repassa para cá. No build, caminhos relativos: ele funciona em qualquer pasta.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? './' : '/jogos/cobrinha-que-calcula/',
  server: { port: 5174, strictPort: true },
}));
