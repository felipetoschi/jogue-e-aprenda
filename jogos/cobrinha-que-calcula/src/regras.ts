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
  casasPorSegundo: number;
}

export const REGRAS_ESTAGIO: Record<Estagio, RegrasEstagio> = {
  basico: { opcoes: 3, segundosPorConta: 12, casasPorSegundo: 5 },
  intermediario: { opcoes: 3, segundosPorConta: 10, casasPorSegundo: 6 },
  avancado: { opcoes: 4, segundosPorConta: 9, casasPorSegundo: 7 },
  mestre: { opcoes: 4, segundosPorConta: 8, casasPorSegundo: 8 },
};

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
