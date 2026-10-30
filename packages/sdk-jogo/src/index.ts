export * from './contrato';
export { PADRAO, alternativasPorPergunta, pontuacaoPadrao, segundosPorPergunta, zerou } from './padrao';
export { validarResultado } from './validacao';
export { conectarAPlataforma, type ConexaoPlataforma, type OpcoesConexao } from './jogo';
export { abrirCanalComJogo, type EventosCanal } from './plataforma';
