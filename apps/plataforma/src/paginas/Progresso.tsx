import { HABILIDADES, habilidadePorId, habilidadesDaMateria, MATERIAS, type Habilidade } from '@jogue/conteudo';
import { estadoDe, prerequisitosPendentes, progressoMateria, revisaoVencida } from '@jogue/progressao';
import { NOMES_ESTAGIO, PADRAO } from '@jogue/sdk-jogo';
import { useState } from 'react';
import { Link } from 'react-router';
import { FaixaProgresso } from '../componentes/FaixaProgresso';
import { linkParaEscolher } from '../componentes/links';
import { Barra, Estrelas, SeloEstagio, SeloMateria } from '../componentes/ui';
import type { RegistroPartida } from '../dados/armazenamento';
import { useProgresso } from '../estado/progresso';

interface ErroComum {
  chave: string;
  habilidadeId: string;
  rotulo: string;
  vezes: number;
  ultimaExplicacao: string;
}

/** Agrupa os erros explicados do histórico por habilidade e tipo, do mais frequente para o menos. */
function contarErros(historico: RegistroPartida[]): ErroComum[] {
  const porChave = new Map<string, ErroComum>();
  // O histórico vem do mais recente para o mais antigo: a primeira explicação vista é a última cometida.
  for (const registro of historico) {
    for (const erro of registro.resultado?.erros ?? []) {
      const chave = `${erro.habilidadeId}:${erro.tipo}`;
      const atual = porChave.get(chave);
      if (atual) atual.vezes++;
      else porChave.set(chave, { chave, habilidadeId: erro.habilidadeId, rotulo: erro.rotulo, vezes: 1, ultimaExplicacao: erro.explicacao });
    }
  }
  return [...porChave.values()].sort((a, b) => b.vezes - a.vezes).slice(0, 5);
}

const formatoData = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

/** Todo o progresso do jogador num lugar só: nível, disciplinas, erros, histórico. */
export function Progresso() {
  const { perfil, historico, apagarProgresso } = useProgresso();
  const concluidas = historico.filter((r) => r.resumo?.contou);
  const [confirmando, setConfirmando] = useState(false);
  const errosComuns = contarErros(historico);
  const zeradas = historico.filter((r) => r.resumo?.zerou).length;

  return (
    <div className="pilha">
      <h1>Progresso</h1>
      <FaixaProgresso />
      <section className="cartao numeros">
        <div>
          <strong>{perfil.xp}</strong>
          <span>XP</span>
        </div>
        <div>
          <strong>{concluidas.length}</strong>
          <span>partidas</span>
        </div>
        <div>
          <strong>{zeradas}</strong>
          <span>zeradas</span>
        </div>
      </section>

      <PorDisciplina />

      {errosComuns.length > 0 && (
        <section className="cartao">
          <h2>Seus erros mais comuns</h2>
          <ul className="lista">
            {errosComuns.map((e) => (
              <li key={e.chave}>
                <span>
                  <strong>{e.rotulo}</strong> em {habilidadePorId(e.habilidadeId)?.nome}
                  <br />
                  <span className="suave">Último: {e.ultimaExplicacao}</span>
                </span>
                <span className="contagem-erros">{e.vezes}×</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="cartao">
        <h2>Histórico</h2>
        {historico.length === 0 ? (
          <p className="suave">Nenhuma partida ainda.</p>
        ) : (
          <div className="tabela-rolagem">
            <table className="tabela">
              <thead>
                <tr>
                  <th>Quando</th>
                  <th>Habilidade</th>
                  <th>Pontos</th>
                  <th>Estrelas</th>
                  <th>XP</th>
                </tr>
              </thead>
              <tbody>
                {historico.slice(0, 30).map((r) => (
                  <tr key={r.id}>
                    <td>{formatoData.format(new Date(r.data))}</td>
                    <td>
                      {habilidadePorId(r.config.habilidadeId)?.nome} · {NOMES_ESTAGIO[r.config.estagio]}
                    </td>
                    <td>{r.resultado ? r.resultado.pontuacao : 'abandonou'}</td>
                    <td>{r.resumo ? <Estrelas quantidade={r.resumo.estrelas} /> : '—'}</td>
                    <td>{r.resumo ? `+${r.resumo.xpGanho}` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {confirmando ? (
        <div className="acoes">
          <span>Apagar todo o progresso deste aparelho?</span>
          <button
            type="button"
            className="botao perigo"
            onClick={() => {
              apagarProgresso();
              setConfirmando(false);
            }}
          >
            Sim, apagar
          </button>
          <button type="button" className="botao secundario" onClick={() => setConfirmando(false)}>
            Cancelar
          </button>
        </div>
      ) : (
        <button type="button" className="botao perigo" onClick={() => setConfirmando(true)}>
          Apagar progresso
        </button>
      )}
      <p className="suave">Nesta versão o progresso fica salvo só neste navegador.</p>
    </div>
  );
}

/**
 * Progresso por disciplina, sem ligação com um jogo:
 * qualquer jogo que treine uma habilidade soma no mesmo lugar.
 */
function PorDisciplina() {
  const { perfil } = useProgresso();
  const agora = new Date();
  const disponiveis = MATERIAS.filter((m) => m.disponivel);
  const emBreve = MATERIAS.filter((m) => !m.disponivel);

  return (
    <>
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
    </>
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
        Maestria {estado.maestria}
        {estado.estagio === 'mestre'
          ? ' · último estágio'
          : ` · zere o ${NOMES_ESTAGIO[estado.estagio]} (${PADRAO.questoesPorPartida} de ${PADRAO.questoesPorPartida}) para subir`}
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
