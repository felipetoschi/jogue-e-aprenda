import { describe, expect, it } from 'vitest';
import { perfilNovo } from './perfil';
import { aplicarResultado, configParaPartida, estagiosLiberados } from './processar';
import { sugerirProximaPartida } from './sugestao';
import { config, HABILIDADES, resultado } from './teste-util';
import type { PerfilProgresso } from './tipos';

const agora = new Date('2026-03-10T15:00:00Z');

function jogar(perfil: PerfilProgresso, acertos: number, tentativas: number, estagio = perfil.habilidades.adicao?.estagio ?? 'basico') {
  return aplicarResultado(perfil, config({ estagio }), resultado(acertos, tentativas), HABILIDADES, agora);
}

describe('aplicarResultado', () => {
  it('soma XP e atualiza a maestria da habilidade jogada', () => {
    const { perfil, resumo } = jogar(perfilNovo(), 18, 20);
    expect(resumo.contou).toBe(true);
    expect(resumo.estrelas).toBe(3);
    expect(perfil.xp).toBe(resumo.xpGanho);
    expect(perfil.habilidades.adicao).toMatchObject({ estagio: 'basico', maestria: 36, partidasNoEstagio: 1 });
  });

  it('não altera o perfil recebido', () => {
    const original = perfilNovo();
    jogar(original, 18, 20);
    expect(original).toEqual(perfilNovo());
  });

  it('ignora partidas abandonadas', () => {
    const r = aplicarResultado(perfilNovo(), config(), resultado(10, 10, { status: 'abandonada' }), HABILIDADES, agora);
    expect(r.resumo.contou).toBe(false);
    expect(r.perfil).toEqual(perfilNovo());
  });

  it('sobe de estágio ao zerar (20 de 20), agenda revisão e desbloqueia a dependente', () => {
    const { perfil, resumo } = jogar(perfilNovo(), 20, 20);
    expect(resumo.zerou).toBe(true);
    expect(resumo.habilidades[0]).toMatchObject({ promovido: true, estagioAntes: 'basico', estagioDepois: 'intermediario' });
    expect(resumo.desbloqueadas).toEqual(['subtracao']);
    expect(perfil.habilidades.adicao).toMatchObject({ estagio: 'intermediario', maestria: 0, partidasNoEstagio: 0 });
    expect(perfil.habilidades.adicao?.revisao).toMatchObject({ estagio: 'basico', indice: 0 });
  });

  it('não sobe sem zerar, mesmo com maestria alta e muitas partidas', () => {
    let perfil = perfilNovo();
    perfil.habilidades.adicao = {
      estagio: 'basico',
      maestria: 95,
      partidasNoEstagio: 10,
      ultimosDesempenhos: [],
      revisao: null,
      revisoesRuinsSeguidas: 0,
      enferrujada: false,
    };
    const r = jogar(perfil, 19, 20);
    expect(r.resumo.zerou).toBe(false);
    expect(r.perfil.habilidades.adicao?.estagio).toBe('basico');
  });

  it('zerar num estágio anterior não faz subir', () => {
    const perfil = perfilNovo();
    perfil.habilidades.adicao = {
      estagio: 'intermediario',
      maestria: 0,
      partidasNoEstagio: 0,
      ultimosDesempenhos: [],
      revisao: null,
      revisoesRuinsSeguidas: 0,
      enferrujada: false,
    };
    const r = aplicarResultado(perfil, config({ estagio: 'basico' }), resultado(20, 20), HABILIDADES, agora);
    expect(r.perfil.habilidades.adicao?.estagio).toBe('intermediario');
  });

  it('dá o bônus da primeira partida só uma vez por dia', () => {
    const primeira = jogar(perfilNovo(), 0, 1);
    const segunda = jogar(primeira.perfil, 0, 1);
    expect(primeira.resumo.xpGanho - segunda.resumo.xpGanho).toBe(10);
  });
});

describe('sugerirProximaPartida', () => {
  it('sugere a habilidade aberta para quem está começando', () => {
    expect(sugerirProximaPartida(perfilNovo(), HABILIDADES, agora)).toMatchObject({
      habilidadeId: 'adicao',
      estagio: 'basico',
      modo: 'normal',
    });
  });

  it('prioriza uma revisão vencida', () => {
    const perfil = perfilNovo();
    perfil.habilidades.adicao = {
      estagio: 'intermediario',
      maestria: 10,
      partidasNoEstagio: 1,
      ultimosDesempenhos: [],
      revisao: { estagio: 'basico', indice: 0, venceEm: '2026-03-01T00:00:00Z' },
      revisoesRuinsSeguidas: 0,
      enferrujada: false,
    };
    expect(sugerirProximaPartida(perfil, HABILIDADES, agora)).toMatchObject({ habilidadeId: 'adicao', estagio: 'basico', modo: 'revisao' });
  });
});

describe('partidas que não contam', () => {
  it('não dá XP nem o bônus do dia a uma partida sem nenhuma tentativa', () => {
    const vazia = aplicarResultado(perfilNovo(), config(), resultado(0, 0), HABILIDADES, agora);
    expect(vazia.resumo).toMatchObject({ contou: false, naoContou: 'sem-tentativas', xpGanho: 0 });
    expect(vazia.perfil).toEqual(perfilNovo());
    // O bônus da primeira do dia continua disponível para a próxima partida de verdade.
    expect(jogar(vazia.perfil, 0, 1).resumo.xpGanho).toBe(15);
  });
});

describe('voltar a um estágio anterior', () => {
  const noIntermediario = () => {
    const perfil = perfilNovo();
    perfil.habilidades.adicao = {
      estagio: 'intermediario',
      maestria: 40,
      partidasNoEstagio: 2,
      ultimosDesempenhos: [],
      revisao: null,
      revisoesRuinsSeguidas: 0,
      enferrujada: false,
    };
    return perfil;
  };

  it('libera do estágio inicial até o atual', () => {
    expect(estagiosLiberados(noIntermediario(), HABILIDADES[0]!)).toEqual(['basico', 'intermediario']);
    expect(estagiosLiberados(perfilNovo(), HABILIDADES[0]!)).toEqual(['basico']);
  });

  it('monta a partida no estágio escolhido, mas nunca acima do atual', () => {
    expect(configParaPartida(noIntermediario(), HABILIDADES[0]!, 'normal', 'basico')).toMatchObject({ estagio: 'basico', modo: 'normal' });
    expect(configParaPartida(noIntermediario(), HABILIDADES[0]!, 'normal', 'mestre').estagio).toBe('intermediario');
  });

  it('dá XP sem mexer na maestria do estágio atual', () => {
    const { perfil, resumo } = aplicarResultado(noIntermediario(), config({ estagio: 'basico' }), resultado(20, 20), HABILIDADES, agora);
    expect(resumo.xpGanho).toBeGreaterThan(0);
    expect(perfil.habilidades.adicao).toMatchObject({ estagio: 'intermediario', maestria: 40, partidasNoEstagio: 2 });
  });
});
