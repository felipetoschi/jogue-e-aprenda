import {
  configParaPartida,
  estadoDe,
  estagiosLiberados,
  estaDesbloqueada,
  prerequisitosPendentes,
  situacaoProva,
  sugerirProximaPartida,
  type ResumoPartida,
} from '@jogue/progressao';
import {
  abrirCanalComJogo,
  ESTAGIOS,
  NOMES_ESTAGIO,
  type ConfigPartida,
  type Estagio,
  type ManifestoJogo,
  type ModoPartida,
  type ResultadoJogo,
} from '@jogue/sdk-jogo';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router';
import { linkParaJogar } from '../componentes/links';
import { HABILIDADES, habilidadePorId, materiaPorId } from '../conteudo/habilidades';
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

export function Jogar() {
  const { jogoId = '' } = useParams();
  const [busca] = useSearchParams();
  const { perfil } = useProgresso();
  const jogo = jogoPorId(jogoId);
  const modo = (busca.get('modo') as ModoPartida | null) ?? 'normal';
  const estagioPedido = busca.get('estagio');
  const def = habilidadePorId(busca.get('habilidade') ?? '');
  // Revisão, prova e "jogar de novo" começam direto; o resto passa pela escolha de nível.
  const comecarDireto = modo !== 'normal' || busca.get('iniciar') === '1';
  const [config, setConfig] = useState<ConfigPartida | null>(() =>
    jogo && def && comecarDireto && estaDesbloqueada(perfil, def, HABILIDADES) && (modo !== 'nivelamento' || situacaoProva(perfil, def)?.disponivel)
      ? { ...configParaPartida(perfil, def, modo, ehEstagio(estagioPedido) ? estagioPedido : undefined), partidaId: novoId() }
      : null,
  );

  if (!jogo) {
    return (
      <div className="pilha">
        <h1>Jogo não encontrado</h1>
        <Link to="/jogos">Ver jogos</Link>
      </div>
    );
  }

  if (config) return <TelaPartida jogoId={jogo.id} url={jogo.url} config={config} />;

  return <PreJogo jogo={jogo} habilidadePedida={def?.id} aoComecar={(c) => setConfig({ ...c, partidaId: novoId() })} />;
}

/** Antes da partida: escolhe o que treinar e o nível. O estágio mais alto já alcançado vem selecionado. */
function PreJogo({
  jogo,
  habilidadePedida,
  aoComecar,
}: {
  jogo: ManifestoJogo;
  habilidadePedida?: string;
  aoComecar: (config: Omit<ConfigPartida, 'partidaId'>) => void;
}) {
  const { perfil } = useProgresso();
  const habilidades = jogo.habilidades.map((id) => habilidadePorId(id)).filter((h) => h !== undefined);
  const abertas = habilidades.filter((h) => estaDesbloqueada(perfil, h, HABILIDADES));
  const sugerida = sugerirProximaPartida(perfil, abertas)?.habilidadeId;
  const inicial = abertas.find((h) => h.id === habilidadePedida) ?? abertas.find((h) => h.id === sugerida) ?? abertas[0];

  const [habilidadeId, setHabilidadeId] = useState(inicial?.id);
  const def = habilidades.find((h) => h.id === habilidadeId);
  const atual = def ? estadoDe(perfil, def).estagio : 'basico';
  const [estagio, setEstagio] = useState<Estagio>(atual);

  if (!def) {
    return (
      <div className="pilha">
        <h1>{jogo.nome}</h1>
        <p className="suave">Nenhuma habilidade deste jogo está aberta ainda.</p>
      </div>
    );
  }

  const liberados = estagiosLiberados(perfil, def);
  const estagiosDoJogo = ESTAGIOS.filter((e) => ESTAGIOS.indexOf(e) >= ESTAGIOS.indexOf(def.estagioInicial));
  const prova = situacaoProva(perfil, def);
  const linkProva = prova?.disponivel ? linkParaJogar(def.id, 'nivelamento') : null;

  function escolherHabilidade(id: string) {
    const nova = habilidades.find((h) => h.id === id);
    if (!nova) return;
    setHabilidadeId(id);
    setEstagio(estadoDe(perfil, nova).estagio);
  }

  return (
    <div className="pilha pre-jogo">
      <div>
        <p className="sobretitulo">{materiaPorId(jogo.materiaId)?.nome}</p>
        <h1>{jogo.nome}</h1>
      </div>

      <section className="pilha-curta" aria-labelledby="treinar">
        <h2 id="treinar" className="rotulo-grupo">
          O que treinar
        </h2>
        <div className="opcoes-linha">
          {habilidades.map((h) => {
            const aberta = estaDesbloqueada(perfil, h, HABILIDADES);
            const falta = prerequisitosPendentes(perfil, h, HABILIDADES)
              .map((p) => `${habilidadePorId(p.habilidadeId)?.nome} — ${NOMES_ESTAGIO[p.estagio]}`)
              .join(', ');
            return (
              <button
                key={h.id}
                type="button"
                className={h.id === def.id ? 'opcao selecionada' : 'opcao'}
                aria-pressed={h.id === def.id}
                disabled={!aberta}
                title={aberta ? undefined : `Falta: ${falta}`}
                onClick={() => escolherHabilidade(h.id)}
              >
                {!aberta && <Cadeado />}
                {h.nome}
              </button>
            );
          })}
        </div>
      </section>

      <section className="pilha-curta" aria-labelledby="nivel">
        <h2 id="nivel" className="rotulo-grupo">
          Nível
        </h2>
        <div className="opcoes-linha seletor-estagio" role="radiogroup" aria-labelledby="nivel">
          {estagiosDoJogo.map((e) => {
            const liberado = liberados.includes(e);
            return (
              <button
                key={e}
                type="button"
                role="radio"
                aria-checked={e === estagio}
                className={`opcao estagio-${e}${e === estagio ? ' selecionada' : ''}`}
                disabled={!liberado}
                onClick={() => setEstagio(e)}
              >
                {!liberado && <Cadeado />}
                {NOMES_ESTAGIO[e]}
              </button>
            );
          })}
        </div>
        <p className="suave">{def.estagios[estagio]}</p>
        {estagio !== atual && <p className="suave">Vale XP, mas não muda sua maestria no {NOMES_ESTAGIO[atual]}.</p>}
        {prova && linkProva && (
          <Link className="link-discreto" to={linkProva}>
            Já sabe o {NOMES_ESTAGIO[prova.estagio]}? Fazer a prova
          </Link>
        )}
      </section>

      <button
        type="button"
        className="botao grande"
        onClick={() => aoComecar(configParaPartida(perfil, def, 'normal', estagio))}
      >
        Jogar
      </button>
    </div>
  );
}

function Cadeado() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" className="cadeado">
      <rect x="2" y="5" width="8" height="6" rx="1.5" fill="currentColor" />
      <path d="M4 5V3.5a2 2 0 0 1 4 0V5" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
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
