import type { Estagio } from '@jogue/sdk-jogo';

/**
 * Todos os números do sistema de progressão, num lugar só, para calibrar
 * com dados reais sem mexer nas regras (plano, aba "Sistema de progressão", seção 9).
 */
export const PARAMETROS = {
  /** Pontuação mínima para 1, 2 e 3 estrelas. */
  estrelas: [50, 70, 90] as const,
  xpBase: { basico: 10, intermediario: 20, avancado: 35, mestre: 50 } satisfies Record<Estagio, number>,
  bonus: { tresEstrelas: 5, primeiraDoDia: 10, revisao: 10, promocao: 50 },
  ajudas: { penalidadePorAjuda: 0.1, penalidadeMaxima: 0.3 },
  /** A partir da 6ª partida do dia na mesma habilidade e estágio, o XP cai pela metade. */
  repeticao: { partidasAntesDoCorte: 5, fator: 0.5 },
  /** XP para passar do nível n ao n+1 = base + incremento × n. */
  nivel: { base: 50, incremento: 25 },
  maestria: {
    alfa: 0.4,
    tentativasPesoCheio: 5,
    promocao: 80,
    partidasMinimas: 3,
    /** Domínio no Mestre que vale o 4º ponto de domínio. */
    dominioCompleto: 90,
  },
  ajusteFino: { limiteQueda: 50, correcaoQueda: -0.15, limiteAlta: 90, correcaoAlta: 0.1 },
  /** Prova para pular o estágio atual: nota mínima, tentativas mínimas e espera entre provas. */
  nivelamento: { notaParaPular: 85, tentativasMinimas: 10, diasEntreProvas: 7 },
  revisao: { intervalosDias: [3, 7, 14, 30, 60], notaAprovacao: 70, notaRuim: 50, ruinsParaEnferrujar: 2 },
} as const;

export const TITULOS: { nivelMinimo: number; titulo: string }[] = [
  { nivelMinimo: 50, titulo: 'Lenda' },
  { nivelMinimo: 35, titulo: 'Sábio' },
  { nivelMinimo: 20, titulo: 'Especialista' },
  { nivelMinimo: 10, titulo: 'Estudioso' },
  { nivelMinimo: 5, titulo: 'Explorador' },
  { nivelMinimo: 1, titulo: 'Aprendiz' },
];

export const SELOS = [
  { minimo: 1, selo: 'diamante' },
  { minimo: 0.75, selo: 'ouro' },
  { minimo: 0.5, selo: 'prata' },
  { minimo: 0.25, selo: 'bronze' },
] as const;
