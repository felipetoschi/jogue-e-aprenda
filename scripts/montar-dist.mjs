// Junta o build da plataforma e de cada jogo numa única pasta dist/,
// com cada jogo servido em /jogos/<id>/ e carregado só quando aberto.
import { cpSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const raiz = new URL('..', import.meta.url).pathname;
const destino = join(raiz, 'dist');

rmSync(destino, { recursive: true, force: true });
cpSync(join(raiz, 'apps/plataforma/dist'), destino, { recursive: true });

for (const jogo of readdirSync(join(raiz, 'jogos'))) {
  const origem = join(raiz, 'jogos', jogo, 'dist');
  if (!existsSync(origem)) continue;
  cpSync(origem, join(destino, 'jogos', jogo), { recursive: true });
  console.log(`jogo incluído: /jogos/${jogo}/`);
}
console.log(`build final em ${destino}`);
