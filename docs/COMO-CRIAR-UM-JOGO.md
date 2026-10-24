# Como criar um jogo

1. Crie a pasta `jogos/<id-do-jogo>` com um app Vite próprio (veja `jogos/cobrinha-que-calcula` como modelo):
   - `package.json` com nome `@jogue/jogo-<id>`, scripts `dev`, `build`, `typecheck`, `test` e dependência `@jogue/sdk-jogo`;
   - `vite.config.ts` com `base: './'` no build e `/jogos/<id>/` em desenvolvimento, numa porta própria;
   - `manifesto.json` exportado em `exports["./manifesto"]`.
2. No código do jogo, conecte-se à plataforma:

   ```ts
   import { conectarAPlataforma } from '@jogue/sdk-jogo';

   const conexao = await conectarAPlataforma({
     configAvulsa: { habilidadeId: 'adicao', estagio: 'basico', ajuste: 0.5, modo: 'normal' },
   });
   // conexao.config traz habilidade, estágio, ajuste (0 a 1) e modo.
   // Ao terminar:
   conexao.enviarResultado({
     pontuacao: 80, // 0 a 100: vira estrelas e XP
     desempenho: [{ habilidadeId: 'adicao', acertos: 8, tentativas: 10 }], // vira maestria
     ajudas: 0,
     status: 'concluida',
   });
   ```

   Fora da plataforma, `configAvulsa` é usada e o resultado vai para o console.
3. Registre o manifesto em `apps/plataforma/src/conteudo/jogos.ts` e adicione `@jogue/jogo-<id>` às dependências da plataforma.
4. Para o jogo subir junto no `npm run dev`, inclua-o no script `dev` da raiz e um `proxy` para `/jogos/<id>` em `apps/plataforma/vite.config.ts`.

Regras que todo jogo segue:

- O jogo cuida só da partida. Perfil, XP, maestria, desbloqueios e tela de resultado são da plataforma.
- Pontuação mede o desempenho no jogo; acertos e tentativas medem o conhecimento. Erros de movimento ou reflexo não devem contar como tentativa.
- Use o `ajuste` para variar a dificuldade dentro do estágio.
