import { describe, expect, it } from 'vitest';
import { validarResultado } from './validacao';
import type { ConfigPartida, ResultadoJogo } from './contrato';

const questao = { habilidadeId: 'multiplicacao', enunciado: '2 × 3 = ?', resolucao: '2 × 3 = 6', opcoes: [{ texto: '6', correta: true }] };
const config: ConfigPartida = {
  partidaId: 'p1',
  habilidadeId: 'multiplicacao',
  estagio: 'basico',
  ajuste: 0.5,
  modo: 'normal',
  rotulo: 'Multiplicação · Básico',
  questoes: Array.from({ length: 20 }, () => questao),
};
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

  it('recusa pontuação fora do padrão (acertos ÷ perguntas × 100)', () => {
    expect(validarResultado({ ...valido, pontuacao: 90 }, config)).toContain('pontuação fora do padrão');
  });

  it('recusa mais tentativas que perguntas enviadas', () => {
    const r = { ...valido, desempenho: [{ habilidadeId: 'multiplicacao', acertos: 21, tentativas: 21 }] };
    expect(validarResultado(r, config)).toContain('mais tentativas que perguntas enviadas em multiplicacao');
  });

  it('recusa mais acertos que tentativas', () => {
    const r = { ...valido, desempenho: [{ habilidadeId: 'multiplicacao', acertos: 5, tentativas: 4 }] };
    expect(validarResultado(r, config)).toContain('mais acertos que tentativas em multiplicacao');
  });
});

describe('padrão dos jogos', () => {
  it('zerar é acertar todas as perguntas, sem errar', async () => {
    const { zerou, pontuacaoPadrao, segundosPorPergunta } = await import('./padrao');
    expect(zerou(20, 20)).toBe(true);
    expect(zerou(19, 19)).toBe(false);
    expect(zerou(20, 21)).toBe(false);
    expect(pontuacaoPadrao(15, 20)).toBe(75);
    expect(segundosPorPergunta('basico', 0)).toBe(15);
    expect(segundosPorPergunta('basico', 1)).toBe(11.25);
  });
});
