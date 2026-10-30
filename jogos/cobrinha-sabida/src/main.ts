import './estilo.css';
import { ESTAGIOS, NOMES_ESTAGIO, PADRAO, conectarAPlataforma, type ConexaoPlataforma, type Estagio, type Questao } from '@jogue/sdk-jogo';
import { Desenhista, corDaLetra } from './desenho';
import { ouvirDeslize, ouvirSetas, ouvirTeclado } from './entrada';
import { avancar, criarJogo, pontuacaoDe, virar, type EstadoJogo, type Fim, type MotivoFim } from './jogo';
import { ALERTA_ENERGIA } from './regras';
import { Retorno } from './retorno';

const el = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;

const TITULOS_FIM: Record<MotivoFim, string> = {
  vitoria: 'Zerou!',
  erro: 'Resposta errada',
  energia: 'A energia acabou',
  borda: 'Bateu na borda',
  corpo: 'Bateu no próprio corpo',
};

/** Até quantas letras a pergunta usa a letra grande. */
const LIMITE_CONTA_CURTA = 14;

/** Tempo da animação de fim antes de devolver o resultado à plataforma. */
const ESPERA_FIM_MS = 3200;

/**
 * Fora da plataforma (desenvolvimento), a configuração vem da URL — ?habilidade=divisao&estagio=avancado&ajuste=0.5 —
 * e as perguntas são geradas do banco de conteúdo, carregado só neste caso.
 */
async function configDaUrl() {
  const [{ gerarQuestoes, habilidadePorId }, { default: manifesto }] = await Promise.all([
    import('@jogue/conteudo'),
    import('../manifesto.json'),
  ]);
  const busca = new URLSearchParams(window.location.search);
  const habilidade = habilidadePorId(busca.get('habilidade') ?? '') ?? habilidadePorId('multiplicacao')!;
  const pedido = busca.get('estagio');
  const estagio: Estagio = (ESTAGIOS as readonly string[]).includes(pedido ?? '') ? (pedido as Estagio) : 'intermediario';
  const ajuste = Math.min(1, Math.max(0, Number(busca.get('ajuste') ?? 0.5) || 0));
  return {
    habilidadeId: habilidade.id,
    estagio,
    ajuste,
    modo: 'normal' as const,
    rotulo: `${habilidade.nome} · ${NOMES_ESTAGIO[estagio]}`,
    questoes: gerarQuestoes(habilidade.id, estagio, ajuste, PADRAO.questoesPorPartida, { alternativas: manifesto.alternativas }),
  };
}

type Fase = 'preparo' | 'contagem' | 'jogando' | 'pausado' | 'fim';

class Partida {
  private estado: EstadoJogo;
  private fase: Fase = 'preparo';
  private ultimoQuadro = 0;
  private questaoNaTela: Questao | null = null;
  private readonly desenhista = new Desenhista(el<HTMLCanvasElement>('tabuleiro'));
  private readonly retorno = new Retorno();

  constructor(private readonly conexao: ConexaoPlataforma) {
    this.estado = this.novoEstado();
    const { modo, rotulo } = conexao.config;
    const meta = this.estado.meta;
    el('rotulo').textContent = `${rotulo}${modo === 'revisao' ? ' · Revisão' : ''}`;
    el('preparo-detalhe').textContent = `${rotulo}. Acerte ${meta} perguntas para vencer.`;
    this.atualizarBotaoSom();

    el('botao-comecar').addEventListener('click', () => {
      this.retorno.liberar();
      this.contagem();
    });
    el('botao-som').addEventListener('click', () => {
      this.retorno.liberar();
      this.retorno.alternarSom();
      this.atualizarBotaoSom();
    });
    el('botao-continuar').addEventListener('click', () => this.alternarPausa());
    el('botao-pausa').addEventListener('click', () => this.alternarPausa());
    el('botao-sair').addEventListener('click', () => this.conexao.sair());
    el('botao-de-novo').addEventListener('click', () => this.reiniciar());

    const aoVirar = (d: Parameters<typeof virar>[1]) => this.fase === 'jogando' && virar(this.estado, d);
    ouvirTeclado({ aoVirar, aoPausar: () => this.alternarPausa() });
    ouvirSetas(el('setas'), { aoVirar });
    ouvirDeslize(el('tabuleiro'), { aoVirar });
    document.addEventListener('visibilitychange', () => document.hidden && this.fase === 'jogando' && this.alternarPausa());
    // O tabuleiro muda de tamanho com a janela e com a altura da pergunta: refaz a resolução do desenho.
    new ResizeObserver(() => this.desenhista.redimensionar()).observe(el('tabuleiro'));

    this.atualizarHud();
    requestAnimationFrame((t) => this.quadro(t));
  }

  private novoEstado() {
    const { estagio, ajuste, questoes } = this.conexao.config;
    return criarJogo({ estagio, ajuste, questoes }, Math.random);
  }

  private contagem() {
    this.fase = 'contagem';
    el('botao-comecar').hidden = true;
    const contador = el('contagem');
    contador.hidden = false;
    let n = 3;
    contador.textContent = String(n);
    const intervalo = setInterval(() => {
      n--;
      if (n > 0) {
        contador.textContent = String(n);
        return;
      }
      clearInterval(intervalo);
      el('tela-preparo').hidden = true;
      this.fase = 'jogando';
      this.ultimoQuadro = performance.now();
    }, 700);
  }

  private alternarPausa() {
    if (this.fase === 'jogando') {
      this.fase = 'pausado';
      el('tela-pausa').hidden = false;
    } else if (this.fase === 'pausado') {
      this.fase = 'jogando';
      el('tela-pausa').hidden = true;
      this.ultimoQuadro = performance.now();
    }
  }

