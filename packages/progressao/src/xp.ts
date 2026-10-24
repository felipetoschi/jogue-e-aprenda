import type { Estagio } from '@jogue/sdk-jogo';
import { PARAMETROS } from './parametros';

export interface EntradaXp {
  estagio: Estagio;
  pontuacao: number;
  ajudas: number;
  estrelas: number;
  primeiraDoDia: boolean;
  /** Quantas partidas o jogador já fez hoje nesta habilidade e estágio, antes desta. */
  partidasAnterioresHoje: number;
}

/** XP da partida, sem os bônus de revisão e promoção (aplicados depois, por quem os decide). */
export function calcularXp(e: EntradaXp): number {
  const base = PARAMETROS.xpBase[e.estagio];
  const desempenho = 0.5 + e.pontuacao / 200;
  const penalidade = Math.min(PARAMETROS.ajudas.penalidadeMaxima, e.ajudas * PARAMETROS.ajudas.penalidadePorAjuda);
  let xp = Math.round(base * desempenho * (1 - penalidade));
  if (e.estrelas === 3) xp += PARAMETROS.bonus.tresEstrelas;
  if (e.partidasAnterioresHoje >= PARAMETROS.repeticao.partidasAntesDoCorte) {
    xp = Math.round(xp * PARAMETROS.repeticao.fator);
  }
  if (e.primeiraDoDia) xp += PARAMETROS.bonus.primeiraDoDia;
  return xp;
}
