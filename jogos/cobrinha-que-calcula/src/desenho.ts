import type { Direcao, EstadoJogo, Posicao } from './jogo';
import { ALERTA_ENERGIA, LADO_OPCAO, TAMANHO_TABULEIRO } from './regras';

const cor = (nome: string) => getComputedStyle(document.documentElement).getPropertyValue(nome).trim();

interface Efeito {
  pos: Posicao;
  inicio: number;
  cor: string;
}

/** Duração, em segundos, do anel que marca um acerto ou erro. */
const DURACAO_EFEITO = 0.45;

/** Para onde a cabeça aponta, para os olhos ficarem na frente. */
const FRENTE: Record<Direcao, Posicao> = {
  cima: { x: 0, y: -1 },
  baixo: { x: 0, y: 1 },
  esquerda: { x: -1, y: 0 },
  direita: { x: 1, y: 0 },
};

export class Desenhista {
  private readonly ctx: CanvasRenderingContext2D;
  private efeitos: Efeito[] = [];
  private readonly reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  private casa = 0;
  private cores = { acerto: '', erro: '', linha: '', cobra: '', cabeca: '', opcao: '', borda: '', texto: '', olho: '' };

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;
    this.cores = {
      acerto: cor('--cobra'),
      erro: cor('--perigo'),
      linha: cor('--linha'),
      cobra: cor('--cobra'),
      cabeca: cor('--cobra-cabeca'),
      opcao: cor('--opcao'),
      borda: cor('--opcao-borda'),
      texto: cor('--texto'),
      olho: cor('--fundo'),
    };
    this.redimensionar();
  }

  /** Ajusta a resolução do canvas ao tamanho na tela e à densidade de pixels. */
  redimensionar(): void {
    const lado = this.canvas.clientWidth;
    const densidade = window.devicePixelRatio || 1;
    this.canvas.width = Math.round(lado * densidade);
    this.canvas.height = Math.round(lado * densidade);
    this.ctx.setTransform(densidade, 0, 0, densidade, 0, 0);
    this.casa = lado / TAMANHO_TABULEIRO;
  }

  /** Marca a casa onde a cobra comeu: verde no acerto, vermelho no erro. */
  marcar(pos: Posicao, tipo: 'acerto' | 'erro', tempo: number): void {
    if (this.reduzirMovimento) return;
    this.efeitos.push({ pos, inicio: tempo, cor: tipo === 'acerto' ? this.cores.acerto : this.cores.erro });
  }

  desenhar(estado: EstadoJogo, tempo: number): void {
    const { ctx, casa, cores } = this;
    const lado = casa * TAMANHO_TABULEIRO;
    ctx.clearRect(0, 0, lado, lado);

    ctx.strokeStyle = cores.linha;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 1; i < TAMANHO_TABULEIRO; i++) {
      ctx.moveTo(i * casa, 0);
      ctx.lineTo(i * casa, lado);
      ctx.moveTo(0, i * casa);
      ctx.lineTo(lado, i * casa);
    }
    ctx.stroke();

    const tamanhoFonte = Math.max(11, casa * 0.75);
    ctx.font = `700 ${tamanhoFonte}px Lexend, system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const opcao of estado.opcoes) {
      const x = opcao.pos.x * casa + 2;
      const y = opcao.pos.y * casa + 2;
      const tamanho = casa * LADO_OPCAO - 4;
      ctx.fillStyle = cores.opcao;
      ctx.strokeStyle = cores.borda;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(x, y, tamanho, tamanho, casa * 0.35);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = cores.texto;
      ctx.fillText(opcao.texto, x + tamanho / 2, y + tamanho / 2, tamanho - 4);
    }

    // A cobra enfraquece com a energia: perde opacidade e pisca nos últimos segundos.
    const segundosRestantes = estado.energia * estado.segundosPorQuestao;
    const piscando = segundosRestantes < ALERTA_ENERGIA && Math.floor(tempo * 6) % 2 === 0;
    ctx.globalAlpha = piscando ? 0.2 : 0.3 + 0.7 * estado.energia;
    estado.cobra.forEach((parte, i) => {
      const margem = i === 0 ? 1 : 2;
      ctx.fillStyle = i === 0 ? cores.cabeca : cores.cobra;
      ctx.beginPath();
      ctx.roundRect(parte.x * casa + margem, parte.y * casa + margem, casa - margem * 2, casa - margem * 2, casa * 0.3);
      ctx.fill();
    });
    this.desenharOlhos(estado.cobra[0]!, estado.direcao);
    ctx.globalAlpha = 1;

    this.efeitos = this.efeitos.filter((e) => tempo - e.inicio < DURACAO_EFEITO);
    for (const efeito of this.efeitos) {
      const progresso = (tempo - efeito.inicio) / DURACAO_EFEITO;
      ctx.globalAlpha = 1 - progresso;
      ctx.strokeStyle = efeito.cor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc((efeito.pos.x + 0.5) * casa, (efeito.pos.y + 0.5) * casa, casa * (0.6 + progresso * 2.2), 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  /** Dois olhinhos na frente da cabeça mostram para onde a cobra vai. */
  private desenharOlhos(cabeca: Posicao, direcao: Direcao): void {
    const { ctx, casa } = this;
    const frente = FRENTE[direcao];
    const centroX = (cabeca.x + 0.5) * casa + frente.x * casa * 0.18;
    const centroY = (cabeca.y + 0.5) * casa + frente.y * casa * 0.18;
    ctx.fillStyle = this.cores.olho;
    for (const lado of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(centroX - frente.y * casa * 0.2 * lado, centroY + frente.x * casa * 0.2 * lado, Math.max(1.5, casa * 0.09), 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
