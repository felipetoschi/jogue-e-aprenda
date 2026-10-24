import { describe, expect, it } from 'vitest';
import { ajusteFino } from './ajuste';
import { calcularEstrelas } from './estrelas';
import { atualizarMaestria } from './maestria';
import { infoNivel, xpParaNivel } from './nivel';
import { estadoInicial, perfilNovo } from './perfil';
import { pontosDominio, pontosMaximos, progressoMateria } from './desbloqueio';
import { aplicarRevisao } from './revisao';
import { HABILIDADES } from './teste-util';
import { calcularXp } from './xp';

describe('estrelas', () => {
  it('segue as faixas 50 / 70 / 90', () => {
    expect([49, 50, 69, 70, 89, 90, 100].map(calcularEstrelas)).toEqual([0, 1, 1, 2, 2, 3, 3]);
  });
});

describe('XP', () => {
  const base = { estagio: 'intermediario' as const, ajudas: 0, estrelas: 2, primeiraDoDia: false, partidasAnterioresHoje: 0 };

  it('reproduz o exemplo do plano: Intermediário, 82 pontos, primeira do dia = 28 XP', () => {
    expect(calcularXp({ ...base, pontuacao: 82, primeiraDoDia: true })).toBe(28);
  });

  it('dá metade do XP base com pontuação zero e o XP cheio com 100', () => {
    expect(calcularXp({ ...base, pontuacao: 0, estrelas: 0 })).toBe(10);
    expect(calcularXp({ ...base, pontuacao: 100, estrelas: 0 })).toBe(20);
  });

  it('desconta 10% por ajuda, até 30%', () => {
    expect(calcularXp({ ...base, pontuacao: 100, estrelas: 0, ajudas: 1 })).toBe(18);
    expect(calcularXp({ ...base, pontuacao: 100, estrelas: 0, ajudas: 9 })).toBe(14);
  });

  it('corta o XP pela metade a partir da 6ª partida repetida no dia', () => {
    expect(calcularXp({ ...base, pontuacao: 100, estrelas: 0, partidasAnterioresHoje: 4 })).toBe(20);
    expect(calcularXp({ ...base, pontuacao: 100, estrelas: 0, partidasAnterioresHoje: 5 })).toBe(10);
  });
});

describe('nível', () => {
  it('bate com a tabela de títulos do plano', () => {
    expect([5, 10, 20, 35, 50].map(xpParaNivel)).toEqual([450, 1575, 5700, 16575, 33075]);
    expect(infoNivel(0)).toMatchObject({ nivel: 1, titulo: 'Aprendiz', xpParaProximo: 75 });
    expect(infoNivel(1575)).toMatchObject({ nivel: 10, titulo: 'Estudioso', xpNoNivel: 0 });
    expect(infoNivel(33075).titulo).toBe('Lenda');
  });
});

describe('maestria', () => {
  it('reproduz o exemplo de Frações do plano', () => {
    const sequencia = [70, 85, 90, 88, 92];
    const valores: number[] = [];
    let m = 0;
    for (const d of sequencia) {
      m = atualizarMaestria(m, d, 10);
      valores.push(m);
    }
    expect(valores).toEqual([28, 50.8, 66.5, 75.1, 81.9]);
  });

  it('pesa menos partidas com poucas tentativas', () => {
    expect(atualizarMaestria(0, 100, 5)).toBe(40);
    expect(atualizarMaestria(0, 100, 1)).toBe(8);
  });
});

describe('ajuste fino', () => {
  const estado = { ...estadoInicial(HABILIDADES[0]!), maestria: 60 };

  it('parte da maestria atual', () => {
    expect(ajusteFino(estado)).toBe(0.6);
  });

  it('facilita depois de duas partidas ruins e dificulta depois de duas ótimas', () => {
    expect(ajusteFino({ ...estado, ultimosDesempenhos: [40, 30] })).toBe(0.45);
    expect(ajusteFino({ ...estado, ultimosDesempenhos: [95, 90] })).toBe(0.7);
  });

  it('fica sempre entre 0 e 1', () => {
    expect(ajusteFino({ ...estado, maestria: 5, ultimosDesempenhos: [10, 10] })).toBe(0);
    expect(ajusteFino({ ...estado, maestria: 98, ultimosDesempenhos: [100, 100] })).toBe(1);
  });
});

describe('revisão espaçada', () => {
  const agora = new Date('2026-01-01T12:00:00Z');
  const estado = {
    ...estadoInicial(HABILIDADES[0]!),
    revisao: { estagio: 'basico' as const, indice: 0, venceEm: agora.toISOString() },
  };

  it('avança para o próximo intervalo quando aprovada', () => {
    const r = aplicarRevisao(estado, 80, agora);
    expect(r.aprovada).toBe(true);
    expect(r.estado.revisao).toMatchObject({ indice: 1, venceEm: '2026-01-08T12:00:00.000Z' });
  });

  it('volta para 3 dias quando reprovada e enferruja após duas ruins seguidas', () => {
    const uma = aplicarRevisao(estado, 40, agora);
    expect(uma.estado.revisao?.indice).toBe(0);
    expect(uma.estado.enferrujada).toBe(false);
    const duas = aplicarRevisao(uma.estado, 40, agora);
    expect(duas.estado.enferrujada).toBe(true);
  });

  it('consolida depois do último intervalo', () => {
    const ultima = { ...estado, revisao: { ...estado.revisao, indice: 4 } };
    expect(aplicarRevisao(ultima, 90, agora).estado.revisao).toBeNull();
  });
});

describe('domínio da matéria', () => {
  const expressoes = { id: 'expressoes', nome: 'Expressões', materiaId: 'matematica', estagioInicial: 'intermediario' as const, prerequisitos: [] };

  it('não conta o estágio inicial como superado', () => {
    expect(progressoMateria(perfilNovo(), [...HABILIDADES, expressoes])).toBe(0);
  });

  it('chega a 100% com tudo no Mestre e domínio completo', () => {
    const perfil = perfilNovo();
    for (const def of [...HABILIDADES, expressoes]) {
      perfil.habilidades[def.id] = { ...estadoInicial(def), estagio: 'mestre', maestria: 95 };
    }
    expect(progressoMateria(perfil, [...HABILIDADES, expressoes])).toBe(1);
    expect(pontosDominio(perfil.habilidades.expressoes!, expressoes)).toBe(pontosMaximos(expressoes));
  });
});
