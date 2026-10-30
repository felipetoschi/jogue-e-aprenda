/**
 * Banco de conteúdo: todo o conteúdo de todos os jogos, separado por disciplina.
 * Os jogos não têm conteúdo próprio; a plataforma gera as perguntas aqui e as envia ao jogo.
 * Para uma nova disciplina, crie a pasta dela com habilidades e gerador e registre-a abaixo.
 */
import { LETRAS, alternativasPorPergunta, type Estagio, type Questao } from '@jogue/sdk-jogo';
import type { Rng } from './aleatorio';
import { HABILIDADES_GEOGRAFIA } from './geografia/habilidades';
import { questaoDeGeografia } from './geografia/questoes';
import { HABILIDADES_MATEMATICA } from './matematica/habilidades';
import { questaoDeMatematica } from './matematica/questoes';
import { MATERIAS } from './materias';
import type { Habilidade, QuestaoGerada } from './tipos';

export type { Habilidade, Materia, QuestaoGerada } from './tipos';
export { MATERIAS } from './materias';

export const HABILIDADES: Habilidade[] = [...HABILIDADES_MATEMATICA, ...HABILIDADES_GEOGRAFIA];

/** Gera uma pergunta com exatamente `alternativas` opções, uma delas certa. */
type Gerador = (habilidadeId: string, estagio: Estagio, ajuste: number, alternativas: number, rng: Rng) => QuestaoGerada;

const GERADORES: Record<string, Gerador> = {
  matematica: questaoDeMatematica,
  geografia: questaoDeGeografia,
};

/** Tentativas de sortear uma pergunta que ainda não saiu na partida, antes de aceitar uma repetida. */
const TENTATIVAS_SEM_REPETIR = 30;

export const habilidadePorId = (id: string) => HABILIDADES.find((h) => h.id === id);
export const materiaPorId = (id: string) => MATERIAS.find((m) => m.id === id);
export const habilidadesDaMateria = (materiaId: string) => HABILIDADES.filter((h) => h.materiaId === materiaId);

export interface OpcoesGeracao {
  /** Alternativas por pergunta que o jogo pede (manifesto). Sem isso, o padrão do estágio. */
  alternativas?: number;
  rng?: Rng;
}

/**
 * Gera as perguntas de uma partida para uma habilidade, num estágio e dificuldade.
 * Cada alternativa recebe a sua letra (A, B, C…), na ordem em que aparece.
 */
export function gerarQuestoes(
  habilidadeId: string,
  estagio: Estagio,
  ajuste: number,
  quantidade: number,
  { alternativas, rng = Math.random }: OpcoesGeracao = {},
): Questao[] {
  const habilidade = habilidadePorId(habilidadeId);
  const gerador = habilidade && GERADORES[habilidade.materiaId];
  if (!gerador) throw new Error(`Sem conteúdo para a habilidade ${habilidadeId}`);
  const total = alternativasPorPergunta(estagio, alternativas);
  // A mesma pergunta não sai duas vezes na partida, enquanto houver outras para sortear.
  const saiu = new Set<string>();
  const chave = (q: QuestaoGerada) => `${q.enunciado}|${q.opcoes.find((o) => o.correta)?.texto}`;
  return Array.from({ length: quantidade }, () => {
    let questao = gerador(habilidadeId, estagio, ajuste, total, rng);
    for (let i = 0; i < TENTATIVAS_SEM_REPETIR && saiu.has(chave(questao)); i++) {
      questao = gerador(habilidadeId, estagio, ajuste, total, rng);
    }
    saiu.add(chave(questao));
    if (questao.opcoes.length !== total) throw new Error(`Pergunta de ${habilidadeId} sem ${total} alternativas`);
    return { ...questao, opcoes: questao.opcoes.map((o, i) => ({ ...o, letra: LETRAS[i]! })) };
  });
}
