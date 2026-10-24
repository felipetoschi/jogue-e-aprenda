import { describe, expect, it } from 'vitest';
import { comSemente } from './aleatorio';
import { avancar, criarJogo, dentroDoBloco, virar, type EstadoJogo, type Posicao } from './jogo';
import { LADO_OPCAO, META_CONTAS, TAMANHO_TABULEIRO } from './regras';

const rng = comSemente(7);
const novo = () => criarJogo({ habilidadeId: 'multiplicacao', estagio: 'basico', ajuste: 0 }, rng);

/** Avança exatamente um passo da cobra. */
const umPasso = (e: EstadoJogo) => avancar(e, e.segundosPorPasso, rng);

/** Coloca a opção pedida logo à frente da cabeça. */
function porOpcaoNaFrente(e: EstadoJogo, correta: boolean) {
  const cabeca = e.cobra[0]!;
  const alvo = e.opcoes.find((o) => o.correta === correta)!;
  alvo.pos = { x: cabeca.x + 1, y: cabeca.y };
  for (const o of e.opcoes) if (o !== alvo) o.pos = { x: 0, y: 0 };
}

describe('jogo da cobrinha', () => {
  it('começa com 3 segmentos, energia cheia e opções fora do corpo', () => {
    const e = novo();
    expect(e.cobra).toHaveLength(3);
    expect(e.energia).toBe(1);
    expect(e.opcoes).toHaveLength(3);
    for (const o of e.opcoes) expect(e.cobra.some((p) => dentroDoBloco(p, o.pos))).toBe(false);
  });

  it('cresce, pontua e troca a conta ao comer a certa', () => {
    const e = novo();
    porOpcaoNaFrente(e, true);
    const contaAntes = e.conta;
    e.energia = 0.5;
    expect(umPasso(e)).toEqual([{ tipo: 'acerto' }]);
    expect(e.acertos).toBe(1);
    expect(e.tentativas).toBe(1);
    expect(e.energia).toBe(1);
    expect(e.conta).not.toBe(contaAntes);
    umPasso(e);
    expect(e.cobra).toHaveLength(4);
  });

  it('termina a partida ao comer uma errada, guardando a conta para mostrar resolvida', () => {
    const e = novo();
    porOpcaoNaFrente(e, false);
    const conta = e.conta;
    const [evento] = umPasso(e);
    expect(evento).toMatchObject({ tipo: 'fim', fim: { motivo: 'erro', conta } });
    expect(e.tentativas).toBe(1);
    expect(e.acertos).toBe(0);
  });

  it('termina quando a energia acaba e conta como tentativa', () => {
    const e = novo();
    const [evento] = avancar(e, e.segundosPorConta + 0.01, rng);
    expect(evento).toMatchObject({ tipo: 'fim', fim: { motivo: 'energia' } });
    expect(e.tentativas).toBe(1);
  });

  it('termina ao bater na borda, sem contar tentativa', () => {
    const e = novo();
    e.opcoes = [];
    let fim;
    for (let i = 0; i < TAMANHO_TABULEIRO && !fim; i++) fim = umPasso(e).find((ev) => ev.tipo === 'fim');
    expect(fim).toMatchObject({ fim: { motivo: 'borda' } });
    expect(e.tentativas).toBe(0);
  });

  it('termina ao bater no próprio corpo', () => {
    const e = novo();
    e.opcoes = [];
    // Cobra em gancho descendo: a casa abaixo da cabeça é um segmento do meio do corpo.
    e.cobra = [{ x: 5, y: 5 }, { x: 5, y: 4 }, { x: 6, y: 4 }, { x: 6, y: 5 }, { x: 6, y: 6 }, { x: 5, y: 6 }, { x: 4, y: 6 }];
    e.direcao = 'baixo';
    const [evento] = umPasso(e);
    expect(evento).toMatchObject({ tipo: 'fim', fim: { motivo: 'corpo' } });
  });

  it('não deixa dar meia-volta e guarda no máximo 2 viradas', () => {
    const e = novo();
    virar(e, 'esquerda');
    expect(e.fila).toEqual([]);
    virar(e, 'cima');
    virar(e, 'esquerda');
    virar(e, 'baixo');
    expect(e.fila).toEqual(['cima', 'esquerda']);
  });

  it('vence ao completar a meta de contas', () => {
    const e = novo();
    e.acertos = META_CONTAS - 1;
    porOpcaoNaFrente(e, true);
    const [evento] = umPasso(e);
    expect(evento).toMatchObject({ tipo: 'fim', fim: { motivo: 'vitoria' } });
  });

  it('posiciona as opções longe da cabeça e separadas entre si', () => {
    for (let i = 0; i < 100; i++) {
      const e = criarJogo({ habilidadeId: 'adicao', estagio: 'mestre', ajuste: 1 }, rng);
      const cabeca: Posicao = e.cobra[0]!;
      for (const o of e.opcoes) {
        expect(o.pos.x + LADO_OPCAO).toBeLessThanOrEqual(TAMANHO_TABULEIRO);
        expect(Math.abs(o.pos.x - cabeca.x) + Math.abs(o.pos.y - cabeca.y)).toBeGreaterThanOrEqual(3);
      }
      for (const a of e.opcoes)
        for (const b of e.opcoes)
          if (a !== b) expect(Math.abs(a.pos.x - b.pos.x) > LADO_OPCAO || Math.abs(a.pos.y - b.pos.y) > LADO_OPCAO).toBe(true);
    }
  });
});
