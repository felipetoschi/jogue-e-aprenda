import type { Estagio, ModoPartida } from '@jogue/sdk-jogo';
import { jogosDaHabilidade } from '../conteudo/jogos';

/** Abre a partida direto num jogo. Sem jogo, usa o primeiro que treina a habilidade; sem estágio, o mais alto já alcançado. */
export function linkParaJogar(
  habilidadeId: string,
  modo: ModoPartida = 'normal',
  opcoes: { estagio?: Estagio; jogoId?: string } = {},
): string | null {
  const jogoId = opcoes.jogoId ?? jogosDaHabilidade(habilidadeId)[0]?.id;
  if (!jogoId) return null;
  return `/jogar/${jogoId}?habilidade=${habilidadeId}&modo=${modo}${opcoes.estagio ? `&estagio=${opcoes.estagio}` : ''}`;
}

/** Leva à escolha de jogo, já com a habilidade marcada quando houver. */
export const linkParaEscolher = (habilidadeId?: string) => (habilidadeId ? `/jogos?habilidade=${habilidadeId}` : '/jogos');
