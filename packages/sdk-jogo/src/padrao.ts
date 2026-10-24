import type { Estagio } from './contrato';

/**
 * Padrão dos jogos (plano, aba "Padrão dos jogos"): os mesmos números em todos os jogos,
 * para uma partida valer o mesmo em qualquer um deles.
 */
export const PADRAO = {
  /** Perguntas por partida. Acertar todas = zerar, a única forma de subir de estágio. */
  questoesPorPartida: 20,
  estagios: {
    basico: { opcoes: 3, segundosPorPergunta: 15 },
    intermediario: { opcoes: 3, segundosPorPergunta: 12 },
    avancado: { opcoes: 4, segundosPorPergunta: 9 },
    mestre: { opcoes: 4, segundosPorPergunta: 8 },
  } satisfies Record<Estagio, { opcoes: number; segundosPorPergunta: number }>,
  /** O ajuste fino (0 a 1) tira até esta fração do tempo por pergunta. */
  reducaoMaximaDeTempo: 0.25,
} as const;

/** Tempo por pergunta no estágio, já com o ajuste fino aplicado. */
export function segundosPorPergunta(estagio: Estagio, ajuste: number): number {
  return PADRAO.estagios[estagio].segundosPorPergunta * (1 - PADRAO.reducaoMaximaDeTempo * ajuste);
}

/** Pontuação padrão: acertos ÷ perguntas × 100. */
export function pontuacaoPadrao(acertos: number, totalPerguntas: number): number {
  return totalPerguntas > 0 ? Math.round((100 * acertos) / totalPerguntas) : 0;
}

/** Zerou: acertou todas as perguntas da partida, sem errar. */
export function zerou(acertos: number, tentativas: number, totalPerguntas: number = PADRAO.questoesPorPartida): boolean {
  return acertos >= totalPerguntas && acertos === tentativas;
}
