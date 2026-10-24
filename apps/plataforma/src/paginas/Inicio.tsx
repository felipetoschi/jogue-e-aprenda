import { estadoDe, infoNivel, revisaoVencida, sugerirProximaPartida } from '@jogue/progressao';
import { NOMES_ESTAGIO } from '@jogue/sdk-jogo';
import { Link } from 'react-router';
import { Barra, SeloMateria } from '../componentes/ui';
import { linkParaJogar } from '../componentes/links';
import { HABILIDADES, MATERIAS, habilidadePorId } from '../conteudo/habilidades';
import { useProgresso } from '../estado/progresso';

export function Inicio() {
  const { perfil } = useProgresso();
  const agora = new Date();
  const nivel = infoNivel(perfil.xp);
  const sugestao = sugerirProximaPartida(perfil, HABILIDADES, agora);
  const habilidadeSugerida = sugestao && habilidadePorId(sugestao.habilidadeId);
  const revisoes = HABILIDADES.filter((h) => revisaoVencida(estadoDe(perfil, h), agora));

  return (
    <div className="pilha">
      <section className="cartao destaque-nivel">
        <div>
          <p className="sobretitulo">{nivel.titulo}</p>
          <h1>Nível {nivel.nivel}</h1>
        </div>
        <Barra valor={nivel.xpNoNivel} maximo={nivel.xpParaProximo} rotulo="XP no nível" />
        <p className="suave">
          {nivel.xpNoNivel} / {nivel.xpParaProximo} XP para o nível {nivel.nivel + 1} · {perfil.xp} XP no total
        </p>
      </section>

      {sugestao && habilidadeSugerida && (
        <section className="cartao">
          <p className="sobretitulo">{sugestao.modo === 'revisao' ? 'Hora de revisar' : 'Próxima partida'}</p>
          <h2>
            {habilidadeSugerida.nome} · {NOMES_ESTAGIO[sugestao.estagio]}
          </h2>
          <p className="suave">{habilidadeSugerida.estagios[sugestao.estagio]}</p>
          <Link className="botao" to={linkParaJogar(sugestao.habilidadeId, sugestao.modo) ?? '/jogos'}>
            Jogar agora
          </Link>
        </section>
      )}

      {revisoes.length > 0 && (
        <section className="cartao">
          <h2>Para revisar</h2>
          <ul className="lista">
            {revisoes.map((h) => (
              <li key={h.id}>
                <span>{h.nome}</span>
                <Link to={linkParaJogar(h.id, 'revisao') ?? '/jogos'}>Revisar</Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="cartao">
        <h2>Matérias</h2>
        <ul className="lista">
          {MATERIAS.map((m) => (
            <li key={m.id}>
              <Link to="/mapa">{m.nome}</Link>
              <SeloMateria selo={perfil.selos[m.id]} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
