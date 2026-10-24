import { configParaPartida, estadoDe, estaDesbloqueada, type ResumoPartida } from '@jogue/progressao';
import { abrirCanalComJogo, type ConfigPartida, type ModoPartida, type ResultadoJogo } from '@jogue/sdk-jogo';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router';
import { SeloEstagio } from '../componentes/ui';
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

export function Jogar() {
  const { jogoId = '' } = useParams();
  const [busca] = useSearchParams();
  const { perfil } = useProgresso();
  const jogo = jogoPorId(jogoId);
  const habilidadeId = busca.get('habilidade');
  const modo = (busca.get('modo') as ModoPartida | null) ?? 'normal';

  if (!jogo) {
    return (
      <div className="conteudo pilha">
        <h1>Jogo não encontrado</h1>
        <Link to="/jogos">Ver jogos</Link>
      </div>
    );
  }

  const def = habilidadeId ? habilidadePorId(habilidadeId) : undefined;
  if (!def || !jogo.habilidades.includes(def.id)) {
    return (
      <div className="conteudo pilha">
        <h1>{jogo.nome}</h1>
        <p className="suave">Escolha o que treinar:</p>
        <ul className="lista">
          {jogo.habilidades.map((id) => {
            const h = habilidadePorId(id);
            if (!h) return null;
            const aberta = estaDesbloqueada(perfil, h, HABILIDADES);
            return (
              <li key={id}>
                <span>
                  {h.nome} <SeloEstagio estagio={estadoDe(perfil, h).estagio} />
                </span>
                {aberta ? <Link to={`?habilidade=${id}&modo=normal`}>Jogar</Link> : <span className="suave">Bloqueada</span>}
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  if (!estaDesbloqueada(perfil, def, HABILIDADES)) {
    return (
      <div className="conteudo pilha">
        <h1>{def.nome} ainda está bloqueada</h1>
        <Link to="/mapa">Ver o que falta no mapa</Link>
      </div>
    );
  }

  return <TelaPartida key={`${def.id}-${modo}`} jogoId={jogo.id} url={jogo.url} config={{ ...configParaPartida(perfil, def, modo), partidaId: novoId() }} />;
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
      </div>
      <iframe ref={iframe} className="partida-jogo" src={url} title="Jogo" allow="fullscreen" />
    </div>
  );
}
