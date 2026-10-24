import type { ConfigPartida, ResultadoJogo } from '@jogue/sdk-jogo';
import type { DefinicaoHabilidade } from './tipos';

export const HABILIDADES: DefinicaoHabilidade[] = [
  { id: 'adicao', nome: 'Adição', materiaId: 'matematica', estagioInicial: 'basico', prerequisitos: [] },
  {
    id: 'subtracao',
    nome: 'Subtração',
    materiaId: 'matematica',
    estagioInicial: 'basico',
    prerequisitos: [{ habilidadeId: 'adicao', estagio: 'intermediario' }],
  },
];

export function config(parcial: Partial<ConfigPartida> = {}): ConfigPartida {
  return { partidaId: 'p', habilidadeId: 'adicao', estagio: 'basico', ajuste: 0, modo: 'normal', ...parcial };
}

export function resultado(acertos: number, tentativas: number, parcial: Partial<ResultadoJogo> = {}): ResultadoJogo {
  return {
    partidaId: 'p',
    pontuacao: Math.round((acertos / 20) * 100),
    desempenho: [{ habilidadeId: 'adicao', acertos, tentativas }],
    ajudas: 0,
    status: 'concluida',
    ...parcial,
  };
}
