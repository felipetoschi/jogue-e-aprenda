import { Link } from 'react-router';
import { habilidadePorId, materiaPorId } from '../conteudo/habilidades';
import { JOGOS } from '../conteudo/jogos';

export function Catalogo() {
  return (
    <div className="pilha">
      <h1>Jogos</h1>
      <div className="grade">
        {JOGOS.map((jogo) => (
          <article key={jogo.id} className="cartao">
            <p className="sobretitulo">
              {materiaPorId(jogo.materiaId)?.nome} · {jogo.duracaoMinutos[0]} a {jogo.duracaoMinutos[1]} min
            </p>
            <h2>{jogo.nome}</h2>
            <p>{jogo.descricao}</p>
            <p className="suave">Treina: {jogo.habilidades.map((h) => habilidadePorId(h)?.nome ?? h).join(', ')}</p>
            <Link className="botao" to={`/jogar/${jogo.id}`}>
              Jogar
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
