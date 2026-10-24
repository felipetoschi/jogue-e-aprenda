import { configParaPartida, estaDesbloqueada, situacaoProva, sugerirProximaPartida, type ResumoPartida } from '@jogue/progressao';
import { abrirCanalComJogo, ESTAGIOS, type ConfigPartida, type Estagio, type ModoPartida, type ResultadoJogo } from '@jogue/sdk-jogo';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router';
import { HABILIDADES, habilidadePorId } from '../conteudo/habilidades';
import { jogoPorId } from '../conteudo/jogos';
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

  const habilidades = (jogo?.habilidades ?? []).map((id) => habilidadePorId(id)).filter((h) => h !== undefined);
  const abertas = habilidades.filter((h) => estaDesbloqueada(perfil, h, HABILIDADES));
  const pedida = abertas.find((h) => h.id === busca.get('habilidade'));
  const def = pedida ?? abertas.find((h) => h.id === sugerirProximaPartida(perfil, abertas)?.habilidadeId) ?? abertas[0];
  const provaIndisponivel = modo === 'nivelamento' && def && !situacaoProva(perfil, def)?.disponivel;

  const [config] = useState<ConfigPartida | null>(() =>
    def && !provaIndisponivel
      ? { ...configParaPartida(perfil, def, modo, ehEstagio(estagioPedido) ? estagioPedido : undefined), partidaId: novoId() }
      : null,
  );

  if (!jogo || !config) {
    return (
      <div className="pilha">
        <h1>{!jogo ? 'Jogo não encontrado' : provaIndisponivel ? 'A prova não está disponível agora' : 'Habilidade bloqueada'}</h1>
        {provaIndisponivel && <p className="suave">Cada prova pode ser feita uma vez por semana.</p>}
        <Link to="/mapa">Ver o mapa</Link>
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
        {config.modo === 'nivelamento' && <span className="suave">Prova de nivelamento</span>}
      </div>
      <iframe ref={iframe} className="partida-jogo" src={url} title="Jogo" allow="fullscreen" />
    </div>
  );
}
