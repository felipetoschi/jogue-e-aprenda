import type { Estagio } from '@jogue/sdk-jogo';

export interface Prerequisito {
  habilidadeId: string;
  estagio: Estagio;
}

export interface DefinicaoHabilidade {
  id: string;
  nome: string;
  materiaId: string;
  /** Algumas habilidades começam acima do Básico (ex.: Expressões). */
  estagioInicial: Estagio;
  prerequisitos: Prerequisito[];
}

export interface RevisaoAgendada {
  /** Estágio superado que está sendo revisado. */
  estagio: Estagio;
  /** Posição na lista de intervalos (3, 7, 14, 30, 60 dias). */
  indice: number;
  venceEm: string;
}

export interface EstadoHabilidade {
  estagio: Estagio;
  /** Maestria de 0 a 100 no estágio atual. */
  maestria: number;
  partidasNoEstagio: number;
  /** Desempenho (0 a 100) das últimas partidas, mais recente por último. */
  ultimosDesempenhos: number[];
  revisao: RevisaoAgendada | null;
  revisoesRuinsSeguidas: number;
  enferrujada: boolean;
}

export type Selo = 'bronze' | 'prata' | 'ouro' | 'diamante';

export interface PerfilProgresso {
  versao: 1;
  xp: number;
  habilidades: Record<string, EstadoHabilidade>;
  /** Último dia (AAAA-MM-DD) com partida, para o bônus da primeira do dia. */
  ultimoDia: string | null;
  /** Partidas do dia por "habilidade:estágio", para o corte de XP por repetição. */
  partidasDoDia: Record<string, number>;
  /** Maior selo já conquistado por matéria. Nunca é perdido. */
  selos: Record<string, Selo>;
  /** Data da última prova de nivelamento por "habilidade:estágio". Opcional em perfis antigos. */
  provas?: Record<string, string>;
}
