import { LETRAS, type Estagio } from './contrato';

/**
 * Padrão dos jogos (plano, aba "Padrão dos jogos"): os mesmos números em todos os jogos,
 * para uma partida valer o mesmo em qualquer um deles.
 */
export const PADRAO = {
  /** Perguntas por partida. Acertar todas = zerar, a única forma de subir de estágio. */
  questoesPorPartida: 20,
  /** Alternativas por pergunta que um jogo pode pedir no manifesto: de A e B até A a E. */
  alternativas: { minimo: 2, maximo: LETRAS.length },
  /** Alternativas e tempo por pergunta em cada estágio, para os jogos que não fixam as alternativas. */
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

/** Alternativas por pergunta: o número fixo do jogo, se ele declarar um no manifesto; senão, o do estágio. */
export function alternativasPorPergunta(estagio: Estagio, doJogo?: number): number {
  if (doJogo === undefined) return PADRAO.estagios[estagio].opcoes;
  const { minimo, maximo } = PADRAO.alternativas;
  if (!Number.isInteger(doJogo) || doJogo < minimo || doJogo > maximo) {
    throw new Error(`Alternativas por pergunta devem ser de ${minimo} a ${maximo}`);
  }
  return doJogo;
}

/** Pontuação padrão: acertos ÷ perguntas × 100. */
export function pontuacaoPadrao(acertos: number, totalPerguntas: number): number {
  return totalPerguntas > 0 ? Math.round((100 * acertos) / totalPerguntas) : 0;
}

/** Zerou: acertou todas as perguntas da partida, sem errar. */
export function zerou(acertos: number, tentativas: number, totalPerguntas: number = PADRAO.questoesPorPartida): boolean {
  return acertos >= totalPerguntas && acertos === tentativas;
}
