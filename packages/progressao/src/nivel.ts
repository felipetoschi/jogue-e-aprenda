import { PARAMETROS, TITULOS } from './parametros';

/** XP acumulado necessário para chegar ao nível informado. */
export function xpParaNivel(nivel: number): number {
  const n = nivel - 1;
  return PARAMETROS.nivel.base * n + (PARAMETROS.nivel.incremento * n * (n + 1)) / 2;
}

export interface InfoNivel {
  nivel: number;
  titulo: string;
  xpNoNivel: number;
  xpParaProximo: number;
}

export function infoNivel(xp: number): InfoNivel {
  let nivel = 1;
  while (xpParaNivel(nivel + 1) <= xp) nivel++;
  const inicio = xpParaNivel(nivel);
  const titulo = TITULOS.find((t) => nivel >= t.nivelMinimo)?.titulo ?? 'Aprendiz';
  return { nivel, titulo, xpNoNivel: xp - inicio, xpParaProximo: xpParaNivel(nivel + 1) - inicio };
}
