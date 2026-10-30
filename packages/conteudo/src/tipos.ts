import type { DefinicaoHabilidade } from '@jogue/progressao';
import type { Estagio, FormatoQuestao, OpcaoQuestao, Questao } from '@jogue/sdk-jogo';

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

/** Pergunta como o gerador da disciplina a cria: as letras das alternativas são postas depois, em gerarQuestoes. */
export interface QuestaoGerada extends Omit<Questao, 'opcoes'> {
  opcoes: Omit<OpcaoQuestao, 'letra'>[];
}
