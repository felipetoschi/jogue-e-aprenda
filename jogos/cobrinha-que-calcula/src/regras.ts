import type { Estagio } from '@jogue/sdk-jogo';

export const TAMANHO_TABULEIRO = 18;
export const META_CONTAS = 20;
export const TAMANHO_INICIAL = 3;
/** Cada opção ocupa um bloco de 2 × 2 casas, para o número caber legível no celular. */
export const LADO_OPCAO = 2;
export const DISTANCIA_MINIMA_CABECA = 4;
/** Segundos finais de energia em que a cobra pisca. */
export const ALERTA_ENERGIA = 3;

export interface RegrasEstagio {
  opcoes: number;
  segundosPorConta: number;
  /** Velocidade no começo da partida, em casas por segundo. */
  velocidadeInicial: number;
  /** Teto de velocidade, alcançado aos poucos a cada acerto. */
  velocidadeMaxima: number;
}

/** Quanto a cobra acelera a cada acerto, em casas por segundo. */
export const ACELERACAO_POR_ACERTO = 0.15;

export const REGRAS_ESTAGIO: Record<Estagio, RegrasEstagio> = {
  basico: { opcoes: 3, segundosPorConta: 12, velocidadeInicial: 3, velocidadeMaxima: 5 },
  intermediario: { opcoes: 3, segundosPorConta: 10, velocidadeInicial: 4, velocidadeMaxima: 6 },
  avancado: { opcoes: 4, segundosPorConta: 9, velocidadeInicial: 5, velocidadeMaxima: 7 },
  mestre: { opcoes: 4, segundosPorConta: 8, velocidadeInicial: 6, velocidadeMaxima: 8 },
};

/** Velocidade depois de um número de acertos: sobe devagar até o teto do estágio. */
export function velocidade(estagio: Estagio, acertos: number): number {
  const { velocidadeInicial, velocidadeMaxima } = REGRAS_ESTAGIO[estagio];
  return Math.min(velocidadeMaxima, velocidadeInicial + acertos * ACELERACAO_POR_ACERTO);
}

/** O ajuste fino tira até 25% da energia por conta, sem mudar a velocidade. */
export function segundosPorConta(estagio: Estagio, ajuste: number): number {
  return REGRAS_ESTAGIO[estagio].segundosPorConta * (1 - 0.25 * ajuste);
}

export const NOMES_HABILIDADE: Record<string, string> = {
  adicao: 'Adição',
  subtracao: 'Subtração',
  multiplicacao: 'Multiplicação',
  divisao: 'Divisão',
  expressoes: 'Expressões',
};
