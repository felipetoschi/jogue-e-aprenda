import {
  CANAL,
  VERSAO_PROTOCOLO,
  destinoDe,
  ehMensagem,
  origemUtil,
  type ConfigPartida,
  type MensagemDaPlataforma,
  type MensagemDoJogo,
  type ResultadoJogo,
} from './contrato';
import { validarResultado } from './validacao';

export interface EventosCanal {
  aoReceberResultado(resultado: ResultadoJogo): void;
  aoSair(): void;
  aoResultadoInvalido?(problemas: string[]): void;
}

/**
 * Lado da plataforma: quando o jogo avisa que está pronto, envia a configuração
 * e passa a escutar o resultado. Aceita um único resultado por partida.
 * Retorna uma função para encerrar o canal.
 */
export function abrirCanalComJogo(
  iframe: HTMLIFrameElement,
  config: ConfigPartida,
  eventos: EventosCanal,
  origemJogo: string = window.location.origin,
): () => void {
  let resultadoRecebido = false;

  function aoReceber(evento: MessageEvent) {
    if ((origemUtil(origemJogo) && evento.origin !== origemJogo) || evento.source !== iframe.contentWindow) return;
    const msg = evento.data;
    if (!ehMensagem<MensagemDoJogo>(msg)) return;

    if (msg.tipo === 'pronto') {
      const iniciar: MensagemDaPlataforma = { canal: CANAL, versao: VERSAO_PROTOCOLO, tipo: 'iniciar', config };
      iframe.contentWindow?.postMessage(iniciar, destinoDe(origemJogo));
    } else if (msg.tipo === 'resultado' && !resultadoRecebido) {
      const { resultado } = msg;
      const problemas = validarResultado(resultado, config);
      if (problemas.length > 0) {
        eventos.aoResultadoInvalido?.(problemas);
        return;
      }
      resultadoRecebido = true;
      eventos.aoReceberResultado(resultado);
    } else if (msg.tipo === 'sair') {
      eventos.aoSair();
    }
  }

  window.addEventListener('message', aoReceber);
  return () => window.removeEventListener('message', aoReceber);
}
