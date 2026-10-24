import {
  CANAL,
  VERSAO_PROTOCOLO,
  destinoDe,
  ehMensagem,
  origemUtil,
  type ConfigPartida,
  type CorpoDoJogo,
  type MensagemDaPlataforma,
  type ResultadoJogo,
} from './contrato';

export interface ConexaoPlataforma {
  config: ConfigPartida;
  /** true quando o jogo roda sozinho, fora da plataforma (útil no desenvolvimento). */
  avulso: boolean;
  enviarResultado(resultado: Omit<ResultadoJogo, 'partidaId'>): void;
  sair(): void;
}

export interface OpcoesConexao {
  /**
   * Monta a config quando o jogo roda fora da plataforma (desenvolvimento).
   * É uma função para o jogo só carregar o que precisa para isso quando estiver avulso.
   */
  configAvulsa: () => Promise<Omit<ConfigPartida, 'partidaId'>>;
  /** Origem esperada da plataforma. Por padrão, a mesma do jogo. */
  origemPlataforma?: string;
}

/** Lado do jogo: avisa que está pronto e espera a plataforma mandar a configuração. */
export function conectarAPlataforma(opcoes: OpcoesConexao): Promise<ConexaoPlataforma> {
  const origem = opcoes.origemPlataforma ?? window.location.origin;
  const pai = window.parent !== window ? window.parent : null;

  if (!pai) {
    return opcoes.configAvulsa().then((avulsa) => {
      const config: ConfigPartida = { ...avulsa, partidaId: 'avulsa' };
      return {
        config,
        avulso: true,
        enviarResultado: (r) => console.info('[jogo avulso] resultado', { ...r, partidaId: config.partidaId }),
        sair: () => console.info('[jogo avulso] sair'),
      };
    });
  }

  const enviar = (msg: CorpoDoJogo) =>
    pai.postMessage({ canal: CANAL, versao: VERSAO_PROTOCOLO, ...msg }, destinoDe(origem));

  return new Promise((resolve) => {
    function aoReceber(evento: MessageEvent) {
      if ((origemUtil(origem) && evento.origin !== origem) || evento.source !== pai) return;
      if (!ehMensagem<MensagemDaPlataforma>(evento.data) || evento.data.tipo !== 'iniciar') return;
      window.removeEventListener('message', aoReceber);
      const { config } = evento.data;
      let enviado = false;
      resolve({
        config,
        avulso: false,
        enviarResultado(resultado) {
          if (enviado) return;
          enviado = true;
          enviar({ tipo: 'resultado', resultado: { ...resultado, partidaId: config.partidaId } });
        },
        sair: () => enviar({ tipo: 'sair' }),
      });
    }
    window.addEventListener('message', aoReceber);
    enviar({ tipo: 'pronto' });
  });
}
