import { estadoDe, PARAMETROS, prerequisitosPendentes, progressoMateria, revisaoVencida, situacaoProva } from '@jogue/progressao';
import { NOMES_ESTAGIO } from '@jogue/sdk-jogo';
import { Link } from 'react-router';
import { linkParaJogar } from '../componentes/links';
import { Barra, SeloEstagio, SeloMateria } from '../componentes/ui';
import { HABILIDADES, MATERIAS, habilidadePorId } from '../conteudo/habilidades';
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
            <div className="grade">
              {habilidades.map((h) => {
                const estado = estadoDe(perfil, h);
                const pendentes = prerequisitosPendentes(perfil, h, HABILIDADES);
                const bloqueada = pendentes.length > 0;
                const link = linkParaJogar(h.id);
                const prova = situacaoProva(perfil, h, agora);
                const linkProva = prova?.disponivel ? linkParaJogar(h.id, 'nivelamento') : null;
                return (
                  <article key={h.id} className={bloqueada ? 'cartao habilidade bloqueada' : 'cartao habilidade'}>
                    <div className="linha-titulo">
                      <h3>{h.nome}</h3>
                      <SeloEstagio estagio={estado.estagio} />
                    </div>
                    <p className="suave">{h.estagios[estado.estagio]}</p>
                    {bloqueada ? (
                      <p className="aviso">
                        Falta:{' '}
                        {pendentes
                          .map((p) => `${habilidadePorId(p.habilidadeId)?.nome ?? p.habilidadeId} — ${NOMES_ESTAGIO[p.estagio]}`)
                          .join(', ')}
                      </p>
                    ) : (
                      <>
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
                        <div className="acoes">
                          {link && (
                            <Link className="botao pequeno" to={link}>
                              Jogar
                            </Link>
                          )}
                          {prova && linkProva && (
                            <Link className="botao pequeno secundario" to={linkProva}>
                              Já sei: prova do {NOMES_ESTAGIO[prova.estagio]}
                            </Link>
                          )}
                        </div>
                        {prova?.liberaEm && (
                          <p className="suave">Nova prova em {formatoDia.format(new Date(prova.liberaEm))}</p>
                        )}
                      </>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
