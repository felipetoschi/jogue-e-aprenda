import './estilo.css';
import { ESTAGIOS, NOMES_ESTAGIO, conectarAPlataforma, type ConexaoPlataforma, type Estagio } from '@jogue/sdk-jogo';
import { explicarErro, formatarNumero, HABILIDADES_SUPORTADAS } from './contas';
import { Desenhista } from './desenho';
import { ouvirDeslize, ouvirJoystick, ouvirTeclado } from './entrada';
import { avancar, criarJogo, pontuacaoDe, virar, type EstadoJogo, type Fim, type MotivoFim } from './jogo';
import { ALERTA_ENERGIA, META_CONTAS, NOMES_HABILIDADE } from './regras';
import { Retorno } from './retorno';

const el = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;

const TITULOS_FIM: Record<MotivoFim, string> = {
  vitoria: 'Você venceu!',
  erro: 'Resposta errada',
  energia: 'A energia acabou',
  borda: 'Bateu na borda',
  corpo: 'Bateu no próprio corpo',
};

/** Tempo da animação de fim antes de devolver o resultado à plataforma. */
const ESPERA_FIM_MS = 3200;

/** Fora da plataforma, a configuração vem da URL: ?habilidade=divisao&estagio=avancado&ajuste=0.5 */
function configDaUrl() {
  const busca = new URLSearchParams(window.location.search);
  const habilidade = busca.get('habilidade') ?? 'multiplicacao';
  const estagio = busca.get('estagio') ?? 'intermediario';
  return {
    habilidadeId: HABILIDADES_SUPORTADAS.includes(habilidade) ? habilidade : 'multiplicacao',
    estagio: (ESTAGIOS as readonly string[]).includes(estagio) ? (estagio as Estagio) : 'intermediario',
    ajuste: Math.min(1, Math.max(0, Number(busca.get('ajuste') ?? 0.5) || 0)),
    modo: 'normal' as const,
  };
}

type Fase = 'preparo' | 'contagem' | 'jogando' | 'pausado' | 'fim';

class Partida {
  private estado: EstadoJogo;
  private fase: Fase = 'preparo';
  private ultimoQuadro = 0;
  private readonly desenhista = new Desenhista(el<HTMLCanvasElement>('tabuleiro'));
  private readonly retorno = new Retorno();

  constructor(private readonly conexao: ConexaoPlataforma) {
    this.estado = this.novoEstado();
    const { habilidadeId, estagio, modo } = conexao.config;
    const nome = NOMES_HABILIDADE[habilidadeId] ?? habilidadeId;
    const sufixo = modo === 'nivelamento' ? ' · Prova' : modo === 'revisao' ? ' · Revisão' : '';
    el('rotulo').textContent = `${nome} · ${NOMES_ESTAGIO[estagio]}${sufixo}`;
    el('preparo-detalhe').textContent =
      modo === 'nivelamento'
        ? `Prova para pular para ${nome}, estágio ${NOMES_ESTAGIO[estagio]}: acerte pelo menos 85% em 10 contas ou mais.`
        : `${nome}, estágio ${NOMES_ESTAGIO[estagio]}. Resolva ${META_CONTAS} contas para vencer.`;
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
    ouvirJoystick(el('joystick'), el('joystick-pino'), { aoVirar });
    ouvirDeslize(el('tabuleiro'), { aoVirar });
    document.addEventListener('visibilitychange', () => document.hidden && this.fase === 'jogando' && this.alternarPausa());
    window.addEventListener('resize', () => this.desenhista.redimensionar());

    this.atualizarHud();
    requestAnimationFrame((t) => this.quadro(t));
  }

  private novoEstado() {
    const { habilidadeId, estagio, ajuste } = this.conexao.config;
    return criarJogo({ habilidadeId, estagio, ajuste }, Math.random);
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
    el('conta').textContent = estado.fim?.motivo === 'vitoria' ? '🎉' : `${estado.conta.texto} = ?`;
    el('pontos').textContent = `${estado.acertos}/${META_CONTAS}`;
    el('dica').hidden = !(this.fase === 'jogando' && estado.parada);
    const barra = el('energia');
    barra.style.transform = `scaleX(${estado.energia})`;
    barra.classList.toggle('alerta', estado.energia * estado.segundosPorConta < ALERTA_ENERGIA);
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

    const resolvida = `${fim.conta.texto} = ${formatarNumero(fim.conta.resposta)}`;
    const erro =
      fim.motivo === 'erro' && fim.tipoErro && fim.valorEscolhido !== null
        ? explicarErro(fim.conta, fim.valorEscolhido, fim.tipoErro)
        : null;
    // Errou ou ficou sem energia: mostra a conta resolvida, que é o momento de aprender.
    const detalhe = erro ? erro.explicacao : fim.motivo === 'energia' ? `A resposta era: ${resolvida}.` : undefined;

    el('fim-titulo').textContent = TITULOS_FIM[fim.motivo];
    el('fim-conta').textContent = fim.motivo === 'erro' || fim.motivo === 'energia' ? resolvida : '';
    el('fim-explicacao').textContent = erro?.explicacao ?? '';
    el('fim-pontos').textContent = `${estado.acertos} de ${META_CONTAS} contas · maior tamanho ${estado.maiorTamanho}`;
    el('botao-de-novo').hidden = !this.conexao.avulso;
    el('tela-fim').hidden = false;

    const tempos = estado.temposDeAcerto;
    const resultado = {
      pontuacao: pontuacaoDe(estado),
      desempenho: [{ habilidadeId: estado.config.habilidadeId, acertos: estado.acertos, tentativas: estado.tentativas }],
      ajudas: 0,
      status: 'concluida' as const,
      mensagem: { titulo: TITULOS_FIM[fim.motivo], detalhe },
      erros:
        erro && fim.tipoErro
          ? [{ habilidadeId: estado.config.habilidadeId, tipo: fim.tipoErro, rotulo: erro.rotulo, explicacao: erro.explicacao }]
          : [],
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

conectarAPlataforma({ configAvulsa: configDaUrl() }).then((conexao) => new Partida(conexao));
