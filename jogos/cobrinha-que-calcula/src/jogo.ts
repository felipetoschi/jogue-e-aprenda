import type { Estagio } from '@jogue/sdk-jogo';
import { inteiro, type Rng } from './aleatorio';
import { gerarConta, type Conta, type Opcao, type TipoErro } from './contas';
import {
  DISTANCIA_MINIMA_CABECA,
  LADO_OPCAO,
  META_CONTAS,
  REGRAS_ESTAGIO,
  TAMANHO_INICIAL,
  TAMANHO_TABULEIRO,
  segundosPorConta,
} from './regras';

export type Direcao = 'cima' | 'baixo' | 'esquerda' | 'direita';
export interface Posicao {
  x: number;
  y: number;
}

export interface OpcaoNoTabuleiro extends Opcao {
  /** Canto superior esquerdo do bloco de LADO_OPCAO × LADO_OPCAO casas. */
  pos: Posicao;
}

export type MotivoFim = 'vitoria' | 'erro' | 'energia' | 'borda' | 'corpo';

export interface Fim {
  motivo: MotivoFim;
  /** Conta que estava na tela, para mostrar resolvida quando o jogador errou ou ficou sem energia. */
  conta: Conta;
  tipoErro: TipoErro | null;
  /** Número que a cobra comeu, quando errou. */
  valorEscolhido: number | null;
}

export interface ConfigJogo {
  habilidadeId: string;
  estagio: Estagio;
  ajuste: number;
}

export interface EstadoJogo {
  config: ConfigJogo;
  /** Cabeça primeiro. */
  cobra: Posicao[];
  direcao: Direcao;
  /** A cobra fica parada até o primeiro comando, para ninguém bater na borda antes de entender o controle. */
  parada: boolean;
  /** Até 2 viradas guardadas, para uma volta rápida em "U" não se perder. */
  fila: Direcao[];
  crescerPendente: number;
  conta: Conta;
  opcoes: OpcaoNoTabuleiro[];
  /** Energia de 0 a 1; zera em segundosPorConta. */
  energia: number;
  segundosPorConta: number;
  segundosPorPasso: number;
  acumulado: number;
  tempoNaConta: number;
  temposDeAcerto: number[];
  acertos: number;
  tentativas: number;
  maiorTamanho: number;
  fim: Fim | null;
}

const VETOR: Record<Direcao, Posicao> = {
  cima: { x: 0, y: -1 },
  baixo: { x: 0, y: 1 },
  esquerda: { x: -1, y: 0 },
  direita: { x: 1, y: 0 },
};

const OPOSTA: Record<Direcao, Direcao> = { cima: 'baixo', baixo: 'cima', esquerda: 'direita', direita: 'esquerda' };

export function criarJogo(config: ConfigJogo, rng: Rng): EstadoJogo {
  const meio = Math.floor(TAMANHO_TABULEIRO / 2);
  const cobra = Array.from({ length: TAMANHO_INICIAL }, (_, i) => ({ x: meio - i, y: meio }));
  const regras = REGRAS_ESTAGIO[config.estagio];
  const estado: EstadoJogo = {
    config,
    cobra,
    direcao: 'direita',
    parada: true,
    fila: [],
    crescerPendente: 0,
    conta: gerarConta(config.habilidadeId, config.estagio, config.ajuste, regras.opcoes, rng),
    opcoes: [],
    energia: 1,
    segundosPorConta: segundosPorConta(config.estagio, config.ajuste),
    segundosPorPasso: 1 / regras.casasPorSegundo,
    acumulado: 0,
    tempoNaConta: 0,
    temposDeAcerto: [],
    acertos: 0,
    tentativas: 0,
    maiorTamanho: cobra.length,
    fim: null,
  };
  estado.opcoes = posicionarOpcoes(estado.conta.opcoes, cobra, rng);
  return estado;
}

/** Guarda uma virada. Ignora meia-volta e repetição da direção atual. O primeiro comando põe a cobra em movimento. */
export function virar(estado: EstadoJogo, direcao: Direcao): void {
  const referencia = estado.fila.at(-1) ?? estado.direcao;
  if (estado.parada && direcao !== OPOSTA[referencia]) {
    estado.parada = false;
    estado.acumulado = 0;
  }
  if (estado.fila.length >= 2 || direcao === referencia || direcao === OPOSTA[referencia]) return;
  estado.fila.push(direcao);
}

export type Evento = { tipo: 'acerto'; pos: Posicao } | { tipo: 'fim'; fim: Fim };

/** Avança o jogo em dt segundos. Devolve o que aconteceu, para som e animação. */
export function avancar(estado: EstadoJogo, dt: number, rng: Rng): Evento[] {
  if (estado.fim) return [];
  const eventos: Evento[] = [];

  estado.tempoNaConta += dt;
  estado.energia -= dt / estado.segundosPorConta;
  if (estado.energia <= 0) {
    estado.energia = 0;
    estado.tentativas++;
    return [terminar(estado, 'energia', null)];
  }

  // Parada, a energia continua caindo: o tempo para pensar na primeira conta não é infinito.
  if (estado.parada) return eventos;
  estado.acumulado += dt;
  while (estado.acumulado >= estado.segundosPorPasso && !estado.fim) {
    estado.acumulado -= estado.segundosPorPasso;
    const evento = passo(estado, rng);
    if (evento) eventos.push(evento);
  }
  return eventos;
}

