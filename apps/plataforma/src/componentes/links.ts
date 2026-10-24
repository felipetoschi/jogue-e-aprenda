import type { ModoPartida } from '@jogue/sdk-jogo';
import { jogosDaHabilidade } from '../conteudo/jogos';

/** Link para jogar uma habilidade no primeiro jogo que a treina. */
export function linkParaJogar(habilidadeId: string, modo: ModoPartida = 'normal'): string | null {
  const jogo = jogosDaHabilidade(habilidadeId)[0];
  return jogo ? `/jogar/${jogo.id}?habilidade=${habilidadeId}&modo=${modo}` : null;
}
