import { infoNivel } from '@jogue/progressao';
import { NOMES_ESTAGIO } from '@jogue/sdk-jogo';
import { useState } from 'react';
import { Estrelas } from '../componentes/ui';
import { habilidadePorId } from '@jogue/conteudo';
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

export function Perfil() {
  const { perfil, historico, apagarProgresso } = useProgresso();
  const nivel = infoNivel(perfil.xp);
  const concluidas = historico.filter((r) => r.resumo?.contou);
  const [confirmando, setConfirmando] = useState(false);
  const errosComuns = contarErros(historico);

  return (
    <div className="pilha">
      <h1>Perfil</h1>
      <section className="cartao numeros">
        <div>
          <strong>{nivel.nivel}</strong>
          <span>nível · {nivel.titulo}</span>
        </div>
        <div>
          <strong>{perfil.xp}</strong>
          <span>XP</span>
        </div>
        <div>
          <strong>{concluidas.length}</strong>
          <span>partidas</span>
        </div>
      </section>

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
