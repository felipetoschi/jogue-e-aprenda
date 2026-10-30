# Jogue e Aprenda — instruções para o Claude

Plataforma de jogos (puzzle, tabuleiro, arcade) que ensinam disciplinas, para jovens e adultos.
Publicada em https://felipetoschi.github.io/jogue-e-aprenda/ (cada push na branch principal publica pelo
workflow `.github/workflows/pages.yml`). Plano completo: https://claude.ai/artifact/NxjGKfeCe2iQPs8gGNi1p7

## Como trabalhar aqui

- Tudo em português do Brasil: código (nomes de variáveis e funções), comentários, textos da interface e commits.
- Textos da interface curtos e diretos. O dono do projeto prefere pouco texto.
- Celular primeiro: tudo precisa funcionar no celular (toque, setas na tela) e no PC (teclado).
- Quando o dono pedir para "anotar" ou "deixar planejado", só registre no plano; não mexa no código.
- Antes de enviar: `npm run typecheck`, `npm test` e `npm run build` precisam passar.
- Toda mudança pode ser publicada: depois das checagens, abra o pull request para a branch principal
  (`claude/jogue-aprenda-structure-o6lgo0`) e faça o merge, sem precisar perguntar.

## Comandos

```bash
npm install
npm run dev        # plataforma em :5173, jogo em :5174
npm test           # testes de todos os pacotes
npm run typecheck
npm run build      # gera dist/ (plataforma + jogos)
```

## Estrutura

| Pasta | O que é |
| --- | --- |
| `apps/plataforma` | Site (React): Início, Jogos, Partida, Resultado, Progresso |
| `packages/conteudo` | Todo o conteúdo de todos os jogos, separado por disciplina (`src/matematica/`) |
| `packages/progressao` | Regras puras de XP, nível, estrelas, estágio, revisão e desbloqueio |
| `packages/sdk-jogo` | Contrato plataforma ↔ jogo, `PADRAO` dos jogos e validação de resultados |
| `jogos/<id>` | Cada jogo é um app separado, carregado num iframe só ao jogar |

## Regras do produto (decididas — não mudar sem o dono pedir)

- **Conteúdo, progresso e jogos são separados.** Os jogos não têm conteúdo próprio: a plataforma gera as
  perguntas em `packages/conteudo` e envia ao jogo. O progresso é por habilidade, venha de qual jogo vier.
- **Padrão dos jogos** (`packages/sdk-jogo/src/padrao.ts`): 20 perguntas por partida; alternativas e tempo por
  pergunta por estágio — Básico 3 / 15 s, Intermediário 3 / 12 s, Avançado 4 / 9 s, Mestre 4 / 8 s.
  Pontuação = acertos ÷ perguntas × 100. Todo jogo usa esses números; nenhum tem cópia própria.
- **Alternativas com letra.** Toda pergunta vem com alternativas A, B, C… (no máximo A a E), para servir a
  qualquer disciplina, não só a respostas em número. O jogo mostra a letra para pegar e o texto ao lado da
  pergunta. Um jogo pode fixar quantas alternativas quer (2 a 5) em `alternativas` no manifesto; sem isso,
  vale o número do estágio. O tempo por pergunta segue o estágio de qualquer jogo.
- **Erradas parecidas com a certa.** Em Matemática, toda alternativa errada tem o mesmo número de algarismos
  da certa e fica a no máximo 25% de distância dela (`perto` em `contas.ts`), para não dar para descartar de olho.
- **Todos começam no Básico.** Não existe prova nem atalho para pular estágio.
- **Só sobe de estágio quem zera** a partida no estágio atual (acerta as 20), em todos os estágios. Zerar um
  estágio anterior não faz subir. A maestria existe só como indicador.
- **Erro ou tempo esgotado encerra a partida** e conta como tentativa. Erro de reflexo (bater na borda) não
  conta como tentativa. Ao errar, o jogo mostra a pergunta resolvida e a explicação do erro.
- **Escolha de nível:** no card do jogo (página Jogos), níveis lado a lado, com o mais alto já alcançado
  sempre selecionado; dá para escolher um anterior (vale XP, não muda a maestria do atual).
- **Menu:** Início (só a apresentação, abrindo com "O que é o Jogue e Aprenda?"), Jogos (um card por jogo,
  com ícone), Progresso (no topo, nível e o botão Continuar; depois disciplinas, erros, histórico).
- O progresso fica salvo no navegador (`localStorage`) por enquanto; ainda não há contas nem servidor Login com Google
  ou Facebook está planejado (anotado no plano), ainda sem implementação.

## Cobrinha Sabida (primeiro jogo, id `cobrinha-que-calcula`)

- Sempre duas alternativas, A e B (`"alternativas": 2` no manifesto): no tabuleiro só as letras, cada uma
  com sua cor; o texto de cada uma fica embaixo da pergunta.
- Setas na tela no celular (sem joystick), teclado no PC, deslizar no tabuleiro também funciona.
- Velocidade começa devagar (3 a 6 casas/s) e sobe 0,15 por acerto até 5 a 8 casas/s, conforme o estágio.
- Habilidades de Matemática: Adição, Subtração, Multiplicação, Divisão e Todas as operações.
  Todas abertas desde o início (sem pré-requisito); em cada uma, os estágios sobem um a um ao zerar.

## Para criar um jogo ou uma disciplina

Siga `docs/COMO-CRIAR-UM-JOGO.md` (padrão, checklist de aprovação e como adicionar disciplina).
Ao mudar uma regra, atualize também o plano, este arquivo e os testes.
