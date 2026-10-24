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

/**
 * Setas na tela para celular. A virada acontece ao encostar o dedo (pointerdown),
 * sem esperar soltar, para responder tão rápido quanto o teclado.
 */
export function ouvirSetas(container: HTMLElement, comandos: Pick<Comandos, 'aoVirar'>): () => void {
  function tocar(evento: PointerEvent) {
    const botao = (evento.target as HTMLElement).closest<HTMLElement>('[data-direcao]');
    if (!botao) return;
    evento.preventDefault();
    comandos.aoVirar(botao.dataset.direcao as Direcao);
    botao.classList.add('apertada');
    setTimeout(() => botao.classList.remove('apertada'), 120);
  }
  container.addEventListener('pointerdown', tocar);
  return () => container.removeEventListener('pointerdown', tocar);
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
