import './estilo.css';
import { ESTAGIOS, NOMES_ESTAGIO, conectarAPlataforma, type ConexaoPlataforma, type Estagio } from '@jogue/sdk-jogo';
import { formatarNumero, HABILIDADES_SUPORTADAS } from './contas';
import { Desenhista } from './desenho';
import { ouvirJoystick, ouvirTeclado } from './entrada';
import { avancar, criarJogo, pontuacaoDe, virar, type EstadoJogo, type Fim, type MotivoFim } from './jogo';
import { ALERTA_ENERGIA, META_CONTAS, NOMES_HABILIDADE } from './regras';

const el = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;

const TITULOS_FIM: Record<MotivoFim, string> = {
  vitoria: 'Você venceu!',
  erro: 'Resposta errada',
  energia: 'A energia acabou',
  borda: 'Bateu na borda',
  corpo: 'Bateu no próprio corpo',
};

/** Tempo da animação de fim antes de devolver o resultado à plataforma. */
const ESPERA_FIM_MS = 2200;

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

  constructor(private readonly conexao: ConexaoPlataforma) {
    this.estado = this.novoEstado();
    const { habilidadeId, estagio } = conexao.config;
    el('rotulo').textContent = `${NOMES_HABILIDADE[habilidadeId] ?? habilidadeId} · ${NOMES_ESTAGIO[estagio]}`;
    el('preparo-detalhe').textContent = `${NOMES_HABILIDADE[habilidadeId] ?? habilidadeId}, estágio ${NOMES_ESTAGIO[estagio]}. Resolva ${META_CONTAS} contas para vencer.`;

    el('botao-comecar').addEventListener('click', () => this.contagem());
    el('botao-continuar').addEventListener('click', () => this.alternarPausa());
    el('botao-pausa').addEventListener('click', () => this.alternarPausa());
    el('botao-sair').addEventListener('click', () => this.conexao.sair());
    el('botao-de-novo').addEventListener('click', () => this.reiniciar());

    const aoVirar = (d: Parameters<typeof virar>[1]) => this.fase === 'jogando' && virar(this.estado, d);
    ouvirTeclado({ aoVirar, aoPausar: () => this.alternarPausa() });
    ouvirJoystick(el('joystick'), el('joystick-pino'), { aoVirar });
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
        if (evento.tipo === 'fim') this.terminar(evento.fim);
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
    const barra = el('energia');
    barra.style.transform = `scaleX(${estado.energia})`;
    barra.classList.toggle('alerta', estado.energia * estado.segundosPorConta < ALERTA_ENERGIA);
  }

  private terminar(fim: Fim) {
    this.fase = 'fim';
    const { estado } = this;
    el('fim-titulo').textContent = TITULOS_FIM[fim.motivo];
    // Errou ou ficou sem energia: mostra a conta resolvida, que é o momento de aprender.
    el('fim-conta').textContent =
      fim.motivo === 'erro' || fim.motivo === 'energia' ? `${fim.conta.texto} = ${formatarNumero(fim.conta.resposta)}` : '';
    el('fim-pontos').textContent = `${estado.acertos} de ${META_CONTAS} contas · maior tamanho ${estado.maiorTamanho}`;
    el('botao-de-novo').hidden = !this.conexao.avulso;
    el('tela-fim').hidden = false;

    const tempos = estado.temposDeAcerto;
    const resultado = {
      pontuacao: pontuacaoDe(estado),
      desempenho: [{ habilidadeId: estado.config.habilidadeId, acertos: estado.acertos, tentativas: estado.tentativas }],
      ajudas: 0,
      status: 'concluida' as const,
      extras: {
        motivoFim: fim.motivo,
        tipoErro: fim.tipoErro,
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
