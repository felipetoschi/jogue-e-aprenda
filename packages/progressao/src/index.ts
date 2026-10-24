export * from './tipos';
export { PARAMETROS, TITULOS } from './parametros';
export { perfilNovo, estadoInicial, estadoDe } from './perfil';
export { calcularEstrelas } from './estrelas';
export { calcularXp, type EntradaXp } from './xp';
export { infoNivel, xpParaNivel, type InfoNivel } from './nivel';
export { atualizarMaestria, desempenhoDe } from './maestria';
export { ajusteFino } from './ajuste';
export {
  prerequisitosPendentes,
  estaDesbloqueada,
  pontosDominio,
  pontosMaximos,
  progressoMateria,
  seloPorProgresso,
  melhorSelo,
} from './desbloqueio';
export { revisaoVencida, aplicarRevisao } from './revisao';
export {
  aplicarResultado,
  configParaPartida,
  situacaoProva,
  type ResumoPartida,
  type MudancaHabilidade,
  type ConfigSemId,
  type SituacaoProva,
} from './processar';
export { sugerirProximaPartida } from './sugestao';
