import type { Estagio, ModoPartida } from '@jogue/sdk-jogo';
import { jogosDaHabilidade } from '../conteudo/jogos';

/** Link para jogar uma habilidade no primeiro jogo que a treina. Sem estágio, joga no mais alto já alcançado. */
export function linkParaJogar(habilidadeId: string, modo: ModoPartida = 'normal', opcoes: { estagio?: Estagio } = {}): string | null {
  const jogo = jogosDaHabilidade(habilidadeId)[0];
  if (!jogo) return null;
  return `/jogar/${jogo.id}?habilidade=${habilidadeId}&modo=${modo}${opcoes.estagio ? `&estagio=${opcoes.estagio}` : ''}`;
}
