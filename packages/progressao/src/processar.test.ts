import { describe, expect, it } from 'vitest';
import { perfilNovo } from './perfil';
import { aplicarResultado } from './processar';
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

  it('promove ao chegar a 80 com 3 partidas, agenda revisão e desbloqueia a dependente', () => {
    let perfil = perfilNovo();
    // No Básico, a primeira promoção leva Adição ao Intermediário, o pré-requisito de Subtração.
    const resumos = [];
    for (let i = 0; i < 4; i++) {
      const r = jogar(perfil, 19, 20);
      perfil = r.perfil;
      resumos.push(r.resumo);
    }
    const promocao = resumos.find((r) => r.habilidades[0]?.promovido);
    expect(promocao).toBeDefined();
    expect(promocao!.habilidades[0]).toMatchObject({ estagioAntes: 'basico', estagioDepois: 'intermediario' });
    expect(promocao!.desbloqueadas).toEqual(['subtracao']);
    expect(perfil.habilidades.adicao).toMatchObject({ estagio: 'intermediario', maestria: 0, partidasNoEstagio: 0 });
    expect(perfil.habilidades.adicao?.revisao).toMatchObject({ estagio: 'basico', indice: 0 });
  });

  it('não promove com maestria alta antes de 3 partidas', () => {
    let perfil = perfilNovo();
    perfil.habilidades.adicao = {
      estagio: 'basico',
      maestria: 95,
      partidasNoEstagio: 1,
      ultimosDesempenhos: [],
      revisao: null,
      revisoesRuinsSeguidas: 0,
      enferrujada: false,
    };
    perfil = jogar(perfil, 20, 20).perfil;
    expect(perfil.habilidades.adicao?.estagio).toBe('basico');
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
