/** Versão do protocolo de mensagens. Mude ao quebrar compatibilidade. */
export const VERSAO_PROTOCOLO = 2;

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

/**
 * Formatos de pergunta. Cada jogo declara quais sabe mostrar; o conteúdo diz o formato de cada habilidade.
 * resposta-curta: enunciado + alternativas curtas (um número, uma palavra, um nome), cada uma com a sua letra.
 */
export type FormatoQuestao = 'resposta-curta';

/** Letras das alternativas, na ordem. No máximo cinco por pergunta (A a E). */
export const LETRAS = ['A', 'B', 'C', 'D', 'E'] as const;
export type Letra = (typeof LETRAS)[number];

/** Uma alternativa da pergunta. O jogo pode mostrar só a letra no lugar de pegar e o texto ao lado da pergunta. */
export interface OpcaoQuestao {
  /** Letra da alternativa, ex.: "A". */
  letra: Letra;
  /** Texto da alternativa, ex.: "56", "Lima", "Rio Amazonas". */
  texto: string;
  correta: boolean;
  /** Nas opções erradas: que erro ela imita e a explicação para o jogador. */
  erro?: { tipo: string; rotulo: string; explicacao: string };
}

/** Uma pergunta do banco de conteúdo, pronta para qualquer jogo mostrar. */
export interface Questao {
  habilidadeId: string;
  /** O que aparece em destaque, ex.: "7 × 8 = ?". */
  enunciado: string;
  /** A pergunta resolvida, para mostrar depois de um erro, ex.: "7 × 8 = 56". */
  resolucao: string;
  opcoes: OpcaoQuestao[];
}

/** Parte da configuração que a progressão decide: o quê, em que estágio e com que dificuldade. */
export interface ConfigBase {
  habilidadeId: string;
  estagio: Estagio;
  /** Dificuldade dentro do estágio, de 0 (mais fácil) a 1 (mais difícil). */
  ajuste: number;
  modo: ModoPartida;
}

/** O que a plataforma entrega ao jogo ao iniciar uma partida. */
export interface ConfigPartida extends ConfigBase {
  partidaId: string;
  /** Nome da habilidade e do estágio para o jogo exibir, ex.: "Adição · Básico". */
  rotulo: string;
  /** As perguntas da partida, vindas do banco de conteúdo da plataforma. */
  questoes: Questao[];
}

/** Um erro explicado, para a plataforma mostrar o que a pessoa confundiu. */
export interface ErroExplicado {
  habilidadeId: string;
  /** Identificador estável do tipo de erro, para agrupar no perfil. */
  tipo: string;
  /** Nome curto do tipo de erro, ex.: "Vizinho da tabuada". */
  rotulo: string;
  /** Frase para o jogador, ex.: "48 é 7 × 7. 7 × 8 = 56." */
  explicacao: string;
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
  /** Como a partida terminou, nas palavras do jogo (ex.: "Bateu na borda"). */
  mensagem?: { titulo: string; detalhe?: string };
  erros?: ErroExplicado[];
  /** Dados próprios do jogo, guardados no histórico (ex.: maior tamanho da cobra). */
  extras?: Record<string, unknown>;
}

/** Metadados que todo jogo declara para entrar no catálogo. */
export interface ManifestoJogo {
  id: string;
  nome: string;
  /** Apresentação curta do jogo, mostrada no card. */
  descricao: string;
  /** Ícone do jogo (caminho relativo à plataforma), arquivo do próprio jogo. */
  icone: string;
  tipo: 'puzzle' | 'tabuleiro' | 'arcade';
  /** Disciplinas que o jogo oferece. As habilidades vêm do banco de conteúdo. */
  materias: string[];
  /** Formatos de pergunta que o jogo sabe mostrar. */
  formatos: FormatoQuestao[];
  /**
   * Quantas alternativas o jogo mostra por pergunta, se for sempre o mesmo número (2 a 5).
   * Sem isso, segue o padrão do estágio (PADRAO.estagios).
   */
  alternativas?: number;
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
