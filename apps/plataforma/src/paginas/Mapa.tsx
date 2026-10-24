import {
  estadoDe,
  estagiosLiberados,
  PARAMETROS,
  prerequisitosPendentes,
  progressoMateria,
  revisaoVencida,
  situacaoProva,
} from '@jogue/progressao';
import { ESTAGIOS, NOMES_ESTAGIO, type Estagio } from '@jogue/sdk-jogo';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { linkParaJogar } from '../componentes/links';
import { Barra, SeloEstagio, SeloMateria } from '../componentes/ui';
import { HABILIDADES, MATERIAS, habilidadePorId, type Habilidade } from '../conteudo/habilidades';
import { useProgresso } from '../estado/progresso';

const formatoDia = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short' });

export function Mapa() {
  const { perfil } = useProgresso();
  const agora = new Date();

  return (
    <div className="pilha">
      <h1>Mapa de habilidades</h1>
      {MATERIAS.map((materia) => {
        const habilidades = HABILIDADES.filter((h) => h.materiaId === materia.id);
        const progresso = progressoMateria(perfil, habilidades);
        return (
          <section key={materia.id} className="pilha">
            <div className="linha-titulo">
              <h2>{materia.nome}</h2>
              <SeloMateria selo={perfil.selos[materia.id]} />
            </div>
            <p className="suave">{Math.round(progresso * 100)}% da matéria dominada</p>
            <div className="lista-habilidades">
              {habilidades.map((h) => (
                <CartaoHabilidade key={h.id} habilidade={h} agora={agora} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

/** Cartão de uma habilidade: progresso, níveis lado a lado (o mais alto já alcançado vem marcado) e Jogar. */
function CartaoHabilidade({ habilidade: h, agora }: { habilidade: Habilidade; agora: Date }) {
  const { perfil } = useProgresso();
  const navegar = useNavigate();
  const estado = estadoDe(perfil, h);
  const [escolhido, setEscolhido] = useState<Estagio>(estado.estagio);
  const pendentes = prerequisitosPendentes(perfil, h, HABILIDADES);
  const liberados = estagiosLiberados(perfil, h);
  const estagios = ESTAGIOS.filter((e) => ESTAGIOS.indexOf(e) >= ESTAGIOS.indexOf(h.estagioInicial));
  const prova = situacaoProva(perfil, h, agora);
  const linkProva = prova?.disponivel ? linkParaJogar(h.id, 'nivelamento') : null;
  // Se o jogador subiu de estágio, o mais alto passa a ser o padrão.
  const nivel = liberados.includes(escolhido) ? escolhido : estado.estagio;

  if (pendentes.length > 0) {
    return (
      <article className="cartao habilidade bloqueada">
        <div className="linha-titulo">
          <h3>{h.nome}</h3>
          <SeloEstagio estagio={estado.estagio} />
        </div>
        <p className="aviso">
          Falta: {pendentes.map((p) => `${habilidadePorId(p.habilidadeId)?.nome ?? p.habilidadeId} — ${NOMES_ESTAGIO[p.estagio]}`).join(', ')}
        </p>
      </article>
    );
  }

  return (
    <article className="cartao habilidade">
      <div className="linha-titulo">
        <h3>{h.nome}</h3>
        <SeloEstagio estagio={estado.estagio} />
      </div>
      <Barra valor={estado.maestria} maximo={100} rotulo={`Maestria em ${h.nome}`} />
      <p className="suave">
        {estado.estagio === 'mestre'
          ? `Domínio ${estado.maestria}`
          : `Maestria ${estado.maestria} de ${PARAMETROS.maestria.promocao} · ${estado.partidasNoEstagio} partida(s) no estágio`}
      </p>
      <div className="etiquetas">
        {revisaoVencida(estado, agora) && <span className="etiqueta">Para revisar</span>}
        {estado.enferrujada && <span className="etiqueta alerta">Enferrujada</span>}
      </div>

      <div className="seletor-estagio" role="radiogroup" aria-label={`Nível de ${h.nome}`}>
        {estagios.map((e) => {
          const liberado = liberados.includes(e);
          return (
            <button
              key={e}
              type="button"
              role="radio"
              aria-checked={e === nivel}
              className={`opcao estagio-${e}${e === nivel ? ' selecionada' : ''}`}
              disabled={!liberado}
              onClick={() => setEscolhido(e)}
            >
              {!liberado && <Cadeado />}
              {NOMES_ESTAGIO[e]}
            </button>
          );
        })}
      </div>
      <p className="suave">
        {h.estagios[nivel]}
        {nivel !== estado.estagio && ` · vale XP, não muda a maestria do ${NOMES_ESTAGIO[estado.estagio]}`}
      </p>

      <div className="acoes">
        <button
          type="button"
          className="botao"
          onClick={() => navegar(linkParaJogar(h.id, 'normal', { estagio: nivel }) ?? '/jogos')}
        >
          Jogar
        </button>
        {prova && linkProva && (
          <Link className="link-discreto" to={linkProva}>
            Já sei: prova do {NOMES_ESTAGIO[prova.estagio]}
          </Link>
        )}
      </div>
      {prova?.liberaEm && <p className="suave">Nova prova em {formatoDia.format(new Date(prova.liberaEm))}</p>}
    </article>
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
