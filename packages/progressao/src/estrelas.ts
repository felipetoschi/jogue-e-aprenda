import { PARAMETROS } from './parametros';

/** 0 a 3 estrelas a partir da pontuação da partida. */
export function calcularEstrelas(pontuacao: number): 0 | 1 | 2 | 3 {
  const [uma, duas, tres] = PARAMETROS.estrelas;
  if (pontuacao >= tres) return 3;
  if (pontuacao >= duas) return 2;
  if (pontuacao >= uma) return 1;
  return 0;
}
