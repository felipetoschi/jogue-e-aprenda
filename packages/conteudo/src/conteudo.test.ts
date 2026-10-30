import { ESTAGIOS } from '@jogue/sdk-jogo';
import { describe, expect, it } from 'vitest';
import { comSemente } from './aleatorio';
import { ESTADOS, PAISES } from './geografia/dados';
import { FATOS_BRASIL, FATOS_MUNDO } from './historia/dados';
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

describe('Geografia', () => {
  const geografia = HABILIDADES.filter((h) => h.materiaId === 'geografia');

  it('tem os temas abertos desde o início, começando no Básico', () => {
    expect(geografia.map((h) => h.id)).toEqual(['estados-capitais', 'regioes-brasil', 'paises-capitais', 'continentes', 'todos-temas-geografia']);
    for (const h of geografia) {
      expect(h.prerequisitos, h.id).toEqual([]);
      expect(h.estagioInicial, h.id).toBe('basico');
    }
    expect(MATERIAS.find((m) => m.id === 'geografia')?.disponivel).toBe(true);
  });

  it('não repete pergunta numa partida de 20, em nenhum tema e estágio', () => {
    const rng = comSemente(21);
    for (const h of geografia) {
      for (const estagio of ESTAGIOS) {
        for (let partida = 0; partida < 5; partida++) {
          const questoes = gerarQuestoes(h.id, estagio, 0.5, 20, { alternativas: 2, rng });
          const chaves = questoes.map((q) => `${q.enunciado}|${q.opcoes.find((o) => o.correta)!.texto}`);
          expect(new Set(chaves).size, `${h.id} ${estagio}`).toBe(20);
        }
      }
    }
  });

  it('textos curtos, para caber no celular', () => {
    const rng = comSemente(8);
    for (const h of geografia) {
      for (const estagio of ESTAGIOS) {
        for (const q of gerarQuestoes(h.id, estagio, 1, 20, { alternativas: 2, rng })) {
          expect(q.enunciado.length, q.enunciado).toBeLessThanOrEqual(36);
          for (const o of q.opcoes) expect(o.texto.length, o.texto).toBeLessThanOrEqual(20);
        }
      }
    }
  });

  it('no Básico de capitais brasileiras, só estados conhecidos', () => {
    const conhecidos = new Set(ESTADOS.filter((e) => e.fama <= 2).map((e) => e.capital));
    for (const q of gerarQuestoes('estados-capitais', 'basico', 1, 100, { alternativas: 2, rng: comSemente(2) })) {
      for (const o of q.opcoes) expect(conhecidos.has(o.texto), o.texto).toBe(true);
    }
  });

  it('a pegadinha (cidade famosa) aparece no Mestre de países', () => {
    const questoes = gerarQuestoes('paises-capitais', 'mestre', 0.5, 200, { alternativas: 2, rng: comSemente(6) });
    const australia = questoes.find((q) => q.enunciado === 'Capital da Austrália?');
    expect(australia?.opcoes.map((o) => o.texto).sort()).toEqual(['Camberra', 'Sydney']);
  });

  it('dados consistentes: 27 unidades, siglas e capitais únicas', () => {
    expect(ESTADOS).toHaveLength(27);
    expect(new Set(ESTADOS.map((e) => e.sigla)).size).toBe(27);
    expect(new Set(ESTADOS.map((e) => e.capital)).size).toBe(27);
    expect(new Set(PAISES.map((p) => p.capital)).size).toBe(PAISES.length);
    expect(new Set(PAISES.map((p) => p.nome)).size).toBe(PAISES.length);
  });
});

describe('História', () => {
  const historia = HABILIDADES.filter((h) => h.materiaId === 'historia');
  const certa = (q: { opcoes: { correta: boolean; texto: string }[] }) => q.opcoes.find((o) => o.correta)!.texto;
  const errada = (q: { opcoes: { correta: boolean; texto: string }[] }) => q.opcoes.find((o) => !o.correta)!.texto;

  it('tem Datas do Brasil, Datas do mundo e Brasil e mundo, abertas desde o início', () => {
    expect(historia.map((h) => h.id)).toEqual(['datas-brasil', 'datas-mundo', 'todas-datas']);
    for (const h of historia) expect(h.prerequisitos).toEqual([]);
  });

  it('não repete pergunta numa partida de 20 e usa textos curtos', () => {
    const rng = comSemente(31);
    for (const h of historia) {
      for (const estagio of ESTAGIOS) {
        for (let partida = 0; partida < 5; partida++) {
          const questoes = gerarQuestoes(h.id, estagio, 0.5, 20, { alternativas: 2, rng });
          expect(new Set(questoes.map((q) => `${q.enunciado}|${certa(q)}`)).size, `${h.id} ${estagio}`).toBe(20);
          for (const q of questoes) {
            expect(q.enunciado.length, q.enunciado).toBeLessThanOrEqual(36);
            for (const o of q.opcoes) expect(o.texto.length, o.texto).toBeLessThanOrEqual(20);
          }
        }
      }
    }
  });

  it('o ano errado fica mais perto do certo a cada estágio, e nunca no futuro', () => {
    const faixa = { basico: [10, 40], intermediario: [4, 15], avancado: [2, 8], mestre: [1, 4] } as const;
    const rng = comSemente(12);
    for (const estagio of ESTAGIOS) {
      for (const q of gerarQuestoes('todas-datas', estagio, 0.5, 200, { alternativas: 2, rng }).filter((q) => q.enunciado.startsWith('Ano '))) {
        const distancia = Math.abs(Number(certa(q)) - Number(errada(q)));
        expect(distancia, q.enunciado).toBeGreaterThanOrEqual(faixa[estagio][0]);
        expect(distancia, q.enunciado).toBeLessThanOrEqual(faixa[estagio][1]);
        expect(Number(errada(q))).toBeLessThanOrEqual(2025);
      }
    }
  });

  it('em "Qual veio primeiro?", a certa é mesmo a mais antiga', () => {
    const anos = new Map([...FATOS_BRASIL, ...FATOS_MUNDO].map((f) => [f.curto, f.ano]));
    const questoes = gerarQuestoes('todas-datas', 'mestre', 0.5, 300, { alternativas: 4, rng: comSemente(5) });
    const ordem = questoes.filter((q) => q.enunciado === 'Qual veio primeiro?');
    expect(ordem.length).toBeGreaterThan(0);
    for (const q of ordem) {
      const anoCerto = anos.get(certa(q))!;
      for (const o of q.opcoes.filter((o) => !o.correta)) expect(anos.get(o.texto)!).toBeGreaterThan(anoCerto);
    }
  });

  it('no Básico, só fatos conhecidos', () => {
    const conhecidos = new Set([...FATOS_BRASIL, ...FATOS_MUNDO].filter((f) => f.fama <= 2).map((f) => String(f.ano)));
    for (const q of gerarQuestoes('todas-datas', 'basico', 1, 100, { alternativas: 2, rng: comSemente(3) })) {
      expect(conhecidos.has(certa(q)), q.enunciado).toBe(true);
    }
  });

  it('dados consistentes: nomes curtos únicos e nenhum com o ano no texto', () => {
    const fatos = [...FATOS_BRASIL, ...FATOS_MUNDO];
    expect(new Set(fatos.map((f) => f.curto)).size).toBe(fatos.length);
    for (const f of fatos) {
      expect(f.curto.length, f.curto).toBeLessThanOrEqual(20);
      expect(`${f.nome} ${f.curto}`, f.nome).not.toContain(String(f.ano));
    }
  });
});
