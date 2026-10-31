import {
  CANAL,
  VERSAO_PROTOCOLO,
  destinoDe,
  ehMensagem,
  origemUtil,
  type ConfigPartida,
  type CorpoDoJogo,
  type MensagemDaPlataforma,
  type PartidaRegistrada,
  type ResultadoJogo,
} from './contrato';

export interface ConexaoPlataforma {
  /** A partida atual. Muda quando o jogador começa a próxima com comecarProxima. */
  config: ConfigPartida;
  /** true quando o jogo roda sozinho, fora da plataforma (útil no desenvolvimento). */
  avulso: boolean;
  enviarResultado(resultado: Omit<ResultadoJogo, 'partidaId'>): void;
  sair(): void;
  /** Avisa quando a plataforma salvou o resultado e já preparou a próxima partida. */
  aoRegistrar(funcao: (registro: PartidaRegistrada) => void): void;
  /** Leva o jogador à tela de resultado da partida que acabou. */
  verResultado(): void;
  /** Começa a próxima partida preparada pela plataforma; a config dela passa a valer. */
  comecarProxima(proxima: ConfigPartida): void;
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
        aoRegistrar: () => {},
        verResultado: () => console.info('[jogo avulso] ver resultado'),
        comecarProxima: () => {},
      };
    });
  }

  const enviar = (msg: CorpoDoJogo) =>
    pai.postMessage({ canal: CANAL, versao: VERSAO_PROTOCOLO, ...msg }, destinoDe(origem));

  return new Promise((resolve) => {
    let conexao: ConexaoPlataforma | null = null;
    let aoRegistrar: ((registro: PartidaRegistrada) => void) | null = null;
    let enviado = false;

    function aoReceber(evento: MessageEvent) {
      if ((origemUtil(origem) && evento.origin !== origem) || evento.source !== pai) return;
      if (!ehMensagem<MensagemDaPlataforma>(evento.data)) return;
      const msg = evento.data;
      if (msg.tipo === 'iniciar' && !conexao) {
        conexao = {
          config: msg.config,
          avulso: false,
          enviarResultado(resultado) {
            if (enviado) return;
            enviado = true;
            enviar({ tipo: 'resultado', resultado: { ...resultado, partidaId: conexao!.config.partidaId } });
          },
          sair: () => enviar({ tipo: 'sair' }),
          aoRegistrar: (funcao) => {
            aoRegistrar = funcao;
          },
          verResultado: () => enviar({ tipo: 'verResultado' }),
          comecarProxima(proxima) {
            conexao!.config = proxima;
            enviado = false;
            enviar({ tipo: 'novaPartida', partidaId: proxima.partidaId });
          },
        };
        resolve(conexao);
      } else if (msg.tipo === 'registrado') {
        aoRegistrar?.(msg.registro);
      }
    }
    window.addEventListener('message', aoReceber);
    enviar({ tipo: 'pronto' });
  });
}