  private quadro(agora: number) {
    if (this.fase === 'jogando') {
      // Limita o salto de tempo, para uma aba travada não matar a cobra de uma vez.
      const dt = Math.min(0.1, (agora - this.ultimoQuadro) / 1000);
      this.ultimoQuadro = agora;
      for (const evento of avancar(this.estado, dt, Math.random)) {
        if (evento.tipo === 'acerto') {
          this.retorno.acerto(this.estado.acertos);
          this.desenhista.marcar(evento.pos, 'acerto', agora / 1000);
          this.piscarConta('acerto');
        } else {
          this.terminar(evento.fim, agora / 1000);
        }
      }
      this.atualizarHud();
    }
    this.desenhista.desenhar(this.estado, agora / 1000);
    requestAnimationFrame((t) => this.quadro(t));
  }

  private atualizarHud() {
    const { estado } = this;
    const conta = el('conta');
    conta.textContent = estado.fim?.motivo === 'vitoria' ? '🎉' : estado.questao.enunciado;
    // Pergunta de texto ("Capital do Rio Grande do Norte?") usa letra menor, para caber sem empurrar o tabuleiro.
    conta.classList.toggle('longa', conta.textContent.length > LIMITE_CONTA_CURTA);
    this.mostrarAlternativas(estado.fim?.motivo === 'vitoria' ? null : estado.questao);
    el('pontos').textContent = `${estado.acertos}/${estado.meta}`;
    el('dica').hidden = !(this.fase === 'jogando' && estado.parada);
    const barra = el('energia');
    barra.style.transform = `scaleX(${estado.energia})`;
    barra.classList.toggle('alerta', estado.energia * estado.segundosPorQuestao < ALERTA_ENERGIA);
  }

  /** O texto de cada alternativa, ao lado da letra que a cobra precisa pegar. Só refaz ao trocar de pergunta. */
  private mostrarAlternativas(questao: Questao | null) {
    if (questao === this.questaoNaTela) return;
    this.questaoNaTela = questao;
    el('alternativas').replaceChildren(
      ...(questao?.opcoes ?? []).map((opcao) => {
        const item = document.createElement('span');
        item.className = 'alternativa';
        item.style.setProperty('--cor-letra', `var(${corDaLetra(opcao.letra)})`);
        const letra = document.createElement('span');
        letra.className = 'letra';
        letra.textContent = opcao.letra;
        item.append(letra, opcao.texto);
        return item;
      }),
    );
  }

  private piscarConta(tipo: 'acerto' | 'erro') {
    const conta = el('conta');
    conta.classList.remove('acerto', 'erro');
    // Força o navegador a reiniciar a animação.
    void conta.offsetWidth;
    conta.classList.add(tipo);
  }

  private atualizarBotaoSom() {
    const botao = el('botao-som');
    botao.textContent = this.retorno.somLigado ? '♪' : '×';
    botao.setAttribute('aria-label', this.retorno.somLigado ? 'Desligar som' : 'Ligar som');
  }

  private terminar(fim: Fim, tempo: number) {
    this.fase = 'fim';
    const { estado } = this;
    if (fim.motivo === 'vitoria') {
      this.retorno.vitoria();
    } else {
      this.retorno.erro();
      this.desenhista.marcar(estado.cobra[0]!, 'erro', tempo);
      this.piscarConta('erro');
    }

    const { resolucao, habilidadeId } = fim.questao;
    const erro = fim.motivo === 'erro' ? (fim.opcaoEscolhida?.erro ?? null) : null;
    // Errou ou ficou sem energia: mostra a pergunta resolvida, que é o momento de aprender.
    const detalhe = erro ? erro.explicacao : fim.motivo === 'energia' ? `A resposta era: ${resolucao}.` : undefined;

    el('fim-titulo').textContent = TITULOS_FIM[fim.motivo];
    el('fim-conta').textContent = fim.motivo === 'erro' || fim.motivo === 'energia' ? resolucao : '';
    el('fim-explicacao').textContent = erro?.explicacao ?? '';
    el('fim-pontos').textContent = `${estado.acertos} de ${estado.meta} perguntas · maior tamanho ${estado.maiorTamanho}`;
    el('botao-de-novo').hidden = !this.conexao.avulso;
    el('tela-fim').hidden = false;

    const tempos = estado.temposDeAcerto;
    const resultado = {
      pontuacao: pontuacaoDe(estado),
      desempenho: [{ habilidadeId, acertos: estado.acertos, tentativas: estado.tentativas }],
      ajudas: 0,
      status: 'concluida' as const,
      mensagem: { titulo: TITULOS_FIM[fim.motivo], detalhe },
      erros: erro ? [{ habilidadeId, ...erro }] : [],
      extras: {
        motivoFim: fim.motivo,
        maiorTamanho: estado.maiorTamanho,
        tempoMedioSegundos: tempos.length ? Math.round((tempos.reduce((a, b) => a + b, 0) / tempos.length) * 10) / 10 : null,
      },
    };
    setTimeout(() => this.conexao.enviarResultado(resultado), this.conexao.avulso ? 0 : ESPERA_FIM_MS);
  }

  private reiniciar() {
    this.estado = this.novoEstado();
    el('tela-fim').hidden = true;
    el('tela-preparo').hidden = false;
    el('botao-comecar').hidden = false;
    el('contagem').hidden = true;
    this.fase = 'preparo';
    this.atualizarHud();
  }
}

conectarAPlataforma({ configAvulsa: configDaUrl }).then((conexao) => new Partida(conexao));
