import { HABILIDADES, habilidadePorId, habilidadesDaMateria, MATERIAS, type Habilidade } from '@jogue/conteudo';
import { estadoDe, PARAMETROS, prerequisitosPendentes, progressoMateria, revisaoVencida } from '@jogue/progressao';
import { NOMES_ESTAGIO } from '@jogue/sdk-jogo';
import { Link } from 'react-router';
import { linkParaEscolher } from '../componentes/links';
import { Barra, SeloEstagio, SeloMateria } from '../componentes/ui';
import { useProgresso } from '../estado/progresso';

/**
 * Progresso geral por disciplina, sem ligação com um jogo:
 * qualquer jogo que treine uma habilidade soma no mesmo lugar.
 */
export function Mapa() {
  const { perfil } = useProgresso();
  const agora = new Date();
  const disponiveis = MATERIAS.filter((m) => m.disponivel);
  const emBreve = MATERIAS.filter((m) => !m.disponivel);

  return (
    <div className="pilha">
      <h1>Mapa de progresso</h1>
      {disponiveis.map((materia) => {
        const habilidades = habilidadesDaMateria(materia.id);
        const progresso = progressoMateria(perfil, habilidades);
        return (
          <section key={materia.id} className="pilha">
            <div className="linha-titulo">
              <h2>{materia.nome}</h2>
              <SeloMateria selo={perfil.selos[materia.id]} />
            </div>
            <Barra valor={progresso * 100} maximo={100} rotulo={`Progresso em ${materia.nome}`} />
            <p className="suave">{Math.round(progresso * 100)}% da disciplina dominada</p>
            <div className="grade">
              {habilidades.map((h) => (
                <CartaoHabilidade key={h.id} habilidade={h} agora={agora} />
              ))}
            </div>
          </section>
        );
      })}
      {emBreve.length > 0 && (
        <section className="pilha">
          <h2>Em breve</h2>
          <div className="opcoes-linha">
            {emBreve.map((m) => (
              <span key={m.id} className="etiqueta-em-breve">
                {m.nome}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function CartaoHabilidade({ habilidade: h, agora }: { habilidade: Habilidade; agora: Date }) {
  const { perfil } = useProgresso();
  const estado = estadoDe(perfil, h);
  const pendentes = prerequisitosPendentes(perfil, h, HABILIDADES);

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
      <p className="suave">{h.estagios[estado.estagio]}</p>
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
      <Link className="botao pequeno secundario" to={linkParaEscolher(h.id)}>
        Treinar
      </Link>
    </article>
  );
}
