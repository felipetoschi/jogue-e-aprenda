/** Versão do protocolo de mensagens. Mude ao quebrar compatibilidade. */
export const VERSAO_PROTOCOLO = 1;

/** Marca todas as mensagens, para ignorar qualquer outra coisa que chegue via postMessage. */
export const CANAL = 'jogue-e-aprenda';

export const ESTAGIOS = ['basico', 'intermediario', 'avancado', 'mestre'] as const;
export type Estagio = (typeof ESTAGIOS)[number];

export const NOMES_ESTAGIO: Record<Estagio, string> = {
  basico: 'Básico',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
  mestre: 'Mestre',
};

export type ModoPartida = 'normal' | 'revisao' | 'treino';

/** O que a plataforma entrega ao jogo ao iniciar uma partida. */
export interface ConfigPartida {
  partidaId: string;
  habilidadeId: string;
  estagio: Estagio;
  /** Dificuldade dentro do estágio, de 0 (mais fácil) a 1 (mais difícil). */
  ajuste: number;
  modo: ModoPartida;
}

export interface DesempenhoHabilidade {
  habilidadeId: string;
  acertos: number;
  tentativas: number;
}

/** O que o jogo devolve à plataforma ao fim da partida. */
export interface ResultadoJogo {
  partidaId: string;
  /** Pontuação do jogo, de 0 a 100. Alimenta estrelas e XP. */
  pontuacao: number;
  /** Acertos por habilidade. Alimenta a maestria. */
  desempenho: DesempenhoHabilidade[];
  ajudas: number;
  status: 'concluida' | 'abandonada';
  /** Dados próprios do jogo, guardados no histórico (ex.: maior tamanho da cobra). */
  extras?: Record<string, unknown>;
}

/** Metadados que todo jogo declara para entrar no catálogo. */
export interface ManifestoJogo {
  id: string;
  nome: string;
  descricao: string;
  tipo: 'puzzle' | 'tabuleiro' | 'arcade';
  materiaId: string;
  habilidades: string[];
  duracaoMinutos: [min: number, max: number];
  /** Caminho (relativo à plataforma) do build do jogo, carregado só quando o jogador abre o jogo. */
  url: string;
}

interface Envelope {
  canal: typeof CANAL;
  versao: number;
}

/** Corpo das mensagens que o jogo envia, sem o envelope. */
export type CorpoDoJogo = { tipo: 'pronto' } | { tipo: 'resultado'; resultado: ResultadoJogo } | { tipo: 'sair' };
/** Corpo das mensagens que a plataforma envia, sem o envelope. */
export type CorpoDaPlataforma = { tipo: 'iniciar'; config: ConfigPartida };

export type MensagemDoJogo = Envelope & CorpoDoJogo;
export type MensagemDaPlataforma = Envelope & CorpoDaPlataforma;

/** Confere o envelope. O tipo da mensagem ainda precisa ser checado por quem recebe. */
export function ehMensagem<T extends MensagemDoJogo | MensagemDaPlataforma>(dado: unknown): dado is T {
  return (
    typeof dado === 'object' &&
    dado !== null &&
    (dado as Partial<Envelope>).canal === CANAL &&
    (dado as Partial<Envelope>).versao === VERSAO_PROTOCOLO
  );
}

/**
 * Em páginas isoladas (sandbox) a origem é "null" e não serve para filtrar mensagens.
 * Nesse caso, quem recebe confia só na checagem de quem enviou (event.source).
 */
export const origemUtil = (origem: string) => origem !== 'null';
export const destinoDe = (origem: string) => (origemUtil(origem) ? origem : '*');
