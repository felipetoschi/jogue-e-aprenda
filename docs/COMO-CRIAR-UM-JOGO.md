# Como criar um jogo

1. Crie a pasta `jogos/<id-do-jogo>` com um app Vite próprio (veja `jogos/cobrinha-que-calcula` como modelo):
   - `package.json` com nome `@jogue/jogo-<id>`, scripts `dev`, `build`, `typecheck`, `test` e dependência `@jogue/sdk-jogo`;
   - `vite.config.ts` com `base: './'` no build e `/jogos/<id>/` em desenvolvimento, numa porta própria;
   - `manifesto.json` exportado em `exports["./manifesto"]`, com `materias` (disciplinas que o jogo oferece),
     `formatos` (formatos de pergunta que ele mostra, hoje `resposta-curta`) e `icone` (arquivo do próprio jogo).
   - O jogo não tem conteúdo próprio: as perguntas chegam em `conexao.config.questoes`.
2. No código do jogo, conecte-se à plataforma:

   ```ts
   import { conectarAPlataforma } from '@jogue/sdk-jogo';

   const conexao = await conectarAPlataforma({
     // Só usada quando o jogo roda fora da plataforma: gera perguntas do banco de conteúdo.
     configAvulsa: async () => {
       const { gerarQuestoes } = await import('@jogue/conteudo');
       return { habilidadeId: 'adicao', estagio: 'basico', ajuste: 0.5, modo: 'normal', rotulo: 'Adição · Básico', questoes: gerarQuestoes('adicao', 'basico', 0.5, 20) };
     },
   });
   // conexao.config traz habilidade, estágio, ajuste (0 a 1), modo, rótulo e as perguntas (enunciado, resolução, opções).
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

## Padrão dos jogos

Os números do padrão ficam em `packages/sdk-jogo/src/padrao.ts` (`PADRAO`), e todo jogo usa os mesmos:

| Estágio | Opções por pergunta | Tempo por pergunta |
| --- | --- | --- |
| Básico | 3 | 15 s |
| Intermediário | 3 | 12 s |
| Avançado | 4 | 9 s |
| Mestre | 4 | 8 s |

- Toda partida tem 20 perguntas. **Zerar** = acertar as 20; só assim o jogador sobe de estágio.
- Erro ou tempo esgotado encerra a partida e conta como tentativa. Erros de reflexo (bater, cair) não contam.
- Pontuação = acertos ÷ perguntas × 100 (`pontuacaoPadrao`). A plataforma recusa resultados fora do padrão.
- Ao errar, o jogo mostra a pergunta resolvida e a explicação que vem no banco de conteúdo.

Checklist para aprovar um jogo novo:

- [ ] Usa só perguntas do banco de conteúdo
- [ ] Usa `PADRAO` e `segundosPorPergunta` para opções e tempo
- [ ] Erro e tempo esgotado encerram a partida; erros de reflexo não contam como tentativa
- [ ] Mostra a resolução e a explicação ao errar
- [ ] Envia pontuação padrão, acertos, tentativas e como terminou
- [ ] Funciona no PC (teclado) e no celular (toque), com pausa e saída
- [ ] Tem ícone e apresentação curta no manifesto

Outras regras:

- O jogo cuida só da partida. Perfil, XP, maestria, desbloqueios e tela de resultado são da plataforma.
- Pontuação mede o desempenho no jogo; acertos e tentativas medem o conhecimento. Erros de movimento ou reflexo não devem contar como tentativa.
- Use o `ajuste` para variar a dificuldade dentro do estágio.

## Como adicionar uma disciplina

Todo o conteúdo fica em `packages/conteudo`. Para uma nova disciplina:

1. Crie `packages/conteudo/src/<disciplina>/` com as habilidades (`Habilidade[]`) e um gerador que devolve `Questao`.
2. Registre as habilidades em `HABILIDADES` e o gerador em `GERADORES` (`packages/conteudo/src/index.ts`).
3. Marque a disciplina como `disponivel: true` em `materias.ts`.
4. Inclua o id da disciplina em `materias` no manifesto de cada jogo que deve oferecê-la.
