import type { ManifestoJogo } from '@jogue/sdk-jogo';
// Só os metadados do jogo entram no site principal; o código do jogo é baixado ao abrir a partida.
import cobrinha from '@jogue/jogo-cobrinha-que-calcula/manifesto';

export const JOGOS: ManifestoJogo[] = [cobrinha as ManifestoJogo];

export const jogoPorId = (id: string) => JOGOS.find((j) => j.id === id);

export const jogosDaHabilidade = (habilidadeId: string) => JOGOS.filter((j) => j.habilidades.includes(habilidadeId));
