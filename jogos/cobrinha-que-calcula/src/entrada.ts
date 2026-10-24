import type { Direcao } from './jogo';

const TECLAS: Record<string, Direcao> = {
  ArrowUp: 'cima',
  ArrowDown: 'baixo',
  ArrowLeft: 'esquerda',
  ArrowRight: 'direita',
  KeyW: 'cima',
  KeyS: 'baixo',
  KeyA: 'esquerda',
  KeyD: 'direita',
};

export interface Comandos {
  aoVirar(direcao: Direcao): void;
  aoPausar(): void;
}

export function ouvirTeclado(comandos: Comandos): () => void {
  function aoTeclar(evento: KeyboardEvent) {
    const direcao = TECLAS[evento.code];
    if (direcao) {
      evento.preventDefault();
      comandos.aoVirar(direcao);
    } else if (evento.code === 'Space' || evento.code === 'Escape') {
      evento.preventDefault();
      comandos.aoPausar();
    }
  }
  window.addEventListener('keydown', aoTeclar);
  return () => window.removeEventListener('keydown', aoTeclar);
}

/** Zona morta do joystick, em fração do raio, para evitar viradas sem querer. */
const ZONA_MORTA = 0.25;

/**
 * Joystick virtual: a direção é a do eixo em que o dedo mais se afastou do centro.
 * Só emite quando a direção muda, para não encher a fila de viradas.
 */
export function ouvirJoystick(base: HTMLElement, pino: HTMLElement, comandos: Pick<Comandos, 'aoVirar'>): () => void {
  let ponteiro: number | null = null;
  let ultima: Direcao | null = null;

  function mover(evento: PointerEvent) {
    if (evento.pointerId !== ponteiro) return;
    const caixa = base.getBoundingClientRect();
    const raio = caixa.width / 2;
    const dx = evento.clientX - (caixa.left + raio);
    const dy = evento.clientY - (caixa.top + raio);
    const distancia = Math.hypot(dx, dy);
    const escala = distancia > raio ? raio / distancia : 1;
    pino.style.transform = `translate(${dx * escala}px, ${dy * escala}px)`;

    if (distancia < raio * ZONA_MORTA) return;
    const direcao: Direcao = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'direita' : 'esquerda') : dy > 0 ? 'baixo' : 'cima';
    if (direcao !== ultima) {
      ultima = direcao;
      comandos.aoVirar(direcao);
    }
  }

  function soltar(evento: PointerEvent) {
    if (evento.pointerId !== ponteiro) return;
    ponteiro = null;
    ultima = null;
    pino.style.transform = '';
  }

  function tocar(evento: PointerEvent) {
    evento.preventDefault();
    ponteiro = evento.pointerId;
    base.setPointerCapture(evento.pointerId);
    mover(evento);
  }

  base.addEventListener('pointerdown', tocar);
  base.addEventListener('pointermove', mover);
  base.addEventListener('pointerup', soltar);
  base.addEventListener('pointercancel', soltar);
  return () => {
    base.removeEventListener('pointerdown', tocar);
    base.removeEventListener('pointermove', mover);
    base.removeEventListener('pointerup', soltar);
    base.removeEventListener('pointercancel', soltar);
  };
}

/** Distância mínima, em pixels, para um arrasto contar como deslize. */
const DESLIZE_MINIMO = 24;

/**
 * Deslizar o dedo no tabuleiro também vira a cobra. Cada deslize longo o bastante
 * emite uma direção, e o ponto de partida se renova para permitir viradas seguidas.
 */
export function ouvirDeslize(area: HTMLElement, comandos: Pick<Comandos, 'aoVirar'>): () => void {
  let origem: { x: number; y: number; id: number } | null = null;

  function tocar(evento: PointerEvent) {
    if (evento.pointerType === 'mouse') return;
    origem = { x: evento.clientX, y: evento.clientY, id: evento.pointerId };
  }

  function mover(evento: PointerEvent) {
    if (!origem || evento.pointerId !== origem.id) return;
    const dx = evento.clientX - origem.x;
    const dy = evento.clientY - origem.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < DESLIZE_MINIMO) return;
    comandos.aoVirar(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'direita' : 'esquerda') : dy > 0 ? 'baixo' : 'cima');
    origem = { x: evento.clientX, y: evento.clientY, id: evento.pointerId };
  }

  function soltar() {
    origem = null;
  }

  area.addEventListener('pointerdown', tocar);
  area.addEventListener('pointermove', mover);
  area.addEventListener('pointerup', soltar);
  area.addEventListener('pointercancel', soltar);
  return () => {
    area.removeEventListener('pointerdown', tocar);
    area.removeEventListener('pointermove', mover);
    area.removeEventListener('pointerup', soltar);
    area.removeEventListener('pointercancel', soltar);
  };
}
