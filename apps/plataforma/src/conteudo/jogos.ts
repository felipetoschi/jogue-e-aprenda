import { HABILIDADES, MATERIAS } from '@jogue/conteudo';
import type { ManifestoJogo } from '@jogue/sdk-jogo';
// Só os metadados do jogo entram no site principal; o código do jogo é baixado ao abrir a partida.
import cobrinha from '@jogue/jogo-cobrinha-que-calcula/manifesto';

export const JOGOS: ManifestoJogo[] = [cobrinha as ManifestoJogo];

export const jogoPorId = (id: string) => JOGOS.find((j) => j.id === id);

/** Disciplinas disponíveis que o jogo oferece. */
export const materiasDoJogo = (jogo: ManifestoJogo) => MATERIAS.filter((m) => m.disponivel && jogo.materias.includes(m.id));

/** Habilidades do banco de conteúdo que o jogo sabe mostrar (disciplina e formato de pergunta). */
export const habilidadesDoJogo = (jogo: ManifestoJogo) =>
  HABILIDADES.filter((h) => jogo.materias.includes(h.materiaId) && jogo.formatos.includes(h.formato));

export const jogosDaHabilidade = (habilidadeId: string) =>
  JOGOS.filter((j) => habilidadesDoJogo(j).some((h) => h.id === habilidadeId));
