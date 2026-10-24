import { infoNivel } from '@jogue/progressao';
import { NOMES_ESTAGIO } from '@jogue/sdk-jogo';
import { Estrelas } from '../componentes/ui';
import { habilidadePorId } from '../conteudo/habilidades';
import { useProgresso } from '../estado/progresso';

const formatoData = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

export function Perfil() {
  const { perfil, historico, apagarProgresso } = useProgresso();
  const nivel = infoNivel(perfil.xp);
  const concluidas = historico.filter((r) => r.resumo?.contou);

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

      <button
        type="button"
        className="botao perigo"
        onClick={() => window.confirm('Apagar todo o progresso deste aparelho?') && apagarProgresso()}
      >
        Apagar progresso
      </button>
      <p className="suave">Nesta versão o progresso fica salvo só neste navegador.</p>
    </div>
  );
}
