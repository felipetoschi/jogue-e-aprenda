import type { DefinicaoHabilidade } from '@jogue/progressao';
import type { Estagio, FormatoQuestao } from '@jogue/sdk-jogo';

export interface Materia {
  id: string;
  nome: string;
  /** false = aparece como "em breve". */
  disponivel: boolean;
}

export interface Habilidade extends DefinicaoHabilidade {
  /** Formato das perguntas desta habilidade; um jogo só a oferece se souber mostrar esse formato. */
  formato: FormatoQuestao;
  /** O que cada estágio cobra, para mostrar ao jogador. */
  estagios: Partial<Record<Estagio, string>>;
}
