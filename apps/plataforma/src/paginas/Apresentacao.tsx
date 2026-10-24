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
          <p className="sobretitulo">Jogos de raciocínio para jovens e adultos</p>
          <h1>Cada partida é um passo na sua evolução.</h1>
          <p className="heroi-sub">
            Puzzles e jogos de tabuleiro em que, para vencer, é preciso saber. Partidas de poucos minutos que levam você do
            básico ao avançado.
          </p>
          <div className="acoes">
            <Link className="botao grande" to={linkParaJogar('adicao') ?? '/jogos'}>
              Jogar agora
            </Link>
            <Link className="botao grande secundario" to={linkParaJogar('multiplicacao', 'nivelamento') ?? '/mapa'}>
              Já sei o básico
            </Link>
          </div>
          <p className="suave">Grátis, sem cadastro. Comece pela matemática; português e geografia estão a caminho.</p>
        </div>
        <DemoCobrinha />
      </section>

      <section className="secao" aria-labelledby="como-funciona">
        <h2 id="como-funciona">Como funciona</h2>
        <ol className="passos">
          <li>
            <h3>Jogue uma partida curta</h3>
            <p>Cada jogo treina uma habilidade, como multiplicação ou divisão, no seu estágio atual.</p>
          </li>
          <li>
            <h3>Seus acertos viram maestria</h3>
            <p>A maestria vai de 0 a 100 e mede o que você sabe. Ela só sobe com acertos, nunca com tempo de jogo.</p>
          </li>
          <li>
            <h3>Suba de estágio</h3>
            <p>
              Com maestria {promocao} em pelo menos {partidasMinimas} partidas, você passa para o próximo estágio e abre novas
              habilidades.
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
        <p className="suave centro-texto">
          Já sabe? Faça a prova do próximo estágio: com 85% de acerto, você pula o atual.
        </p>
      </section>

      <section className="secao" aria-labelledby="diferente">
        <h2 id="diferente">Feito para você aprender de verdade</h2>
        <div className="vantagens">
          <article>
            <h3>O erro ensina</h3>
            <p>Errou? O jogo explica o que você confundiu.</p>
            <blockquote>“48 é o resultado vizinho na tabuada. 7 × 8 = 56.”</blockquote>
          </article>
          <article>
            <h3>Desafio na medida</h3>
            <p>A dificuldade se ajusta ao seu desempenho para você acertar entre 70% e 85%: difícil o bastante para crescer, sem frustrar.</p>
          </article>
          <article>
            <h3>Revisão na hora certa</h3>
            <p>O que você domina volta para revisão em 3, 7, 14, 30 e 60 dias, para não ser esquecido.</p>
          </article>
          <article>
            <h3>Progresso honesto</h3>
            <p>O XP mostra seu esforço e sobe seu nível. A maestria mostra o que você sabe. Jogar muito não substitui saber.</p>
          </article>
        </div>
      </section>

      <section className="secao" aria-labelledby="jogos">
        <h2 id="jogos">Jogos</h2>
        <div className="vitrine">
          <article className="jogo-destaque">
            <p className="sobretitulo">Matemática · disponível</p>
            <h3>{cobrinha.nome}</h3>
            <p>{cobrinha.descricao}</p>
            <p className="suave">Adição, subtração, multiplicação, divisão e expressões, do Básico ao Mestre.</p>
            <Link className="botao" to={`/jogar/${cobrinha.id}`}>
              Jogar
            </Link>
          </article>
          <article className="jogo-em-breve">
            <p className="sobretitulo">Português · em breve</p>
            <h3>Novo jogo de palavras</h3>
          </article>
          <article className="jogo-em-breve">
            <p className="sobretitulo">Geografia · em breve</p>
            <h3>Novo jogo de tabuleiro</h3>
          </article>
        </div>
      </section>

      <section className="chamada">
        <h2>Pronto para a primeira partida?</h2>
        <Link className="botao grande" to={linkParaJogar('adicao') ?? '/jogos'}>
          Começar agora
        </Link>
      </section>

      <footer className="rodape">
        Jogue e Aprenda · versão de testes. Seu progresso fica salvo neste navegador.
      </footer>
    </div>
  );
}
