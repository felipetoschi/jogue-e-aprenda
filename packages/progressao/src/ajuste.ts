import { PARAMETROS } from './parametros';
import type { EstadoHabilidade } from './tipos';
import { limitar } from './util';

/** Dificuldade dentro do estágio (0 a 1) para a próxima partida. */
export function ajusteFino(estado: EstadoHabilidade): number {
  const { limiteQueda, correcaoQueda, limiteAlta, correcaoAlta } = PARAMETROS.ajusteFino;
  const ultimos = estado.ultimosDesempenhos.slice(-2);
  let correcao = 0;
  if (ultimos.length === 2 && ultimos.every((d) => d < limiteQueda)) correcao = correcaoQueda;
  if (ultimos.length === 2 && ultimos.every((d) => d >= limiteAlta)) correcao = correcaoAlta;
  return Math.round(limitar(estado.maestria / 100 + correcao, 0, 1) * 100) / 100;
}
