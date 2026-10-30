import { ESTAGIOS, NOMES_ESTAGIO, PADRAO } from '@jogue/sdk-jogo';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { DemoCobrinha } from '../componentes/DemoCobrinha';
import { InstalarApp } from '../componentes/InstalarApp';
import { MATERIAS, materiaPorId } from '@jogue/conteudo';
import { JOGOS } from '../conteudo/jogos';

/** Troca a palavra destacada de tempos em tempos. Leitores de tela ouvem a frase inteira, sem troca. */
function PalavraGirando({ palavras }: { palavras: string[] }) {
  const [indice, setIndice] = useState(0);
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => setIndice((i) => (i + 1) % palavras.length), 2200);
    return () => clearInterval(id);
  }, [palavras.length]);
  return (
    <>
      <span className="so-leitor">{`${palavras.slice(0, -1).join(', ')} e ${palavras.at(-1)}`}</span>
      <span key={indice} className="palavra-girando" aria-hidden="true">
        {palavras[indice]}
      </span>
    </>
  );
}

/** O que é o Jogue e Aprenda: página de entrada para quem chega e página "Sobre" para quem já joga. */
export function Apresentacao() {
  const cobrinha = JOGOS[0]!;
  return (
    <div className="apresentacao">
      <section className="heroi">
        <div className="heroi-texto">
          <h1 className="pergunta">
            O que é o <span className="marca-texto">Jogue e Aprenda</span>?
          </h1>
          <p className="resposta">
            É um lugar para <PalavraGirando palavras={['se divertir', 'aprender', 'se desafiar', 'evoluir']} />.
          </p>
          <p className="heroi-sub">
            Jogos de verdade, em que cada jogada pede o que você sabe. Para jovens e adultos.
          </p>
          <div className="acoes">
            <Link className="botao grande" to="/jogos">
              Escolher um jogo
            </Link>
            <Link className="botao grande secundario" to="/progresso">
              Ver meu progresso
            </Link>
          </div>
          <InstalarApp />
        </div>
        <DemoCobrinha />
      </section>

      <p className="equacao">
        <span className="termo termo-diversao">Diversão</span>
        <span className="operador">+</span>
        <span className="termo termo-aprendizado">Aprendizado</span>
        <span className="operador">=</span>
        <span className="termo termo-resultado">Jogue e Aprenda</span>
      </p>

      <section className="secao" aria-labelledby="para-quem">
        <h2 id="para-quem">Para quem é?</h2>
        <div className="publicos">
          <article className="publico publico-jovens">
            <h3>Jovens</h3>
            <p>A matéria da escola sem cara de lição.</p>
          </article>
          <article className="publico publico-adultos">
            <h3>Adultos</h3>
            <p>Relembre o que esqueceu, no seu ritmo.</p>
          </article>
          <article className="publico publico-todos">
            <h3>Todo mundo</h3>
            <p>Partidas curtas, no celular ou no PC.</p>
          </article>
        </div>
      </section>

      <section className="secao" aria-labelledby="como-funciona">
        <h2 id="como-funciona">Como funciona</h2>
        <ol className="passos">
          <li>
            <h3>Jogue</h3>
            <p>Escolha um jogo, a disciplina e o nível.</p>
          </li>
          <li>
            <h3>Acerte</h3>
            <p>As perguntas vêm da disciplina que você escolheu.</p>
          </li>
          <li>
            <h3>Evolua</h3>
            <p>Zerou as {PADRAO.questoesPorPartida} perguntas? Você sobe de nível.</p>
          </li>
        </ol>
        <div className="escada" aria-label="Os quatro estágios">
          {ESTAGIOS.map((estagio, i) => (
            <div key={estagio} className={`degrau degrau-${i + 1}`}>
              <span>{NOMES_ESTAGIO[estagio]}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="secao" aria-labelledby="diferente">
        <h2 id="diferente">Por que funciona</h2>
        <div className="vantagens">
          <article>
            <h3>O erro ensina</h3>
            <p>Errou? O jogo mostra o que você confundiu.</p>
          </article>
          <article>
            <h3>Desafio na medida</h3>
            <p>A dificuldade acompanha seu desempenho.</p>
          </article>
          <article>
            <h3>Revisão na hora certa</h3>
            <p>O que você domina volta para você não esquecer.</p>
          </article>
        </div>
      </section>

      <section className="secao" aria-labelledby="jogos">
        <h2 id="jogos">Jogos</h2>
        <div className="vitrine">
          <article className="jogo-destaque">
            <div className="jogo-cabecalho">
              <img className="jogo-icone" src={cobrinha.icone} alt="" width={56} height={56} />
              <div>
                <h3>{cobrinha.nome}</h3>
                <p className="sobretitulo">{cobrinha.materias.map((m) => materiaPorId(m)?.nome).join(' · ')}</p>
              </div>
            </div>
            <p>Coma a letra certa, A ou B, antes que a energia acabe.</p>
            <Link className="botao" to="/jogos">
              Jogar
            </Link>
          </article>
          {MATERIAS.filter((m) => !m.disponivel).map((m) => (
            <article key={m.id} className="jogo-em-breve">
              <h3>{m.nome}</h3>
              <p className="sobretitulo">Em breve</p>
            </article>
          ))}
        </div>
      </section>

      <section className="chamada">
        <h2>Pronto para jogar?</h2>
        <Link className="botao grande" to="/jogos">
          Começar agora
        </Link>
      </section>
    </div>
  );
}
