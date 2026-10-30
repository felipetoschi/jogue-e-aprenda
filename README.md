# Jogue e Aprenda

Plataforma de jogos de puzzle e tabuleiro que ensinam matemática, português, geografia e mais, para jovens e adultos. Cada partida alimenta um sistema de progressão do básico ao avançado.

Esta é a **Fase 1 (Fundação)**: a plataforma completa com um único jogo, a **Cobrinha Sabida**.

## Jogar

Versão publicada: **https://felipetoschi.github.io/jogue-e-aprenda/**

No celular, instale o app para jogar em tela cheia: no Android, use o botão "Instalar o app" do início (ou o menu do navegador → "Instalar app"); no iPhone, toque em Compartilhar → "Adicionar à Tela de Início". Depois da primeira visita, o app abre mesmo sem internet.

A publicação é automática: cada push na branch principal roda `.github/workflows/pages.yml`, que testa, gera o build e publica no GitHub Pages.

## Como rodar

Requer Node.js 20 ou mais novo.

```bash
npm install
npm run dev        # plataforma em http://localhost:5173 (o jogo sobe junto, na porta 5174)
```

Outros comandos:

| Comando | O que faz |
| --- | --- |
| `npm test` | Testes de todos os pacotes |
| `npm run typecheck` | Checagem de tipos de todos os pacotes |
| `npm run build` | Gera o site final em `dist/` (plataforma + jogos) |
| `npm run preview` | Serve o `dist/` em http://localhost:4173 |

Para jogar a cobrinha sozinha, fora da plataforma: `npm run dev -w @jogue/jogo-cobrinha-sabida` e abra
`http://localhost:5174/jogos/cobrinha-sabida/?habilidade=divisao&estagio=avancado` (as perguntas vêm do banco de conteúdo).

## Estrutura

```
apps/plataforma         site principal (React): início, jogos, partida, resultado e progresso
packages/conteudo       todo o conteúdo de todos os jogos, separado por disciplina (habilidades e perguntas)
packages/progressao     regras de estrelas, XP, nível, maestria, estágios, revisão e desbloqueio
packages/sdk-jogo       contrato, padrão dos jogos (PADRAO) e canal de mensagens entre plataforma e jogos
jogos/cobrinha-sabida  o primeiro jogo, com build próprio (canvas, sem framework)
scripts/montar-dist.mjs junta o build da plataforma e dos jogos em dist/
docs/                   arquitetura e guia para criar jogos
```

Três coisas ficam separadas:

- **Conteúdo** (`packages/conteudo`): disciplinas, habilidades e perguntas, num lugar só.
- **Progresso** (`packages/progressao`): o que o jogador sabe por habilidade, venha de qual jogo vier.
- **Jogos** (`jogos/*`): apps separados, sem conteúdo próprio. A plataforma gera as perguntas e as envia ao jogo, que só mostra e confere. O código do jogo é baixado apenas quando o jogador abre a partida, num `iframe`. Detalhes em [docs/ARQUITETURA.md](docs/ARQUITETURA.md) e [docs/COMO-CRIAR-UM-JOGO.md](docs/COMO-CRIAR-UM-JOGO.md).

## Estado atual

- Progresso salvo no navegador (`localStorage`). A camada `apps/plataforma/src/dados/armazenamento.ts` é a que muda quando houver servidor e contas.
- Três disciplinas, Matemática, Geografia e História, e o jogo Cobrinha Sabida. Português aparece como "em breve".
- Ainda não existem: contas de usuário, servidor, nivelamento, conquistas, sequência de dias e ranking.
