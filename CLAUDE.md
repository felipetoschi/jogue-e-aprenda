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
| `packages/conteudo` | Todo o conteúdo de todos os jogos, separado por disciplina (`src/matematica/`, `src/geografia/`, `src/historia/`) |
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
  Em Geografia, a errada vem da mesma região ou continente e de um lugar tão conhecido quanto o da certa.
- **Sem repetir na partida.** A mesma pergunta não sai duas vezes nas 20 de uma partida.
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

## Cobrinha Sabida (primeiro jogo, id `cobrinha-sabida`; antes `cobrinha-que-calcula`)

- Sempre duas alternativas, A e B (`"alternativas": 2` no manifesto): no tabuleiro só as letras, cada uma
  com sua cor; o texto de cada uma fica embaixo da pergunta.
- Setas na tela no celular (sem joystick), teclado no PC, deslizar no tabuleiro também funciona.
- Fim com correção (errou ou o tempo acabou): a correção fica na tela até o jogador tocar em Continuar
  (Enter no PC). Nos outros finais (zerou, bateu), passa sozinho ao resultado depois de 3,2 s.
- Velocidade começa devagar (3 a 6 casas/s) e sobe 0,15 por acerto até 5 a 8 casas/s, conforme o estágio.
- Habilidades de Matemática: Adição, Subtração, Multiplicação, Divisão e Todas as operações.
- Habilidades de Geografia: Estados e capitais, Regiões do Brasil, Países e capitais, Continentes e Todos os temas.
- Habilidades de História: Datas do Brasil, Datas do mundo e Brasil e mundo.
- O tabuleiro ocupa a altura que sobra entre a pergunta e as setas (pergunta de duas linhas não corta as setas).
- Todas abertas desde o início (sem pré-requisito); em cada uma, os estágios sobem um a um ao zerar.

## Para criar um jogo ou uma disciplina

Siga `docs/COMO-CRIAR-UM-JOGO.md` (padrão, checklist de aprovação e como adicionar disciplina).
Ao mudar uma regra, atualize também o plano, este arquivo e os testes.

## Geografia

- As perguntas saem de tabelas (`packages/conteudo/src/geografia/dados.ts`): 27 unidades da federação e ~95 países,
  cada um com capital, região ou continente e fama (1 = todo mundo conhece, 3 = pouco conhecido).
- O que sobe de um estágio para o outro: lugares menos conhecidos, grupo maior e pergunta ao contrário
  ("Recife é capital de?"). No Mestre de países entram as pegadinhas (Sydney × Camberra).
- Países em dois continentes (Rússia, Turquia, Cazaquistão) não entram nas perguntas de continente.
- Nomes com até 20 letras, para caberem nas alternativas no celular. Para incluir um lugar, basta uma linha na tabela.

## História

- Datas históricas do Brasil e do mundo, numa tabela (`packages/conteudo/src/historia/dados.ts`): ano, nome para a
  pergunta ("Ano da Lei Áurea?"), nome curto para a alternativa (até 20 letras, sem o ano) e fama de 1 a 3.
- Estágios: Básico = fatos conhecidos, errada a 10–40 anos; Intermediário = mais fatos, 4–15 anos; Avançado =
  2–8 anos e "O que houve em 1822?"; Mestre = 1–4 anos e "Qual veio primeiro?".
- A errada preferida é o ano de outro fato próximo (Lei Áurea 1888 × República 1889); nenhuma errada no futuro.
