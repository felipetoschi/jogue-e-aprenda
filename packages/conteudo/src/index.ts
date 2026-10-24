/**
 * Banco de conteúdo: todo o conteúdo de todos os jogos, separado por disciplina.
 * Os jogos não têm conteúdo próprio; a plataforma gera as perguntas aqui e as envia ao jogo.
 * Para uma nova disciplina, crie a pasta dela com habilidades e gerador e registre-a abaixo.
 */
import type { Estagio, Questao } from '@jogue/sdk-jogo';
import type { Rng } from './aleatorio';
import { HABILIDADES_MATEMATICA } from './matematica/habilidades';
import { questaoDeMatematica } from './matematica/questoes';
import { MATERIAS } from './materias';
import type { Habilidade } from './tipos';

export type { Habilidade, Materia } from './tipos';
export { MATERIAS } from './materias';

export const HABILIDADES: Habilidade[] = [...HABILIDADES_MATEMATICA];

type Gerador = (habilidadeId: string, estagio: Estagio, ajuste: number, rng: Rng) => Questao;

const GERADORES: Record<string, Gerador> = {
  matematica: questaoDeMatematica,
};

export const habilidadePorId = (id: string) => HABILIDADES.find((h) => h.id === id);
export const materiaPorId = (id: string) => MATERIAS.find((m) => m.id === id);
export const habilidadesDaMateria = (materiaId: string) => HABILIDADES.filter((h) => h.materiaId === materiaId);

/** Gera as perguntas de uma partida para uma habilidade, num estágio e dificuldade. */
export function gerarQuestoes(habilidadeId: string, estagio: Estagio, ajuste: number, quantidade: number, rng: Rng = Math.random): Questao[] {
  const habilidade = habilidadePorId(habilidadeId);
  const gerador = habilidade && GERADORES[habilidade.materiaId];
  if (!gerador) throw new Error(`Sem conteúdo para a habilidade ${habilidadeId}`);
  return Array.from({ length: quantidade }, () => gerador(habilidadeId, estagio, ajuste, rng));
}
