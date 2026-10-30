import { configParaPartida, estaDesbloqueada, sugerirProximaPartida, type ResumoPartida } from '@jogue/progressao';
import { gerarQuestoes, HABILIDADES } from '@jogue/conteudo';
import {
  abrirCanalComJogo,
  ESTAGIOS,
  NOMES_ESTAGIO,
  PADRAO,
  type ConfigPartida,
  type Estagio,
  type ModoPartida,
  type ResultadoJogo,
} from '@jogue/sdk-jogo';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router';
import { habilidadesDoJogo, jogoPorId } from '../conteudo/jogos';
import { modoApp } from '../componentes/InstalarApp';
import { useProgresso } from '../estado/progresso';

export interface EstadoResultado {
  jogoId: string;
  config: ConfigPartida;
  resultado: ResultadoJogo;
  resumo: ResumoPartida;
}

const novoId = () => globalThis.crypto?.randomUUID?.() ?? `p-${Date.now()}-${Math.random().toString(36).slice(2)}`;

const ehEstagio = (valor: string | null): valor is Estagio => (ESTAGIOS as readonly string[]).includes(valor ?? '');

/**
 * Abre a partida direto. Sem estágio na URL, joga no mais alto já alcançado;
 * sem habilidade, na sugerida para este jogo.
 */
export function Jogar() {
  const { jogoId = '' } = useParams();
  const [busca] = useSearchParams();
  const { perfil } = useProgresso();
  const jogo = jogoPorId(jogoId);
  const modo = (busca.get('modo') as ModoPartida | null) ?? 'normal';
  const estagioPedido = busca.get('estagio');

  const habilidades = jogo ? habilidadesDoJogo(jogo) : [];
  const abertas = habilidades.filter((h) => estaDesbloqueada(perfil, h, HABILIDADES));
  const pedida = abertas.find((h) => h.id === busca.get('habilidade'));
  const def = pedida ?? abertas.find((h) => h.id === sugerirProximaPartida(perfil, abertas)?.habilidadeId) ?? abertas[0];

  const [config] = useState<ConfigPartida | null>(() => {
    if (!jogo || !def) return null;
    const base = configParaPartida(perfil, def, modo, ehEstagio(estagioPedido) ? estagioPedido : undefined);
    // As perguntas vêm do banco de conteúdo, com as alternativas que o jogo pede; o jogo só as mostra.
    const questoes = gerarQuestoes(def.id, base.estagio, base.ajuste, PADRAO.questoesPorPartida, { alternativas: jogo.alternativas });
    return { ...base, partidaId: novoId(), rotulo: `${def.nome} · ${NOMES_ESTAGIO[base.estagio]}`, questoes };
  });

  if (!jogo || !config) {
    return (
      <div className="pilha">
        <h1>{!jogo ? 'Jogo não encontrado' : 'Habilidade bloqueada'}</h1>
        <Link to="/progresso">Ver o progresso</Link>
      </div>
    );
  }

  return <TelaPartida jogoId={jogo.id} url={jogo.url} config={config} />;
}

/** O jogo roda isolado num iframe e só é baixado agora, ao abrir a partida. */
function TelaPartida({ jogoId, url, config: configInicial }: { jogoId: string; url: string; config: ConfigPartida }) {
  const [config] = useState(configInicial);
  const iframe = useRef<HTMLIFrameElement>(null);
  const navegar = useNavigate();
  const { registrarResultado, registrarAbandono } = useProgresso();
  const funcoes = useRef({ registrarResultado, registrarAbandono });
  funcoes.current = { registrarResultado, registrarAbandono };

  useEffect(() => {
    if (!iframe.current) return;
    return abrirCanalComJogo(iframe.current, config, {
      aoReceberResultado(resultado) {
        if (resultado.status === 'abandonada') {
          funcoes.current.registrarAbandono(jogoId, config);
          navegar('/');
          return;
        }
        const resumo = funcoes.current.registrarResultado(jogoId, config, resultado);
        const estado: EstadoResultado = { jogoId, config, resultado, resumo };
        navegar('/resultado', { state: estado, replace: true });
      },
      aoSair() {
        funcoes.current.registrarAbandono(jogoId, config);
        navegar('/');
      },
      aoResultadoInvalido(problemas) {
        console.warn('Resultado recusado pela plataforma:', problemas);
      },
    });
  }, [config, jogoId, navegar]);

  return (
    <div className="partida">
      <div className="partida-topo">
        <button
          type="button"
          className="link-botao"
          onClick={() => {
            registrarAbandono(jogoId, config);
            navegar('/');
          }}
        >
          ← Sair
        </button>
        {config.modo === 'revisao' && <span className="suave">Revisão</span>}
        <BotaoTelaCheia />
      </div>
      <iframe ref={iframe} className="partida-jogo" src={url} title="Jogo" allow="fullscreen" />
    </div>
  );
}

/** Tela cheia no navegador, onde o aparelho permite (no iPhone, só instalando o app). */
function BotaoTelaCheia() {
  const [cheia, setCheia] = useState(() => !!document.fullscreenElement);
  useEffect(() => {
    const aoMudar = () => setCheia(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', aoMudar);
    return () => document.removeEventListener('fullscreenchange', aoMudar);
  }, []);
  if (!document.fullscreenEnabled || modoApp('fullscreen')) return null;
  return (
    <button
      type="button"
      className="link-botao tela-cheia"
      onClick={() => (cheia ? document.exitFullscreen() : document.documentElement.requestFullscreen()).catch(() => {})}
    >
      {cheia ? 'Sair da tela cheia' : 'Tela cheia'}
    </button>
  );
}
