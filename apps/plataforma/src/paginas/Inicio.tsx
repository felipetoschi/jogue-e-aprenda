import { estadoDe, infoNivel, revisaoVencida, sugerirProximaPartida } from '@jogue/progressao';
import { NOMES_ESTAGIO } from '@jogue/sdk-jogo';
import { Link } from 'react-router';
import { Barra, SeloMateria } from '../componentes/ui';
import { linkParaJogar } from '../componentes/links';
import { HABILIDADES, MATERIAS, habilidadePorId } from '../conteudo/habilidades';
import { useProgresso } from '../estado/progresso';

export function Inicio() {
  const { perfil, historico } = useProgresso();
  const agora = new Date();
  const nivel = infoNivel(perfil.xp);
  const sugestao = sugerirProximaPartida(perfil, HABILIDADES, agora);
  const habilidadeSugerida = sugestao && habilidadePorId(sugestao.habilidadeId);
  const revisoes = HABILIDADES.filter((h) => revisaoVencida(estadoDe(perfil, h), agora));

  // Boas-vindas até a primeira partida que conte para a progressão.
  if (!historico.some((r) => r.resumo?.contou)) return <BoasVindas />;

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

/** Primeira visita: explica a plataforma e deixa quem já sabe começar mais adiante. */
function BoasVindas() {
  return (
    <div className="pilha">
      <section className="cartao boas-vindas">
        <p className="sobretitulo">Bem-vindo</p>
        <h1>Aprenda jogando, do básico ao avançado</h1>
        <p>
          Cada partida treina uma habilidade. Acertando, você ganha XP, sobe de nível e avança de estágio: Básico, Intermediário,
          Avançado e Mestre. Novas habilidades abrem conforme você evolui.
        </p>
      </section>
      <div className="grade">
        <section className="cartao">
          <h2>Começar do início</h2>
          <p className="suave">Adição no Básico, com contas até 10, na Cobrinha que Calcula.</p>
          <Link className="botao" to={linkParaJogar('adicao') ?? '/jogos'}>
            Jogar agora
          </Link>
        </section>
        <section className="cartao">
          <h2>Já sei o básico</h2>
          <p className="suave">
            Faça a prova do Intermediário. Acertando 85% em pelo menos 10 contas, você pula o Básico.
          </p>
          <div className="acoes">
            <Link className="botao secundario" to={linkParaJogar('adicao', 'nivelamento') ?? '/jogos'}>
              Prova de Adição
            </Link>
            <Link className="botao secundario" to={linkParaJogar('multiplicacao', 'nivelamento') ?? '/jogos'}>
              Prova de Multiplicação
            </Link>
          </div>
        </section>
      </div>
      <p className="suave">
        Ou veja todas as habilidades no <Link to="/mapa">mapa</Link>.
      </p>
    </div>
  );
}
