import { HABILIDADES, MATERIAS } from '@jogue/conteudo';
import type { ManifestoJogo } from '@jogue/sdk-jogo';
// Só os metadados do jogo entram no site principal; o código do jogo é baixado ao abrir a partida.
import cobrinha from '@jogue/jogo-cobrinha-sabida/manifesto';

export const JOGOS: ManifestoJogo[] = [cobrinha as ManifestoJogo];

/** Ids antigos de jogos renomeados, para links e histórico de antes da troca continuarem valendo. */
export const IDS_ANTIGOS: Record<string, string> = { 'cobrinha-que-calcula': 'cobrinha-sabida' };

export const jogoPorId = (id: string) => JOGOS.find((j) => j.id === (IDS_ANTIGOS[id] ?? id));

/** Disciplinas disponíveis que o jogo oferece. */
export const materiasDoJogo = (jogo: ManifestoJogo) => MATERIAS.filter((m) => m.disponivel && jogo.materias.includes(m.id));

/** Habilidades do banco de conteúdo que o jogo sabe mostrar (disciplina e formato de pergunta). */
export const habilidadesDoJogo = (jogo: ManifestoJogo) =>
  HABILIDADES.filter((h) => jogo.materias.includes(h.materiaId) && jogo.formatos.includes(h.formato));

export const jogosDaHabilidade = (habilidadeId: string) =>
  JOGOS.filter((j) => habilidadesDoJogo(j).some((h) => h.id === habilidadeId));
