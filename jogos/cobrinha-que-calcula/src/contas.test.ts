import { ESTAGIOS } from '@jogue/sdk-jogo';
import { describe, expect, it } from 'vitest';
import { comSemente } from './aleatorio';
import { formatarNumero, gerarConta, HABILIDADES_SUPORTADAS } from './contas';

/** Avalia o texto da conta para conferir a resposta de forma independente. */
function avaliar(texto: string): number {
  const js = texto.replaceAll('.', '').replaceAll(',', '.').replaceAll('×', '*').replaceAll('÷', '/').replaceAll('−', '-');
  return Math.round(Function(`return (${js})`)() * 1000) / 1000;
}

describe('gerarConta', () => {
  const rng = comSemente(42);

  for (const habilidade of HABILIDADES_SUPORTADAS) {
    for (const estagio of ESTAGIOS) {
      it(`${habilidade} no ${estagio}: resposta certa, opções distintas e uma só correta`, () => {
        for (let i = 0; i < 200; i++) {
          for (const ajuste of [0, 0.5, 1]) {
            const quantidade = estagio === 'avancado' || estagio === 'mestre' ? 4 : 3;
            const conta = gerarConta(habilidade, estagio, ajuste, quantidade, rng);
            expect(avaliar(conta.texto)).toBe(conta.resposta);
            expect(conta.opcoes).toHaveLength(quantidade);
            expect(new Set(conta.opcoes.map((o) => o.valor)).size).toBe(quantidade);
            expect(conta.opcoes.filter((o) => o.correta)).toEqual([{ valor: conta.resposta, correta: true, tipoErro: null }]);
            if (conta.resposta >= 0) expect(conta.opcoes.every((o) => o.valor >= 0)).toBe(true);
          }
        }
      });
    }
  }

  it('não gera negativos nem decimais antes do Mestre', () => {
    for (const habilidade of HABILIDADES_SUPORTADAS) {
      for (const estagio of ['basico', 'intermediario', 'avancado'] as const) {
        for (let i = 0; i < 100; i++) {
          const conta = gerarConta(habilidade, estagio, 1, 4, rng);
          expect(conta.resposta).toBeGreaterThanOrEqual(0);
          expect(Number.isInteger(conta.resposta)).toBe(true);
        }
      }
    }
  });

  it('respeita as faixas da tabela de estágios', () => {
    for (let i = 0; i < 200; i++) {
      expect(gerarConta('adicao', 'basico', 1, 3, rng).resposta).toBeLessThanOrEqual(10);
      expect(gerarConta('adicao', 'intermediario', 1, 3, rng).resposta).toBeLessThan(100);
      const tabuada = gerarConta('multiplicacao', 'basico', 1, 3, rng).texto.split(' × ').map(Number);
      expect(tabuada[0]).toBeLessThanOrEqual(5);
    }
  });

  it('usa erros da tabuada como opções falsas na multiplicação', () => {
    const tipos = new Set<string>();
    for (let i = 0; i < 50; i++) {
      for (const o of gerarConta('multiplicacao', 'intermediario', 1, 3, rng).opcoes) if (o.tipoErro) tipos.add(o.tipoErro);
    }
    expect(tipos.has('vizinho-tabuada')).toBe(true);
  });
});

describe('formatarNumero', () => {
  it('usa vírgula decimal, ponto de milhar e sinal de menos tipográfico', () => {
    expect(formatarNumero(1.75)).toBe('1,75');
    expect(formatarNumero(1234)).toBe('1.234');
    expect(formatarNumero(-4.5)).toBe('−4,5');
  });
});
