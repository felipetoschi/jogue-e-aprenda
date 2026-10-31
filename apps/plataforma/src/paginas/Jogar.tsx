import { configParaPartida, estaDesbloqueada, sugerirProximaPartida, type PerfilProgresso, type ResumoPartida } from '@jogue/progressao';
import { gerarQuestoes, HABILIDADES, type Habilidade } from '@jogue/conteudo';
import {
  abrirCanalComJogo,
  ESTAGIOS,
  NOMES_ESTAGIO,
  PADRAO,
  type ConfigPartida,
  type Estagio,
  type ManifestoJogo,
  type ModoPartida,
  type ResultadoJogo,
} from '@jogue/sdk-jogo';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router';
import { habilidadesDoJogo, jogoPorId } from '../conteudo/jogos';
import { modoApp } from '../componentes/InstalarApp';
import { linkParaEscolher } from '../componentes/links';
import { useProgresso } from '../estado/progresso';

export interface EstadoResultado {
  jogoId: string;
  config: ConfigPartida;
  resultado: ResultadoJogo;
  resumo: ResumoPartida;
}

const novoId = () => globalThis.crypto?.randomUUID?.() ?? `p-${Date.now()}-${Math.random().toString(36).slice(2)}`;

const ehEstagio = (valor: string | null): valor is Estagio => (ESTAGIOS as readonly string[]).includes(valor ?? '');

/** Monta uma partida: a progressão decide estágio e dificuldade; o conteúdo, as perguntas. */
function montarPartida(
  perfil: PerfilProgresso,
  def: Habilidade,
  jogo: ManifestoJogo,
  modo: ModoPartida,
  estagio: Estagio | undefined,
  comecarDireto: boolean,
): ConfigPartida {
  const base = configParaPartida(perfil, def, modo, estagio);
  // As perguntas vêm do banco de conteúdo, com as alternativas que o jogo pede; o jogo só as mostra.
  const questoes = gerarQuestoes(def.id, base.estagio, base.ajuste, PADRAO.questoesPorPartida, { alternativas: jogo.alternativas });
  return { ...base, partidaId: novoId(), rotulo: `${def.nome} · ${NOMES_ESTAGIO[base.estagio]}`, questoes, comecarDireto };
}

/**
 * Abre a partida direto. Sem estágio na URL, joga no mais alto já alcançado;
 * sem habilidade, na sugerida para este jogo.
 */
export function Jogar() {
  const { jogoId = '' } = useParams();
  const [busca] = useSearchParams();
  const { perfil, historico } = useProgresso();
  const jogo = jogoPorId(jogoId);
  const modo = (busca.get('modo') as ModoPartida | null) ?? 'normal';
  const estagioPedido = busca.get('estagio');

  const habilidades = jogo ? habilidadesDoJogo(jogo) : [];
  const abertas = habilidades.filter((h) => estaDesbloqueada(perfil, h, HABILIDADES));
  const pedida = abertas.find((h) => h.id === busca.get('habilidade'));
  const sugerida = pedida ?? abertas.find((h) => h.id === sugerirProximaPartida(perfil, abertas)?.habilidadeId) ?? abertas[0];

  // Fixados ao abrir: o progresso muda a cada partida, e a sugestão de habilidade com ele.
  const [{ config, def }] = useState(() => {
    if (!jogo || !sugerida) return { config: null, def: null };
    // Quem já jogou este jogo pula a apresentação e vai direto para a contagem.
    const jaJogou = historico.some((r) => r.jogoId === jogo.id);
    const estagio = ehEstagio(estagioPedido) ? estagioPedido : undefined;
    return { config: montarPartida(perfil, sugerida, jogo, modo, estagio, jaJogou), def: sugerida };
  });

  if (!jogo || !config || !def) {
    return (
      <div className="pilha">
        <h1>{!jogo ? 'Jogo não encontrado' : 'Habilidade bloqueada'}</h1>
        <Link to="/progresso">Ver o progresso</Link>
      </div>
    );
  }

  return <TelaPartida jogo={jogo} def={def} config={config} />;
}

/**
 * O jogo roda isolado num iframe e só é baixado agora, ao abrir a partida.
 * Ao fim, o resultado é salvo na hora e a próxima partida já vai pronta para o jogo:
 * "Jogar de novo" recomeça ali mesmo, sem recarregar nem voltar ao menu.
 */
function TelaPartida({ jogo, def, config: configInicial }: { jogo: ManifestoJogo; def: Habilidade; config: ConfigPartida }) {
  const [inicial] = useState(configInicial);
  const iframe = useRef<HTMLIFrameElement>(null);
  const navegar = useNavigate();
  const { registrarResultado, registrarAbandono } = useProgresso();
  const funcoes = useRef({ registrarResultado, registrarAbandono });
  funcoes.current = { registrarResultado, registrarAbandono };
  // Partida atual e, depois do fim, o que a tela de resultado precisa. Sem partida em andamento, sair não é abandono.
  const partida = useRef<{ config: ConfigPartida; emAndamento: boolean; ultimo: EstadoResultado | null }>({
    config: inicial,
    emAndamento: true,
    ultimo: null,
  });
  const voltar = useCallback(() => {
    if (partida.current.emAndamento) funcoes.current.registrarAbandono(jogo.id, partida.current.config);
    partida.current.emAndamento = false;
    // De volta ao card do jogo, com o mesmo tema aberto.
    navegar(linkParaEscolher(partida.current.config.habilidadeId));
  }, [jogo.id, navegar]);

  useEffect(() => {
    if (!iframe.current) return;
    return abrirCanalComJogo(iframe.current, inicial, {
      aoReceberResultado(resultado, config) {
        if (resultado.status === 'abandonada') {
          voltar();
          return;
        }
        const { resumo, perfil } = funcoes.current.registrarResultado(jogo.id, config, resultado);
        partida.current = { config, emAndamento: false, ultimo: { jogoId: jogo.id, config, resultado, resumo } };
        // Quem escolheu um estágio abaixo do atual continua nele; quem zerou vai para o novo estágio.
        const mudanca = resumo.habilidades.find((m) => m.habilidadeId === config.habilidadeId);
        const promovidoPara = mudanca?.promovido ? mudanca.estagioDepois : null;
        const modo: ModoPartida = config.modo === 'treino' ? 'treino' : 'normal';
        const proxima = montarPartida(perfil, def, jogo, modo, promovidoPara ? undefined : config.estagio, true);
        return { proxima, xpGanho: resumo.xpGanho, promovidoPara };
      },
      aoNovaPartida(config) {
        partida.current = { config, emAndamento: true, ultimo: null };
      },
      aoVerResultado() {
        const { ultimo } = partida.current;
        if (ultimo) navegar('/resultado', { state: ultimo, replace: true });
      },
      aoSair: voltar,
      aoResultadoInvalido(problemas) {
        console.warn('Resultado recusado pela plataforma:', problemas);
      },
    });
  }, [inicial, def, jogo, navegar, voltar]);

  return (
    <div className="partida">
      <div className="partida-topo">
        <button type="button" className="link-botao" onClick={voltar}>
          ← Sair
        </button>
        {inicial.modo === 'revisao' && <span className="suave">Revisão</span>}
        <BotaoTelaCheia />
      </div>
      <iframe ref={iframe} className="partida-jogo" src={jogo.url} title="Jogo" allow="fullscreen" />
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
