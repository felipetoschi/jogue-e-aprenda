import { PARAMETROS } from './parametros';

/** Desempenho de 0 a 100 numa habilidade, a partir de acertos e tentativas. */
export function desempenhoDe(acertos: number, tentativas: number): number {
  return tentativas === 0 ? 0 : (acertos / tentativas) * 100;
}

/** Média móvel: a partida nova pesa α; partidas com poucas tentativas pesam menos. */
export function atualizarMaestria(maestriaAtual: number, desempenho: number, tentativas: number): number {
  const { alfa, tentativasPesoCheio } = PARAMETROS.maestria;
  const peso = alfa * Math.min(1, tentativas / tentativasPesoCheio);
  const nova = maestriaAtual + peso * (desempenho - maestriaAtual);
  return Math.round(nova * 10) / 10;
}
