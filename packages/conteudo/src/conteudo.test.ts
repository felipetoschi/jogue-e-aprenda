import { ESTAGIOS } from '@jogue/sdk-jogo';
import { describe, expect, it } from 'vitest';
import { comSemente } from './aleatorio';
import { gerarQuestoes, HABILIDADES, MATERIAS } from './index';

describe('banco de conteúdo', () => {
  it('toda habilidade pertence a uma disciplina cadastrada e tem gerador', () => {
    for (const h of HABILIDADES) {
      expect(MATERIAS.some((m) => m.id === h.materiaId)).toBe(true);
      expect(gerarQuestoes(h.id, h.estagioInicial, 0.5, 1, comSemente(1))).toHaveLength(1);
    }
  });

  it('gera perguntas com exatamente uma opção certa e explicação nas erradas', () => {
    const rng = comSemente(3);
    for (const h of HABILIDADES) {
      for (const estagio of ESTAGIOS) {
        for (const q of gerarQuestoes(h.id, estagio, 1, 10, rng)) {
          expect(q.opcoes.filter((o) => o.correta)).toHaveLength(1);
          expect(new Set(q.opcoes.map((o) => o.texto)).size).toBe(q.opcoes.length);
          for (const o of q.opcoes.filter((o) => !o.correta)) expect(o.erro?.explicacao).toBeTruthy();
          expect(q.resolucao).toContain(q.opcoes.find((o) => o.correta)!.texto);
        }
      }
    }
  });

  it('usa 3 opções no Básico e 4 no Mestre', () => {
    expect(gerarQuestoes('multiplicacao', 'basico', 0, 1, comSemente(5))[0]!.opcoes).toHaveLength(3);
    expect(gerarQuestoes('multiplicacao', 'mestre', 0, 1, comSemente(5))[0]!.opcoes).toHaveLength(4);
  });
});
