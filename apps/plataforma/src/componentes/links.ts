import type { Estagio, ModoPartida } from '@jogue/sdk-jogo';
import { jogosDaHabilidade } from '../conteudo/jogos';

/**
 * Link para jogar uma habilidade no primeiro jogo que a treina.
 * Partidas normais abrem a escolha de nível; com `iniciar`, começam direto no estágio dado.
 */
export function linkParaJogar(
  habilidadeId: string,
  modo: ModoPartida = 'normal',
  opcoes: { estagio?: Estagio; iniciar?: boolean } = {},
): string | null {
  const jogo = jogosDaHabilidade(habilidadeId)[0];
  if (!jogo) return null;
  const extra = `${opcoes.estagio ? `&estagio=${opcoes.estagio}` : ''}${opcoes.iniciar ? '&iniciar=1' : ''}`;
  return `/jogar/${jogo.id}?habilidade=${habilidadeId}&modo=${modo}${extra}`;
}
