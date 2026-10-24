import { describe, expect, it } from 'vitest';
import { validarResultado } from './validacao';
import type { ConfigPartida, ResultadoJogo } from './contrato';

const config: ConfigPartida = { partidaId: 'p1', habilidadeId: 'multiplicacao', estagio: 'basico', ajuste: 0.5, modo: 'normal' };
const valido: ResultadoJogo = {
  partidaId: 'p1',
  pontuacao: 70,
  desempenho: [{ habilidadeId: 'multiplicacao', acertos: 14, tentativas: 15 }],
  ajudas: 0,
  status: 'concluida',
};

describe('validarResultado', () => {
  it('aceita um resultado plausível', () => {
    expect(validarResultado(valido, config)).toEqual([]);
  });

  it('recusa resultado de outra partida', () => {
    expect(validarResultado({ ...valido, partidaId: 'outra' }, config)).toContain('partida desconhecida');
  });

  it('recusa pontuação fora da faixa', () => {
    expect(validarResultado({ ...valido, pontuacao: 101 }, config)).toContain('pontuação fora de 0 a 100');
  });

  it('recusa mais acertos que tentativas', () => {
    const r = { ...valido, desempenho: [{ habilidadeId: 'multiplicacao', acertos: 5, tentativas: 4 }] };
    expect(validarResultado(r, config)).toContain('mais acertos que tentativas em multiplicacao');
  });
});
