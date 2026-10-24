import { formatarNumero } from './contas';
import type { EstadoJogo } from './jogo';
import { ALERTA_ENERGIA, LADO_OPCAO, TAMANHO_TABULEIRO } from './regras';

const cor = (nome: string) => getComputedStyle(document.documentElement).getPropertyValue(nome).trim();

export class Desenhista {
  private readonly ctx: CanvasRenderingContext2D;
  private casa = 0;
  private cores = { linha: '', cobra: '', cabeca: '', opcao: '', borda: '', texto: '' };

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;
    this.cores = {
      linha: cor('--linha'),
      cobra: cor('--cobra'),
      cabeca: cor('--cobra-cabeca'),
      opcao: cor('--opcao'),
      borda: cor('--opcao-borda'),
      texto: cor('--texto'),
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
    ctx.font = `800 ${tamanhoFonte}px system-ui, sans-serif`;
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
      ctx.fillText(formatarNumero(opcao.valor), x + tamanho / 2, y + tamanho / 2, tamanho - 4);
    }

    // A cobra enfraquece com a energia: perde opacidade e pisca nos últimos segundos.
    const segundosRestantes = estado.energia * estado.segundosPorConta;
    const piscando = segundosRestantes < ALERTA_ENERGIA && Math.floor(tempo * 6) % 2 === 0;
    ctx.globalAlpha = piscando ? 0.2 : 0.3 + 0.7 * estado.energia;
    estado.cobra.forEach((parte, i) => {
      const margem = i === 0 ? 1 : 2;
      ctx.fillStyle = i === 0 ? cores.cabeca : cores.cobra;
      ctx.beginPath();
      ctx.roundRect(parte.x * casa + margem, parte.y * casa + margem, casa - margem * 2, casa - margem * 2, casa * 0.3);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }
}
