import { NOMES_ESTAGIO } from '@jogue/sdk-jogo';
import { Link, Navigate, useLocation } from 'react-router';
import { linkParaJogar } from '../componentes/links';
import { Barra, Estrelas, SeloMateria } from '../componentes/ui';
import { habilidadePorId, materiaPorId } from '../conteudo/habilidades';
import type { EstadoResultado } from './Jogar';

export function Resultado() {
  const estado = useLocation().state as EstadoResultado | null;
  if (!estado) return <Navigate to="/" replace />;
  const { resumo, resultado, config } = estado;
  const subiuDeNivel = resumo.nivelDepois.nivel > resumo.nivelAntes.nivel;
  const acertos = resultado.desempenho.reduce((t, d) => t + d.acertos, 0);
  const tentativas = resultado.desempenho.reduce((t, d) => t + d.tentativas, 0);

  return (
    <div className="pilha resultado">
      <section className="cartao centro">
        <Estrelas quantidade={resumo.estrelas} />
        <h1>{resultado.pontuacao} pontos</h1>
        <p className="suave">
          {acertos} acerto(s) em {tentativas} tentativa(s)
        </p>
        <p className="xp-ganho">+{resumo.xpGanho} XP</p>
        {subiuDeNivel && (
          <p className="conquista">
            Subiu para o nível {resumo.nivelDepois.nivel} · {resumo.nivelDepois.titulo}
          </p>
        )}
        {resumo.revisaoAprovada !== null && (
          <p className={resumo.revisaoAprovada ? 'conquista' : 'aviso'}>
            {resumo.revisaoAprovada ? 'Revisão aprovada' : 'Revisão não aprovada: ela volta em 3 dias'}
          </p>
        )}
      </section>

      {resumo.habilidades.map((m) => {
        const h = habilidadePorId(m.habilidadeId);
        return (
          <section key={m.habilidadeId} className="cartao">
            <h2>{h?.nome}</h2>
            {m.promovido ? (
              <p className="conquista">
                Subiu de estágio: {NOMES_ESTAGIO[m.estagioAntes]} → {NOMES_ESTAGIO[m.estagioDepois]}
              </p>
            ) : (
              <p className="suave">Estágio {NOMES_ESTAGIO[m.estagioDepois]}</p>
            )}
            <Barra valor={m.maestriaDepois} maximo={100} rotulo="Maestria" />
            <p className="suave">
              Maestria {m.maestriaAntes} → {m.maestriaDepois}
            </p>
          </section>
        );
      })}

      {(resumo.desbloqueadas.length > 0 || resumo.selosNovos.length > 0) && (
        <section className="cartao">
          <h2>Novidades</h2>
          <ul className="lista">
            {resumo.desbloqueadas.map((id) => (
              <li key={id}>Desbloqueou {habilidadePorId(id)?.nome}</li>
            ))}
            {resumo.selosNovos.map((s) => (
              <li key={s.materiaId}>
                {materiaPorId(s.materiaId)?.nome}: <SeloMateria selo={s.selo} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="acoes">
        <Link className="botao" to={linkParaJogar(config.habilidadeId) ?? '/jogos'}>
          Jogar de novo
        </Link>
        <Link className="botao secundario" to="/mapa">
          Ver mapa
        </Link>
      </div>
    </div>
  );
}
