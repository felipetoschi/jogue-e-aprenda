# Arquitetura

## Visão geral

Conteúdo, progresso e jogos são independentes:

- `packages/conteudo` guarda todas as disciplinas, habilidades e geradores de perguntas. Cada disciplina tem sua pasta (`src/matematica/`).
- `packages/progressao` mede o que o jogador sabe por habilidade. Não sabe de qual jogo veio o resultado.
- Os jogos não têm conteúdo. O manifesto diz quais disciplinas e formatos de pergunta o jogo mostra; a plataforma gera as perguntas no banco de conteúdo e as envia na configuração da partida.

```
plataforma (React)                         jogo (app separado, iframe)
──────────────────                         ───────────────────────────
abre #/jogar/<id>  ── carrega o iframe ──▶  baixa o código do jogo
                   ◀──────── pronto ──────  conectarAPlataforma()
envia configuração ─────── iniciar ──────▶  (habilidade, estágio, ajuste, modo e as perguntas)
                                            ...partida...
valida o resultado ◀────── resultado ─────  pontuação + acertos por habilidade
aplica a progressão (@jogue/progressao), salva, mostra a tela de resultado
```

- **Isolamento:** o jogo roda num `iframe`. Um erro no jogo não derruba a plataforma, e a página inicial não baixa código de nenhum jogo.
- **Contrato:** `packages/sdk-jogo/src/contrato.ts` define `ConfigPartida`, `ResultadoJogo`, `ManifestoJogo` e as mensagens. Mudanças incompatíveis sobem `VERSAO_PROTOCOLO`.
- **Segurança das mensagens:** só são aceitas mensagens com o envelope do canal, vindas do `iframe` (ou da janela pai) esperado e da mesma origem; a plataforma aceita um único resultado por `partidaId` e recusa resultados implausíveis (`validarResultado`).
- **Progressão:** `packages/progressao` são funções puras, sem React nem armazenamento. A mesma biblioteca vai rodar no servidor quando ele existir, para que ninguém forje progresso no aparelho.

## Pastas no build final

```
dist/index.html                              plataforma
dist/assets/...                              código da plataforma
dist/jogos/cobrinha-que-calcula/index.html   jogo, baixado só ao abrir a partida
```

Todos os caminhos são relativos e as rotas usam `#`, então o `dist/` funciona em qualquer hospedagem estática.

## Regras de progressão

Todos os números ficam em `packages/progressao/src/parametros.ts`, espelhando a seção 9 da aba "Sistema de progressão" do plano. Os testes em `packages/progressao/src/*.test.ts` reproduzem os exemplos do plano.
