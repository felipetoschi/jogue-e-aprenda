import {
  CANAL,
  VERSAO_PROTOCOLO,
  destinoDe,
  ehMensagem,
  origemUtil,
  type ConfigPartida,
  type CorpoDaPlataforma,
  type MensagemDoJogo,
  type PartidaRegistrada,
  type ResultadoJogo,
} from './contrato';
import { validarResultado } from './validacao';

export interface EventosCanal {
  /**
   * Recebe o resultado já validado da partida `config`. Devolvendo o registro (com a próxima partida pronta),
   * o jogo oferece "Jogar de novo" ali mesmo.
   */
  aoReceberResultado(resultado: ResultadoJogo, config: ConfigPartida): PartidaRegistrada | void;
  aoSair(): void;
  /** O jogador pediu a tela de resultado da partida que acabou. */
  aoVerResultado?(): void;
  /** O jogador começou a próxima partida, que passa a ser a atual. */
  aoNovaPartida?(config: ConfigPartida): void;
  aoResultadoInvalido?(problemas: string[]): void;
}

/**
 * Lado da plataforma: quando o jogo avisa que está pronto, envia a configuração
 * e passa a escutar o resultado. Aceita um único resultado por partida; depois dele,
 * a próxima partida oferecida pode começar no mesmo jogo, sem recarregar.
 * Retorna uma função para encerrar o canal.
 */
export function abrirCanalComJogo(
  iframe: HTMLIFrameElement,
  config: ConfigPartida,
  eventos: EventosCanal,
  origemJogo: string = window.location.origin,
): () => void {
  let atual = config;
  let oferecida: ConfigPartida | null = null;
  let resultadoRecebido = false;

  const enviar = (corpo: CorpoDaPlataforma) =>
    iframe.contentWindow?.postMessage({ canal: CANAL, versao: VERSAO_PROTOCOLO, ...corpo }, destinoDe(origemJogo));

  function aoReceber(evento: MessageEvent) {
    if ((origemUtil(origemJogo) && evento.origin !== origemJogo) || evento.source !== iframe.contentWindow) return;
    const msg = evento.data;
    if (!ehMensagem<MensagemDoJogo>(msg)) return;

    if (msg.tipo === 'pronto') {
      enviar({ tipo: 'iniciar', config: atual });
    } else if (msg.tipo === 'resultado' && !resultadoRecebido) {
      const { resultado } = msg;
      const problemas = validarResultado(resultado, atual);
      if (problemas.length > 0) {
        eventos.aoResultadoInvalido?.(problemas);
        return;
      }
      resultadoRecebido = true;
      const registro = eventos.aoReceberResultado(resultado, atual);
      if (registro) {
        oferecida = registro.proxima;
        enviar({ tipo: 'registrado', registro });
      }
    } else if (msg.tipo === 'novaPartida' && oferecida && msg.partidaId === oferecida.partidaId) {
      atual = oferecida;
      oferecida = null;
      resultadoRecebido = false;
      eventos.aoNovaPartida?.(atual);
    } else if (msg.tipo === 'verResultado') {
      eventos.aoVerResultado?.();
    } else if (msg.tipo === 'sair') {
      eventos.aoSair();
    }
  }

  window.addEventListener('message', aoReceber);
  return () => window.removeEventListener('message', aoReceber);
}
