import { NOMES_ESTAGIO, ESTAGIOS } from '@jogue/sdk-jogo';
import { PARAMETROS } from '@jogue/progressao';
import { Link } from 'react-router';
import { DemoCobrinha } from '../componentes/DemoCobrinha';
import { linkParaJogar } from '../componentes/links';
import { JOGOS } from '../conteudo/jogos';

const { promocao, partidasMinimas } = PARAMETROS.maestria;

/** O que é o Jogue e Aprenda: página de entrada para quem chega e página "Sobre" para quem já joga. */
export function Apresentacao() {
  const cobrinha = JOGOS[0]!;
  return (
    <div className="apresentacao">
      <section className="heroi">
        <div className="heroi-texto">
          <p className="sobretitulo">Jogos que ensinam</p>
          <h1>Cada partida é um passo na sua evolução.</h1>
          <p className="heroi-sub">Puzzles e tabuleiros de matemática, português e mais. Do básico ao avançado.</p>
          <div className="acoes">
            <Link className="botao grande" to={linkParaJogar('adicao') ?? '/jogos'}>
              Jogar agora
            </Link>
            <Link className="botao grande secundario" to={linkParaJogar('multiplicacao', 'nivelamento') ?? '/mapa'}>
              Já sei o básico
            </Link>
          </div>
        </div>
        <DemoCobrinha />
      </section>

      <section className="secao" aria-labelledby="como-funciona">
        <h2 id="como-funciona">Como funciona</h2>
        <ol className="passos">
          <li>
            <h3>Jogue</h3>
            <p>Partidas de poucos minutos.</p>
          </li>
          <li>
            <h3>Acerte</h3>
            <p>Cada acerto aumenta sua maestria.</p>
          </li>
          <li>
            <h3>Evolua</h3>
            <p>
              Maestria {promocao} em {partidasMinimas} partidas: próximo estágio.
            </p>
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
            <p className="sobretitulo">Matemática</p>
            <h3>{cobrinha.nome}</h3>
            <p>Coma o resultado certo antes que a energia acabe.</p>
            <Link className="botao" to={`/jogar/${cobrinha.id}`}>
              Jogar
            </Link>
          </article>
          <article className="jogo-em-breve">
            <h3>Português</h3>
            <p className="sobretitulo">Em breve</p>
          </article>
          <article className="jogo-em-breve">
            <h3>Geografia</h3>
            <p className="sobretitulo">Em breve</p>
          </article>
        </div>
      </section>

      <section className="chamada">
        <h2>Pronto para jogar?</h2>
        <Link className="botao grande" to={linkParaJogar('adicao') ?? '/jogos'}>
          Começar agora
        </Link>
      </section>
    </div>
  );
}
