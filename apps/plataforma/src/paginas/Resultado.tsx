import { PARAMETROS, type ResumoPartida } from '@jogue/progressao';
import { NOMES_ESTAGIO } from '@jogue/sdk-jogo';
import { Link, Navigate, useLocation } from 'react-router';
import { linkParaJogar } from '../componentes/links';
import { Barra, Estrelas, SeloMateria } from '../componentes/ui';
import { habilidadePorId, materiaPorId } from '../conteudo/habilidades';
import type { EstadoResultado } from './Jogar';

const AVISOS_NAO_CONTOU: Record<NonNullable<ResumoPartida['naoContou']>, string> = {
  abandono: 'Partida abandonada: não conta para a progressão.',
  treino: 'Partida de treino: não conta para a progressão.',
  'sem-tentativas': 'Nenhuma conta respondida: a partida não conta para a progressão.',
};

export function Resultado() {
  const estado = useLocation().state as EstadoResultado | null;
  if (!estado) return <Navigate to="/" replace />;
  const { resumo, resultado, config } = estado;
  const subiuDeNivel = resumo.nivelDepois.nivel > resumo.nivelAntes.nivel;
  // Escolheu jogar abaixo do estágio atual: "Jogar de novo" mantém a escolha. Depois de uma promoção, vai para o novo estágio.
  const mudanca = resumo.habilidades[0];
  const jogouEstagioAnterior = config.modo === 'normal' && !!mudanca && !mudanca.promovido && config.estagio !== mudanca.estagioDepois;
  const acertos = resultado.desempenho.reduce((t, d) => t + d.acertos, 0);
  const tentativas = resultado.desempenho.reduce((t, d) => t + d.tentativas, 0);

  return (
    <div className="pilha resultado">
      <section className="cartao centro">
        {resultado.mensagem && (
          <div className="mensagem-fim">
            <h2>{resultado.mensagem.titulo}</h2>
            {resultado.mensagem.detalhe && <p>{resultado.mensagem.detalhe}</p>}
          </div>
        )}
        <Estrelas quantidade={resumo.estrelas} />
        <h1>{resultado.pontuacao} pontos</h1>
        <p className="suave">
          {acertos} acerto(s) em {tentativas} tentativa(s)
        </p>
        {resumo.contou ? (
          <p className="xp-ganho">+{resumo.xpGanho} XP</p>
        ) : (
          <p className="aviso">{AVISOS_NAO_CONTOU[resumo.naoContou ?? 'abandono']}</p>
        )}
        {resumo.nivelamento && (
          <p className={resumo.nivelamento.aprovado ? 'conquista' : 'aviso'}>
            {resumo.nivelamento.aprovado
              ? `Prova aprovada: você pulou para o ${NOMES_ESTAGIO[resumo.nivelamento.estagio]}`
              : `Prova não aprovada. Para pular, acerte 85% em pelo menos ${PARAMETROS.nivelamento.tentativasMinimas} contas. Nova prova em ${PARAMETROS.nivelamento.diasEntreProvas} dias.`}
          </p>
        )}
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
            {jogouEstagioAnterior ? (
              <p className="suave">
                Partida no {NOMES_ESTAGIO[config.estagio]}: vale XP, sua maestria no {NOMES_ESTAGIO[m.estagioDepois]} não muda.
              </p>
            ) : m.promovido ? (
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
        <Link
          className="botao"
          to={
            linkParaJogar(config.habilidadeId, 'normal', {
              estagio: jogouEstagioAnterior ? config.estagio : undefined,
              iniciar: true,
            }) ?? '/jogos'
          }
        >
          Jogar de novo
        </Link>
        <Link className="botao secundario" to={linkParaJogar(config.habilidadeId) ?? '/jogos'}>
          Trocar nível
        </Link>

      </div>
    </div>
  );
}
