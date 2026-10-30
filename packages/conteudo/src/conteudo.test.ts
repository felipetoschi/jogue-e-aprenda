import { ESTAGIOS } from '@jogue/sdk-jogo';
import { describe, expect, it } from 'vitest';
import { comSemente } from './aleatorio';
import { gerarQuestoes, HABILIDADES, MATERIAS } from './index';

describe('banco de conteúdo', () => {
  it('toda habilidade pertence a uma disciplina cadastrada e tem gerador', () => {
    for (const h of HABILIDADES) {
      expect(MATERIAS.some((m) => m.id === h.materiaId)).toBe(true);
      expect(gerarQuestoes(h.id, h.estagioInicial, 0.5, 1, { rng: comSemente(1) })).toHaveLength(1);
    }
  });

  it('gera perguntas com exatamente uma opção certa e explicação nas erradas', () => {
    const rng = comSemente(3);
    for (const h of HABILIDADES) {
      for (const estagio of ESTAGIOS) {
        for (const q of gerarQuestoes(h.id, estagio, 1, 10, { rng })) {
          expect(q.opcoes.filter((o) => o.correta)).toHaveLength(1);
          expect(new Set(q.opcoes.map((o) => o.texto)).size).toBe(q.opcoes.length);
          for (const o of q.opcoes.filter((o) => !o.correta)) expect(o.erro?.explicacao).toBeTruthy();
          expect(q.resolucao).toContain(q.opcoes.find((o) => o.correta)!.texto);
        }
      }
    }
  });

  it('"Todas as operações" mistura as quatro operações e conta para ela mesma', () => {
    const questoes = gerarQuestoes('todas-operacoes', 'intermediario', 0.5, 200, { rng: comSemente(9) });
    const sinais = new Set(questoes.map((q) => ['+', '−', '×', '÷'].find((s) => q.enunciado.includes(` ${s} `))));
    expect(sinais).toEqual(new Set(['+', '−', '×', '÷']));
    expect(questoes.every((q) => q.habilidadeId === 'todas-operacoes')).toBe(true);
  });

  it('sem pedido do jogo, usa 3 alternativas no Básico e 4 no Mestre', () => {
    expect(gerarQuestoes('multiplicacao', 'basico', 0, 1, { rng: comSemente(5) })[0]!.opcoes).toHaveLength(3);
    expect(gerarQuestoes('multiplicacao', 'mestre', 0, 1, { rng: comSemente(5) })[0]!.opcoes).toHaveLength(4);
  });

  it('dá letras às alternativas, na ordem, e respeita o número pedido pelo jogo', () => {
    const rng = comSemente(11);
    for (const alternativas of [2, 3, 4, 5]) {
      for (const h of HABILIDADES) {
        for (const estagio of ESTAGIOS) {
          for (const q of gerarQuestoes(h.id, estagio, 0.5, 5, { alternativas, rng })) {
            expect(q.opcoes.map((o) => o.letra)).toEqual(['A', 'B', 'C', 'D', 'E'].slice(0, alternativas));
            expect(q.opcoes.filter((o) => o.correta)).toHaveLength(1);
          }
        }
      }
    }
  });

  it('a alternativa certa cai tanto em A quanto em B, com duas alternativas', () => {
    const questoes = gerarQuestoes('adicao', 'basico', 0.5, 100, { alternativas: 2, rng: comSemente(4) });
    const letras = new Set(questoes.map((q) => q.opcoes.find((o) => o.correta)!.letra));
    expect(letras).toEqual(new Set(['A', 'B']));
  });

  it('recusa um número de alternativas fora de 2 a 5', () => {
    expect(() => gerarQuestoes('adicao', 'basico', 0.5, 1, { alternativas: 1 })).toThrow();
    expect(() => gerarQuestoes('adicao', 'basico', 0.5, 1, { alternativas: 6 })).toThrow();
  });
});

describe('Matemática', () => {
  it('deixa todas as operações abertas desde o início, começando no Básico', () => {
    for (const h of HABILIDADES.filter((h) => h.materiaId === 'matematica')) {
      expect(h.prerequisitos, h.id).toEqual([]);
      expect(h.estagioInicial, h.id).toBe('basico');
    }
  });
});