function passo(estado: EstadoJogo, rng: Rng): Evento | null {
  estado.direcao = estado.fila.shift() ?? estado.direcao;
  const cabeca = estado.cobra[0]!;
  const nova = { x: cabeca.x + VETOR[estado.direcao].x, y: cabeca.y + VETOR[estado.direcao].y };

  if (nova.x < 0 || nova.y < 0 || nova.x >= TAMANHO_TABULEIRO || nova.y >= TAMANHO_TABULEIRO) {
    return terminar(estado, 'borda', null);
  }
  // A cauda sai do lugar neste passo, a menos que a cobra esteja crescendo.
  const corpo = estado.crescerPendente > 0 ? estado.cobra : estado.cobra.slice(0, -1);
  if (corpo.some((p) => p.x === nova.x && p.y === nova.y)) {
    return terminar(estado, 'corpo', null);
  }

  estado.cobra.unshift(nova);
  if (estado.crescerPendente > 0) estado.crescerPendente--;
  else estado.cobra.pop();

  const comida = estado.opcoes.find((o) => dentroDoBloco(nova, o.pos));
  if (!comida) return null;

  estado.tentativas++;
  if (!comida.correta) return terminar(estado, 'erro', comida.tipoErro, comida.valor);

  estado.acertos++;
  estado.crescerPendente++;
  estado.maiorTamanho = Math.max(estado.maiorTamanho, estado.cobra.length + estado.crescerPendente);
  estado.temposDeAcerto.push(estado.tempoNaConta);
  if (estado.acertos >= META_CONTAS) return terminar(estado, 'vitoria', null);

  const { opcoes } = REGRAS_ESTAGIO[estado.config.estagio];
  estado.conta = gerarConta(estado.config.habilidadeId, estado.config.estagio, estado.config.ajuste, opcoes, rng);
  estado.opcoes = posicionarOpcoes(estado.conta.opcoes, estado.cobra, rng);
  estado.energia = 1;
  estado.tempoNaConta = 0;
  return { tipo: 'acerto', pos: nova };
}

function terminar(estado: EstadoJogo, motivo: MotivoFim, tipoErro: TipoErro | null, valorEscolhido: number | null = null): Evento {
  estado.fim = { motivo, conta: estado.conta, tipoErro, valorEscolhido };
  return { tipo: 'fim', fim: estado.fim };
}

export const dentroDoBloco = (p: Posicao, canto: Posicao) =>
  p.x >= canto.x && p.x < canto.x + LADO_OPCAO && p.y >= canto.y && p.y < canto.y + LADO_OPCAO;

const distancia = (a: Posicao, b: Posicao) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

/** Distância da cabeça até a casa mais próxima do bloco. */
function distanciaAoBloco(cabeca: Posicao, canto: Posicao): number {
  const x = Math.max(canto.x, Math.min(cabeca.x, canto.x + LADO_OPCAO - 1));
  const y = Math.max(canto.y, Math.min(cabeca.y, canto.y + LADO_OPCAO - 1));
  return distancia(cabeca, { x, y });
}

/** Blocos separados por pelo menos uma casa livre. */
const blocosSeparados = (a: Posicao, b: Posicao) =>
  Math.abs(a.x - b.x) > LADO_OPCAO || Math.abs(a.y - b.y) > LADO_OPCAO;

/**
 * Posiciona as opções longe da cabeça, separadas entre si e a distâncias parecidas da cabeça,
 * para a mais próxima não ser sempre a certa. Relaxa as exigências se não achar lugar.
 */
export function posicionarOpcoes(opcoes: Opcao[], cobra: Posicao[], rng: Rng): OpcaoNoTabuleiro[] {
  const cabeca = cobra[0]!;
  const livres: Posicao[] = [];
  for (let y = 0; y <= TAMANHO_TABULEIRO - LADO_OPCAO; y++) {
    for (let x = 0; x <= TAMANHO_TABULEIRO - LADO_OPCAO; x++) {
      const canto = { x, y };
      if (!cobra.some((p) => dentroDoBloco(p, canto))) livres.push(canto);
    }
  }

  const tentativas: { distanciaMinima: number; variacaoMaxima: number }[] = [
    { distanciaMinima: DISTANCIA_MINIMA_CABECA, variacaoMaxima: 3 },
    { distanciaMinima: DISTANCIA_MINIMA_CABECA, variacaoMaxima: Infinity },
    { distanciaMinima: 1, variacaoMaxima: Infinity },
  ];
  for (const regra of tentativas) {
    const elegiveis = livres.filter((c) => distanciaAoBloco(cabeca, c) >= regra.distanciaMinima);
    for (let i = 0; i < 200; i++) {
      const escolhidos: Posicao[] = [];
      for (let j = 0; j < opcoes.length * 4 && escolhidos.length < opcoes.length; j++) {
        const c = elegiveis[inteiro(0, elegiveis.length - 1, rng)];
        if (c && escolhidos.every((e) => blocosSeparados(e, c))) escolhidos.push(c);
      }
      if (escolhidos.length < opcoes.length) continue;
      const distancias = escolhidos.map((c) => distanciaAoBloco(cabeca, c));
      if (Math.max(...distancias) - Math.min(...distancias) > regra.variacaoMaxima) continue;
      return opcoes.map((o, k) => ({ ...o, pos: escolhidos[k]! }));
    }
  }
  throw new Error('Não há espaço para as opções no tabuleiro');
}

/** Pontuação de 0 a 100 enviada à plataforma. */
export const pontuacaoDe = (estado: EstadoJogo) => Math.round((100 * estado.acertos) / META_CONTAS);
