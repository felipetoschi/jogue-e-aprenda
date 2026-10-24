import { estaDesbloqueada, pontosDominio, pontosMaximos } from './desbloqueio';
import { estadoDe } from './perfil';
import { configParaPartida, type ConfigSemId } from './processar';
import { revisaoVencida } from './revisao';
import type { DefinicaoHabilidade, PerfilProgresso } from './tipos';

/**
 * Próxima partida sugerida na tela de Início: primeiro uma revisão vencida;
 * senão, a habilidade aberta mais perto de subir de estágio.
 */
export function sugerirProximaPartida(
  perfil: PerfilProgresso,
  habilidades: DefinicaoHabilidade[],
  agora: Date = new Date(),
): ConfigSemId | null {
  const abertas = habilidades.filter((h) => estaDesbloqueada(perfil, h, habilidades));
  const paraRevisar = abertas.find((h) => revisaoVencida(estadoDe(perfil, h), agora));
  if (paraRevisar) return configParaPartida(perfil, paraRevisar, 'revisao');

  const candidatas = abertas.filter((h) => pontosDominio(estadoDe(perfil, h), h) < pontosMaximos(h));
  candidatas.sort((a, b) => estadoDe(perfil, b).maestria - estadoDe(perfil, a).maestria);
  const escolhida = candidatas[0];
  return escolhida ? configParaPartida(perfil, escolhida) : null;
}
